const amqp = require('amqplib');

// Connection URL
const url = 'amqp://guest:guest@localhost:5672';

async function fifoProducer() {
    try {
        // Establish connection
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        
        // Create durable queue with TTL
        const queue = 'fifo_queue';
        await channel.assertQueue(queue, {
            durable: true,
            arguments: {
                'x-message-ttl': 3600000 // 1 hour TTL
            }
        });
        
        // Send numbered messages
        for (let i = 0; i < 10; i++) {
            const message = `Message ${i} sent at ${new Date().toISOString()}`;
            channel.sendToQueue(queue, Buffer.from(message), {
                persistent: true // Make message persistent
            });
            console.log(` [x] Sent ${message}`);
            
            // Small delay between messages
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Close connection
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fifoConsumer() {
    try {
        // Establish connection
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        
        // Create durable queue with TTL
        const queue = 'fifo_queue';
        await channel.assertQueue(queue, {
            durable: true,
            arguments: {
                'x-message-ttl': 3600000 // 1 hour TTL
            }
        });
        
        // Set prefetch count to 1 for strict ordering
        await channel.prefetch(1);
        
        console.log(' [*] Waiting for messages. To exit press CTRL+C');
        
        // Consume messages
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log(` [x] Received ${msg.content.toString()}`);
                
                // Simulate processing time
                setTimeout(() => {
                    channel.ack(msg);
                }, 1000);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run producer and consumer
async function run() {
    try {
        await fifoProducer();
        await fifoConsumer();
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
