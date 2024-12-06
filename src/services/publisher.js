const rabbitmq = require('../utils/rabbitmq');

class PublisherService {
    constructor() {
        this.channel = null;
    }

    async initialize() {
        try {
            this.channel = await rabbitmq.connect();
        } catch (error) {
            console.error('Error initializing publisher:', error);
            throw error;
        }
    }

    async publishMessage({ queue, message, options = {} }) {
        try {
            // Ensure queue exists
            await this.channel.assertQueue(queue, { durable: true });
            
            // Convert message to buffer if it's an object
            const messageBuffer = Buffer.from(JSON.stringify(message));
            
            // Publish message
            await this.channel.sendToQueue(queue, messageBuffer, {
                persistent: true,
                ...options
            });
            
            console.log(`Message published to queue ${queue}:`, message);
            return true;
        } catch (error) {
            console.error('Error publishing message:', error);
            throw error;
        }
    }

    async publishBatch({ queue, messages, options = {} }) {
        try {
            // Ensure queue exists
            await this.channel.assertQueue(queue, { durable: true });
            
            // Publish all messages
            for (const message of messages) {
                const messageBuffer = Buffer.from(JSON.stringify(message));
                await this.channel.sendToQueue(queue, messageBuffer, {
                    persistent: true,
                    ...options
                });
            }
            
            console.log(`Published ${messages.length} messages to queue ${queue}`);
            return true;
        } catch (error) {
            console.error('Error publishing batch:', error);
            throw error;
        }
    }

    async getQueueStatus(queue) {
        try {
            const assertQueue = await this.channel.assertQueue(queue, { durable: true });
            return {
                messageCount: assertQueue.messageCount,
                consumerCount: assertQueue.consumerCount,
                queue: assertQueue.queue
            };
        } catch (error) {
            console.error('Error getting queue status:', error);
            throw error;
        }
    }
}

module.exports = new PublisherService();
