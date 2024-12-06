const rabbitmq = require('../utils/rabbitmq');

class PublisherService {
    constructor() {
        this.channel = null;
        this.queueName = 'tasks_queue';
    }

    async initialize() {
        try {
            this.channel = await rabbitmq.connect();
            await rabbitmq.createQueue(this.queueName);
        } catch (error) {
            console.error('Error initializing publisher:', error);
            throw error;
        }
    }

    async publishMessage(message) {
        try {
            await this.channel.sendToQueue(
                this.queueName,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true
                }
            );
            console.log(`Message published: ${JSON.stringify(message)}`);
            return true;
        } catch (error) {
            console.error('Error publishing message:', error);
            throw error;
        }
    }

    async publishBatch(messages) {
        try {
            for (const message of messages) {
                await this.publishMessage(message);
            }
            return true;
        } catch (error) {
            console.error('Error publishing batch:', error);
            throw error;
        }
    }
}

module.exports = new PublisherService();
