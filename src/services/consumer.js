const rabbitmq = require('../utils/rabbitmq');

class ConsumerService {
    constructor() {
        this.channel = null;
        this.queueName = 'tasks_queue';
    }

    async initialize() {
        try {
            this.channel = await rabbitmq.connect();
            await rabbitmq.createQueue(this.queueName);
            await this.channel.prefetch(1); // Process one message at a time
        } catch (error) {
            console.error('Error initializing consumer:', error);
            throw error;
        }
    }

    async startConsuming(messageHandler) {
        try {
            console.log(' [*] Waiting for messages...');
            
            await this.channel.consume(this.queueName, async (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log(` [x] Received message: ${JSON.stringify(content)}`);
                    
                    try {
                        // Process the message using the provided handler
                        await messageHandler(content);
                        // Acknowledge the message
                        this.channel.ack(msg);
                    } catch (error) {
                        console.error('Error processing message:', error);
                        // Reject the message and requeue it
                        this.channel.nack(msg);
                    }
                }
            });
        } catch (error) {
            console.error('Error starting consumer:', error);
            throw error;
        }
    }
}

module.exports = new ConsumerService();
