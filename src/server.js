const express = require('express');
const cors = require('cors');
const publisherService = require('./services/publisher');
const messageRoutes = require('./routes/message.routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize RabbitMQ publisher
publisherService.initialize().catch(console.error);

// Routes
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
