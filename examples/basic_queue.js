const amqp = require('amqplib');

// Connection URL
const url = 'amqp://guest:guest@localhost:5672';

async function producer() {
    try {
        // Establish connection
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        
        // Create queue
        const queue = 'basic_queue';
        await channel.assertQueue(queue);
        
        // Send messages
        for (let i = 0; i < 5; i++) {
            const message = `Message ${i}`;
            channel.sendToQueue(queue, Buffer.from(message));
            console.log(` [x] Sent ${message}`);
        }
        
        // Close connection
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function consumer() {
    try {
        // Establish connection
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        
        // Create queue
        const queue = 'basic_queue';
        await channel.assertQueue(queue);
        
        // Set prefetch count
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
        await producer();
        await consumer();
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
