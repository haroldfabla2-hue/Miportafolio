# Research: Scalable Notification System Architecture

This document analyzes the current notification system (Polling) versus state-of-the-art architectures used in enterprise applications.

## 1. Current Architecture vs. "Best in Class"

| Feature | Current System (Polling) | Best Practice (Event-Driven + WebSockets) |
| :--- | :--- | :--- |
| **Real-Time** | No (Up to 60s delay) | Yes (<100ms latency) |
| **Server Load** | High (Requests even when empty) | Low (Push on demand) |
| **Scalability** | Poor (DB bottleneck on high users) | High (Stateless Gateways + Redis Adapter) |
| **Reliability** | Good (Simple) | High (Queues ensure delivery even if service down) |
| **Channels** | In-App only | Multi-channel (In-App, Email, Push, SMS) |

## 2. Recommended Architecture for Iris CRM

Based on the research, the optimal architecture for a CRM with Chat features (which you have) is **WebSockets (Socket.io) with Redis**.

### Components:
1.  **Notification Producer**: Your Business Logic (Services) emits events (e.g., `TaskAssigned`).
2.  **Message Queue (BullMQ)**: Buffers events to ensure reliability. If the WebSocket server restarts, notifications aren't lost.
3.  **Notification Engine**: A worker processes jobs from the queue, saves to DB, and determines channels (Email vs In-App).
4.  **Real-Time Gateway (Socket.io)**: Pushes the notification to the connected client instantly.

### Why WebSockets over SSE?
- **Bidirectional**: Allows the client to send "Read Receipts" or "Typing Indicators" (for your Chat module) over the same connection.
- **Ecosystem**: Socket.io handles reconnection, rooms (e.g., Project Rooms), and fallbacks automatically.
- **NestJS Support**: NestJS has first-class integration for Socket.io Gateways.

## 3. Database Schema Optimization

The current `Notification` table is decent, but for scale, it should arguably be split or optimized.

**Proposed High-Performance Schema (PostgreSQL):**

```sql
-- 1. Notification Types (Templates)
CREATE TABLE notification_templates (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE, -- e.g., 'TASK_ASSIGNED'
  title_template TEXT, -- 'New Task: {{title}}'
  body_template TEXT,
  default_channels JSONB -- ['IN_APP', 'EMAIL']
);

-- 2. User Preferences
CREATE TABLE user_notification_settings (
  user_id UUID,
  template_code VARCHAR(50),
  channels JSONB, -- User overrides: ['IN_APP'] (User disabled Email)
  PRIMARY KEY (user_id, template_code)
);

-- 3. The Log (History)
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  type VARCHAR(50),
  data JSONB, -- { "title": "Fix Bug", "id": "123" }
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at); -- Partition logs by month for speed
```

## 4. Migration Plan (If we upgrade)

1.  **Install Gateway**: Add `nestjs/platform-socket.io` and `nestjs/websockets`.
2.  **Redis**: Set up Redis for Pub/Sub (critical for scaling multiple server instances later).
3.  **Refactor**: Change `fetchNotifications` polling to `socket.on('notification')`.
4.  **Queue**: Implement BullMQ for sending Emails/Push in the background without blocking the API.

## Conclusion

Your current system is **sufficient for a single-server MVP** but will struggle at scale. The "Gold Standard" is **NestJS + BullMQ + Socket.io + Redis**. Given you already have a `ChatModule` planned, implementing WebSockets is a logical next step to unify Real-time Chat and Notifications.
