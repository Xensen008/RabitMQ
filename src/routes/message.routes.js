const express = require('express');
const router = express.Router();
const publisherService = require('../services/publisher');

// Publish a message to a specific queue
router.post('/publish/:queue', async (req, res) => {
    try {
        const { queue } = req.params;
        const message = req.body;
        
        await publisherService.publishMessage({
            queue,
            message,
            options: { persistent: true }
        });
        
        res.status(200).json({
            success: true,
            message: 'Message published successfully',
            queue,
            data: message
        });
    } catch (error) {
        console.error('Error publishing message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to publish message',
            details: error.message
        });
    }
});

// Publish multiple messages to a queue
router.post('/publish/:queue/batch', async (req, res) => {
    try {
        const { queue } = req.params;
        const messages = req.body;
        
        if (!Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                error: 'Request body must be an array of messages'
            });
        }
        
        await publisherService.publishBatch({
            queue,
            messages,
            options: { persistent: true }
        });
        
        res.status(200).json({
            success: true,
            message: 'Batch messages published successfully',
            queue,
            count: messages.length
        });
    } catch (error) {
        console.error('Error publishing batch messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to publish batch messages',
            details: error.message
        });
    }
});

// Get queue status
router.get('/status/:queue', async (req, res) => {
    try {
        const { queue } = req.params;
        const status = await publisherService.getQueueStatus(queue);
        
        res.status(200).json({
            success: true,
            queue,
            status
        });
    } catch (error) {
        console.error('Error getting queue status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get queue status',
            details: error.message
        });
    }
});

module.exports = router;
