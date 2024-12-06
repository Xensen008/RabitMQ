# RabbitMQ Docker Setup Guide

This guide explains how to set up RabbitMQ using Docker with the management plugin enabled.

## Prerequisites

- Docker installed on your system
- Port 5672 (AMQP) and 15672 (Management UI) available

## Installation and Setup

1. Pull the RabbitMQ Docker image with management plugin:
```bash
docker pull rabbitmq:management
```

2. Run the RabbitMQ container:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
```

This command:
- `-d`: Runs the container in detached mode (background)
- `--name rabbitmq`: Names the container "rabbitmq"
- `-p 5672:5672`: Maps the AMQP port
- `-p 15672:15672`: Maps the Management UI port
- `rabbitmq:management`: Uses the RabbitMQ image with management plugin

## Accessing the Management UI

1. Open your web browser and navigate to:
```
http://localhost:15672
```

2. Login with default credentials:
- Username: `guest`
- Password: `guest`

## Understanding RabbitMQ Core Concepts

### Message Queues
A message queue is a form of asynchronous service-to-service communication. Key points:
- Messages are stored in a queue until processed
- Enables decoupling between services
- Provides buffer for traffic spikes
- Ensures reliable message delivery

Example scenario:
```
[Producer] → (Message) → [Queue] → (Message) → [Consumer]
```

### Publish/Subscribe (Pub/Sub) Model
The Pub/Sub pattern allows messages to be broadcast to multiple consumers. Components:

1. **Publisher**: Sends messages to an exchange
2. **Exchange**: Routes messages to queues based on rules
3. **Queue**: Stores messages
4. **Consumer**: Receives and processes messages

Exchange types:
- **Direct**: Routes based on exact matching routing key
- **Topic**: Routes based on pattern-matched routing key
- **Fanout**: Broadcasts to all bound queues
- **Headers**: Routes based on message headers

Example flow:
```
[Publisher] → [Exchange] → [Queue 1] → [Consumer 1]
                       ↘ [Queue 2] → [Consumer 2]
                       ↘ [Queue 3] → [Consumer 3]
```

### FIFO (First-In-First-Out) Queues
FIFO ensures messages are processed in the exact order they were received:

Key configurations for FIFO behavior:
1. **Message ordering**:
   - Messages published to the same queue are delivered in order
   - Set `x-message-ttl` to prevent message expiration

2. **Consumer settings**:
   - Set `prefetch count` to 1 for strict ordering
   - Disable consumer acknowledgment reordering

Example FIFO scenario:
```
Message Order: [1] → [2] → [3] → [4]
Processing Order: 1st → 2nd → 3rd → 4th
```

### Best Practices

1. **Message Persistence**:
   - Enable persistent messages for critical data
   - Use durable queues and exchanges

2. **Consumer Acknowledgments**:
   - Use manual acknowledgments for reliable processing
   - Implement dead-letter queues for failed messages

3. **Queue Management**:
   - Set appropriate queue limits
   - Monitor queue length and processing rates

## Running JavaScript Examples

1. Install Node.js dependencies:
```bash
npm install
```

2. Run the examples:
```bash
# Basic Queue Example
node examples/basic_queue.js

# Pub/Sub Example (run in different terminals)
node examples/pubsub_example.js        # Start subscriber
node examples/pubsub_example.js publish # Start publisher

# FIFO Queue Example
node examples/fifo_queue.js
```

Key differences from Python examples:
- Uses `amqplib` instead of `pika`
- Implements async/await pattern for better readability
- Uses Promises and callbacks for asynchronous operations
- Handles connection closure explicitly

## Node.js Backend with RabbitMQ Integration

This section demonstrates a complete Node.js backend integration with RabbitMQ, featuring a publisher-consumer architecture with REST API endpoints.

### Project Structure

```
src/
├── utils/
│   └── rabbitmq.js      # RabbitMQ connection utility
├── services/
│   ├── publisher.js     # Message publishing service
│   └── consumer.js      # Message consuming service
├── server.js            # Express server with REST APIs
└── consumer.js          # Standalone consumer script
```

### Components

1. **RabbitMQ Connection Utility** (`src/utils/rabbitmq.js`):
   - Manages RabbitMQ connection
   - Handles queue creation
   - Provides connection pooling

2. **Publisher Service** (`src/services/publisher.js`):
   - Handles message publishing
   - Supports single and batch message publishing
   - Ensures message persistence

3. **Consumer Service** (`src/services/consumer.js`):
   - Manages message consumption
   - Implements message acknowledgment
   - Handles error cases with message requeueing

4. **Express Server** (`src/server.js`):
   - Exposes REST APIs for publishing messages
   - Endpoints:
     - `POST /api/tasks`: Publish single task
     - `POST /api/tasks/batch`: Publish multiple tasks
     - `GET /health`: Health check

5. **Consumer Script** (`src/consumer.js`):
   - Standalone consumer process
   - Processes messages one at a time
   - Can be run separately from the main server

### Running the Application

1. Start the server:
```bash
npm start
```

2. Start the consumer (in a separate terminal):
```bash
npm run consumer
```

3. Test the API endpoints:

```bash
# Publish a single task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"task": "example task", "priority": "high"}'

# Publish multiple tasks
curl -X POST http://localhost:3000/api/tasks/batch \
  -H "Content-Type: application/json" \
  -d '[{"task": "task1"}, {"task": "task2"}]'

# Check server health
curl http://localhost:3000/health
```

### Features

- Error handling with proper error responses
- Message persistence for reliability
- Scalable consumer architecture
- Health check endpoints
- CORS support for web applications
- Message acknowledgments for reliable processing
- Batch processing support
- Connection pooling and management

### API Documentation

#### POST /api/tasks
Publishes a single task to the queue.

Request body:
```json
{
  "task": "example task",
  "priority": "high"
}
```

#### POST /api/tasks/batch
Publishes multiple tasks to the queue.

Request body:
```json
[
  {"task": "task1", "priority": "high"},
  {"task": "task2", "priority": "low"}
]
```

#### GET /health
Returns server health status.

Response:
```json
{
  "status": "OK"
}
```

### Error Handling

- The server provides appropriate HTTP status codes
- Failed messages are requeued automatically
- Connection errors are handled gracefully
- Consumer errors don't crash the application

## Useful Docker Commands

- Check container status:
```bash
docker ps
```

- Stop the RabbitMQ container:
```bash
docker stop rabbitmq
```

- Start the RabbitMQ container:
```bash
docker start rabbitmq
```

- Remove the container:
```bash
docker rm rabbitmq
```

## Port Information

- 5672: AMQP protocol port
- 15672: HTTP Management UI port
