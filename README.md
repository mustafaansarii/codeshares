  Browser A (Monaco)              Browser B (Monaco)
        │ y-monaco                      │ y-monaco
        │ Yjs doc (CRDT)                │ Yjs doc (CRDT)
        └──────── WebSocket ───────┬────┘
                                   │  (binary Yjs update messages,
                                   │   scoped to a room = sessionId)
                          ┌────────▼─────────┐
                          │  Spring Boot     │  relays updates to all
                          │  WebSocketHandler│  peers in the same room,
                          │  (room registry) │  + persists snapshots
                          └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │   PostgreSQL     │  collab_session table
                          │                  │  (doc snapshot, members)
                          └──────────────────┘
