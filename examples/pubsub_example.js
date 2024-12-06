const amqp = require('amqplib');

// Connection URL
const url = 'amqp://guest:guest@localhost:5672';

async function publisher() {
    try {
        // Establish connection
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        
        // Create fanout exchange
        const exchange = 'logs';
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        
        // Publish messages
        for (let i = 0; i < 5; i++) {
            const message = `Broadcast message ${i}`;
            channel.publish(exchange, '', Buffer.from(message));
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

async function subscriber() {
    try {
        // Establish connection
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        
        // Create fanout exchange
        const exchange = 'logs';
        await channel.assertExchange(exchange, 'fanout', { durable: false });
        
        // Create temporary queue
        const q = await channel.assertQueue('', { exclusive: true });
        
        // Bind queue to exchange
        await channel.bindQueue(q.queue, exchange, '');
        
        console.log(' [*] Waiting for messages. To exit press CTRL+C');
        
        // Consume messages
        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                console.log(` [x] Received ${msg.content.toString()}`);
            }
        }, { noAck: true });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'publish') {
    publisher();
} else {
    subscriber();
}
