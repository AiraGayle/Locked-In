// TODO: install ws — npm install ws
// TODO: import { WebSocketServer } from 'ws'
// TODO: import jwt from 'jsonwebtoken' for authenticating WS connections

// initWebSocket(server)
// TODO: create a WebSocketServer attached to the existing HTTP server
// TODO: on 'connection', read the token from the query string (?token=...)
// TODO: verify the token — close the socket immediately if invalid
// TODO: attach userId and roomId to the socket object for reference
// TODO: add the socket to a roomId → Set<WebSocket> map so you can broadcast per room

// Message types to handle (ws.on('message', ...)):
// TODO: { type: 'TIMER_START', payload: { duration } }
//        → update user's timer status in DB, broadcast to room
// TODO: { type: 'TIMER_PAUSE' }
//        → update status to 'paused', broadcast to room
// TODO: { type: 'TIMER_COMPLETE' }
//        → update status to 'completed', trigger session save, broadcast to room
// TODO: { type: 'TIMER_SYNC_REQUEST' }
//        → send current state of all members in the room back to the requester

// on 'close':
// TODO: remove socket from the room map
// TODO: broadcast { type: 'MEMBER_LEFT', userId } to remaining room members

// broadcast(roomId, message) — helper
// TODO: iterate over all sockets in rooms[roomId]
// TODO: send JSON.stringify(message) to each open socket