package com.codeshare.websocket;

import com.codeshare.repo.CollabSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dumb-but-durable Yjs relay. The server never interprets CRDT contents — it forwards
 * binary messages to every other peer in the same room and persists the latest full
 * snapshot so sessions survive reloads, late joins, and restarts.
 *
 * Message framing: first byte is the type.
 *   0 = SNAPSHOT   full Yjs state  -> relay + persist
 *   1 = UPDATE     incremental     -> relay only
 *   2 = AWARENESS  cursors/presence-> relay only
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CollabWebSocketHandler extends BinaryWebSocketHandler {

    private static final byte TYPE_SNAPSHOT = 0;

    /** Minimum gap between DB writes per room, to avoid hammering on every debounced snapshot. */
    private static final long PERSIST_THROTTLE_MS = 3000;

    private final CollabSessionRepository collabSessionRepository;

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        String sessionId = (String) session.getAttributes().get(CollabHandshakeInterceptor.ATTR_SESSION_ID);
        Room room = rooms.computeIfAbsent(sessionId, this::loadRoom);

        room.members.add(session);
        log.debug("Collab join: room={} members={}", sessionId, room.members.size());

        // Bring the newcomer up to date with the stored document state.
        byte[] snapshot = room.snapshot;
        if (snapshot != null && snapshot.length > 0) {
            send(session, frame(TYPE_SNAPSHOT, snapshot));
        }
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        String sessionId = (String) session.getAttributes().get(CollabHandshakeInterceptor.ATTR_SESSION_ID);
        Room room = rooms.get(sessionId);
        if (room == null) {
            return;
        }

        ByteBuffer buffer = message.getPayload();
        if (!buffer.hasRemaining()) {
            return;
        }

        byte[] payload = new byte[buffer.remaining()];
        buffer.get(payload);

        if (payload[0] == TYPE_SNAPSHOT && payload.length > 1) {
            byte[] state = new byte[payload.length - 1];
            System.arraycopy(payload, 1, state, 0, state.length);
            room.snapshot = state;
            maybePersist(sessionId, room);
        }

        // Relay verbatim to every other peer in the room.
        BinaryMessage relay = new BinaryMessage(payload);
        for (WebSocketSession peer : room.members) {
            if (peer.isOpen() && !peer.getId().equals(session.getId())) {
                send(peer, relay);
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = (String) session.getAttributes().get(CollabHandshakeInterceptor.ATTR_SESSION_ID);
        Room room = rooms.get(sessionId);
        if (room == null) {
            return;
        }

        room.members.remove(session);
        log.debug("Collab leave: room={} members={}", sessionId, room.members.size());

        if (room.members.isEmpty()) {
            persist(sessionId, room.snapshot);
            rooms.remove(sessionId);
        }
    }

    // ── persistence ─────────────────────────────────────────────────────────────

    private void maybePersist(String sessionId, Room room) {
        long now = Instant.now().toEpochMilli();
        if (now - room.lastPersistedAt >= PERSIST_THROTTLE_MS) {
            room.lastPersistedAt = now;
            persist(sessionId, room.snapshot);
        }
    }

    private void persist(String sessionId, byte[] snapshot) {
        if (snapshot == null) {
            return;
        }
        collabSessionRepository.findBySessionId(sessionId).ifPresent(entity -> {
            entity.setDocState(snapshot);
            collabSessionRepository.save(entity);
        });
    }

    private Room loadRoom(String sessionId) {
        Room room = new Room();
        collabSessionRepository.findBySessionId(sessionId)
                .ifPresent(entity -> room.snapshot = entity.getDocState());
        return room;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private BinaryMessage frame(byte type, byte[] body) {
        byte[] out = new byte[body.length + 1];
        out[0] = type;
        System.arraycopy(body, 0, out, 1, body.length);
        return new BinaryMessage(out);
    }

    private void send(WebSocketSession session, BinaryMessage message) {
        try {
            synchronized (session) { // WebSocketSession#sendMessage is not thread-safe
                session.sendMessage(message);
            }
        } catch (IOException e) {
            log.warn("Collab send failed: {}", e.getMessage());
        }
    }

    private static final class Room {
        final Set<WebSocketSession> members = ConcurrentHashMap.newKeySet();
        volatile byte[] snapshot;
        volatile long lastPersistedAt;
    }
}
