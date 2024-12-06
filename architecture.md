# RabbitMQ System Architecture

```mermaid
graph TD
    subgraph "REST API Server"
        A[Express Server] --> B[Message Routes]
        B --> C[Publisher Service]
        C --> D[RabbitMQ Connection]
    end

    subgraph "RabbitMQ"
        D --> E[Queue 1]
        D --> F[Queue 2]
        D --> G[Queue N]
    end

    subgraph "Consumers"
        E --> H[Consumer 1]
        F --> I[Consumer 2]
        G --> J[Consumer N]
    end

    subgraph "Client Applications"
        K[HTTP Client] --> |POST /api/messages/publish/:queue| A
        L[cURL] --> |POST /api/messages/publish/:queue/batch| A
        M[Browser] --> |GET /api/messages/status/:queue| A
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style K fill:#bfb,stroke:#333,stroke-width:2px
```

## Flow Description

1. **Client Request Flow:**
   - Clients send HTTP requests to REST API endpoints
   - Express server routes requests to appropriate handlers
   - Publisher service formats messages
   - Messages are sent to RabbitMQ

2. **Message Flow:**
   - Messages enter RabbitMQ queues
   - Consumers process messages from queues
   - Acknowledgments are sent back

3. **Monitoring Flow:**
   - Clients can check queue status
   - RabbitMQ Management UI shows real-time stats
   - Consumers report processing status
