const consumerService = require('./services/consumer');

// Example message handler
async function processMessage(message) {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Processing message:', message);
    
    // Add your message processing logic here
    // If processing fails, throw an error to reject the message
    if (message.error) {
        throw new Error('Failed to process message');
    }
}

// Start the consumer
async function startConsumer() {
    try {
        await consumerService.initialize();
        await consumerService.startConsuming(processMessage);
        console.log('Consumer started successfully');
    } catch (error) {
        console.error('Failed to start consumer:', error);
        process.exit(1);
    }
}

startConsumer();
