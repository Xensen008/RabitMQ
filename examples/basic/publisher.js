const amqp = require('amqplib');

const publishMessage = async (queue, message) => {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        // Assert queue exists
        await channel.assertQueue(queue, { durable: true });

        // Send message
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Message sent: ${message}`);

        // Close connections
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error publishing message:', error);
    }
};

// Example usage
if (require.main === module) {
    const queue = 'example_queue';
    const message = 'Hello, RabbitMQ! ' + new Date().toISOString();
    
    publishMessage(queue, message)
        .then(() => console.log('Message published successfully'))
        .catch(console.error);
}

module.exports = publishMessage;
