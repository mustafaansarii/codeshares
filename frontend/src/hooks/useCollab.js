import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness';
import collabService from '../services/collab.service';

// Binary message framing — first byte is the type.
const TYPE_SNAPSHOT = 0;  // full Yjs state  -> relay + persisted by server
const TYPE_UPDATE = 1;    // incremental     -> relay only
const TYPE_AWARENESS = 2; // cursors/presence-> relay only

const ORIGIN = 'remote'; // marks updates that came off the wire, so we don't echo them back

/**
 * Binds a Monaco editor to a shared Yjs document over a WebSocket relay, giving
 * real-time collaborative editing with live remote cursors and presence.
 *
 * @param editor     the Monaco editor instance (null until mounted)
 * @param sessionId  collab room id (null = collaboration disabled)
 * @param user       { name, color } shown on this participant's remote cursor
 * @param initialCode seed content inserted by the owner when the doc is empty
 * @param isOwner    only the owner seeds initial content (avoids duplication)
 */
export function useCollab({ editor, sessionId, user, initialCode, isOwner }) {
    const [connected, setConnected] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!editor || !sessionId) return undefined;

        let disposed = false;
        let binding, awareness, ws, ydoc;
        let snapshotTimer;

        (async () => {
            let ticket;
            try {
                ticket = await collabService.getWsTicket();
            } catch {
                return;
            }
            if (disposed) return;

            ydoc = new Y.Doc();
            const ytext = ydoc.getText('monaco');
            awareness = new Awareness(ydoc);
            awareness.setLocalStateField('user', user);

            ws = new WebSocket(collabService.wsUrl(sessionId, ticket));
            ws.binaryType = 'arraybuffer';

            const wsSend = (type, payload) => {
                if (!ws || ws.readyState !== WebSocket.OPEN) return;
                const out = new Uint8Array(payload.length + 1);
                out[0] = type;
                out.set(payload, 1);
                ws.send(out);
            };

            const refreshUsers = () => {
                const states = [...awareness.getStates().values()]
                    .map((s) => s.user)
                    .filter(Boolean);
                setUsers(states);
            };

            ws.onopen = () => {
                setConnected(true);
                // Announce our presence immediately.
                wsSend(TYPE_AWARENESS, encodeAwarenessUpdate(awareness, [ydoc.clientID]));
                // Owner seeds starter code once, only if nobody has populated the doc.
                setTimeout(() => {
                    if (!disposed && isOwner && ytext.length === 0 && initialCode) {
                        ytext.insert(0, initialCode);
                    }
                }, 500);
            };

            ws.onclose = () => setConnected(false);

            ws.onmessage = (event) => {
                const data = new Uint8Array(event.data);
                if (data.length === 0) return;
                const type = data[0];
                const body = data.subarray(1);
                if (type === TYPE_SNAPSHOT || type === TYPE_UPDATE) {
                    Y.applyUpdate(ydoc, body, ORIGIN);
                } else if (type === TYPE_AWARENESS) {
                    applyAwarenessUpdate(awareness, body, ORIGIN);
                    refreshUsers();
                }
            };

            // Local edits → push incremental update now (snappy), debounce a full snapshot for persistence.
            ydoc.on('update', (update, origin) => {
                if (origin === ORIGIN) return;
                wsSend(TYPE_UPDATE, update);
                clearTimeout(snapshotTimer);
                snapshotTimer = setTimeout(
                    () => wsSend(TYPE_SNAPSHOT, Y.encodeStateAsUpdate(ydoc)),
                    800,
                );
            });

            awareness.on('update', ({ added, updated, removed }, origin) => {
                if (origin !== ORIGIN) {
                    wsSend(TYPE_AWARENESS, encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed]));
                }
                refreshUsers();
            });

            binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), awareness);
        })();

        return () => {
            disposed = true;
            clearTimeout(snapshotTimer);
            if (binding) binding.destroy();
            if (awareness) awareness.destroy();
            if (ws) ws.close();
            if (ydoc) ydoc.destroy();
            setConnected(false);
            setUsers([]);
        };
    }, [editor, sessionId, isOwner, initialCode, user]);

    return { connected, users };
}
