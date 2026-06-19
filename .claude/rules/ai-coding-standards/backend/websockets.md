# WebSockets

Rules for real-time features. Read with `backend/graphql.md` and `core/05-security-baseline.md`.

## WebSocket vs GraphQL Subscription (deterministic)

- **GraphQL subscription:** real-time updates to entities already in the graph that the UI
  queries (order status, notification count). Reuses the GraphQL type system and auth.
- **Raw WebSocket (NestJS Gateway):** high-frequency, low-latency, or custom-protocol
  real-time — presence, typing indicators, live cursors, game/match state, collaborative
  editing. Use when the GraphQL layer's overhead or shape does not fit.

If neither real-time mechanism is required, do not add one. Polling a REST/GraphQL endpoint
is acceptable for low-frequency updates.

## Core rules

1. **Authenticate the connection.** Validate the JWT during the handshake/connection event.
   Reject unauthenticated sockets immediately. Never trust client-supplied identity on
   subsequent messages — bind the authenticated user to the socket at connect time.
2. **Authorize every action.** Subscribing to a room/channel is an authorization decision
   (e.g. the user must belong to the conversation). Check it server-side.
3. **Typed event contract.** Define explicit, versioned event names and payload types shared
   conceptually between client and server. Never send raw entities. Payloads carry only the
   minimal fields the client needs.
4. **Rooms/namespaces for scoping.** Broadcast to specific rooms, never globally. A user
   only receives events for resources they are authorized to see.
5. **Minimal, predictable payloads.** Send deltas/identifiers, not whole objects, where the
   client can resolve detail via GraphQL/REST. Keep messages small and consistent.
6. **Backpressure and rate limits.** Throttle inbound messages per socket. Cap message size.
   Drop or coalesce high-frequency updates (e.g. cursor moves) on the server.
7. **Lifecycle handling.** Handle connect, disconnect, and error explicitly. Clean up room
   memberships and resources on disconnect.

## NestJS Gateway structure

The gateway is the transport edge — like a controller. It validates and delegates to a
service; it holds no business logic.

```ts
@WebSocketGateway({ namespace: "chat", cors: { origin: ALLOWED_ORIGINS } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    const user = await this.chatService.authenticate(socket.handshake);
    if (!user) {
      socket.disconnect(true);
      return;
    }
    socket.data.userId = user.id;
  }

  @SubscribeMessage("message:send")
  async onMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() payload: SendMessagePayload,
  ): Promise<void> {
    await this.chatService.sendMessage(socket.data.userId, payload);
  }

  handleDisconnect(socket: AuthenticatedSocket): void {
    this.chatService.handleDisconnect(socket.data.userId);
  }
}
```

- Validate `@MessageBody()` payloads with the same schema discipline as HTTP DTOs.
- Use a Redis adapter for the gateway when running multiple instances so broadcasts reach
  all nodes (see `backend/caching-redis.md`).

## Frontend rules

- A single typed socket client lives in `services/` (or `lib/realtime/`), not in components.
- Components subscribe via a hook (`useChatChannel(conversationId)`) that manages connect,
  subscribe, cleanup on unmount, and reconnection.
- The connection URL comes from validated config (`NEXT_PUBLIC_WS_URL`), never a literal.
- Implement reconnection with backoff and re-authentication. On reconnect, re-fetch
  authoritative state via GraphQL/REST rather than assuming no events were missed.
- Update TanStack Query cache from socket events instead of holding a parallel store, so
  server state has one source of truth.

## Payload typing example

```ts
type MessageReceivedEvent = {
  conversationId: string;
  messageId: string;
  senderId: string;
  preview: string; // minimal; full content fetched on demand
  sentAt: string;  // ISO 8601 UTC
};
```
