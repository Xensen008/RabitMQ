const express = require('express');
const cors = require('cors');
const publisherService = require('./services/publisher');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize RabbitMQ publisher
publisherService.initialize().catch(console.error);

// Routes
app.post('/api/tasks', async (req, res) => {
    try {
        const message = req.body;
        await publisherService.publishMessage(message);
        res.status(200).json({ message: 'Task published successfully' });
    } catch (error) {
        console.error('Error publishing task:', error);
        res.status(500).json({ error: 'Failed to publish task' });
    }
});

app.post('/api/tasks/batch', async (req, res) => {
    try {
        const messages = req.body;
        if (!Array.isArray(messages)) {
            return res.status(400).json({ error: 'Request body must be an array' });
        }
        await publisherService.publishBatch(messages);
        res.status(200).json({ message: 'Batch tasks published successfully' });
    } catch (error) {
        console.error('Error publishing batch tasks:', error);
        res.status(500).json({ error: 'Failed to publish batch tasks' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
