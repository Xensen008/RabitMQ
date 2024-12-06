const amqp = require('amqplib');

const consumeMessage = async (queue) => {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        // Assert queue exists
        await channel.assertQueue(queue, { durable: true });

        console.log(`Waiting for messages in queue: ${queue}`);

        // Consume messages
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log(`Received: ${msg.content.toString()}`);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error consuming message:', error);
    }
};

// Example usage
if (require.main === module) {
    const queue = 'example_queue';
    
    consumeMessage(queue)
        .then(() => console.log('Consumer started'))
        .catch(console.error);
}

module.exports = consumeMessage;
