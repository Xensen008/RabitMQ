const amqp = require('amqplib');

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            console.log('Connected to RabbitMQ');
            return this.channel;
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async createQueue(queueName) {
        try {
            await this.channel.assertQueue(queueName, {
                durable: true
            });
            console.log(`Queue ${queueName} created`);
        } catch (error) {
            console.error(`Error creating queue ${queueName}:`, error);
            throw error;
        }
    }

    async close() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('RabbitMQ connection closed');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQConnection();
