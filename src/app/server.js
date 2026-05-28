const express = require('express');
const winston = require('winston');
const client = require('prom-client');
const path = require('path');
const fs = require('fs');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 8080;

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Structured Logging with Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

// Redis Client Setup
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://redis-service:6379'
});
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

// Prometheus Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in microseconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Middleware to measure request duration
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.path, code: res.statusCode });
    });
    next();
});

// Serve static files from the 'public' directory, but disable index.html serving
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Environment-aware variables
const env = process.env.APP_ENV || 'DEVELOPMENT';
const version = process.env.APP_VERSION || 'v1.1.0';

app.get('/', (req, res) => {
    logger.info(`Request received on ${env} environment`);

    const indexPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            logger.error('Could not read index.html', err);
            return res.status(500).send('Internal Server Error');
        }

        // Simple template injection
        const result = data
            .replace(/{{APP_ENV}}/g, env)
            .replace(/{{APP_VERSION}}/g, version);

        res.send(result);
    });
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Simulated Expensive API with Redis Caching
app.get('/api/analytics', async (req, res) => {
    try {
        const cacheKey = 'system_analytics';
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            logger.info('Serving /api/analytics from Redis cache');
            return res.json(JSON.parse(cachedData));
        }

        logger.info('Cache miss for /api/analytics, generating data...');
        // Simulate a 2-second heavy query
        setTimeout(async () => {
            const data = {
                activeUsers: Math.floor(Math.random() * 1000) + 100,
                transactionsProcessed: Math.floor(Math.random() * 50000) + 5000,
                timestamp: new Date().toISOString()
            };
            
            // Cache the result for 10 seconds
            await redisClient.setEx(cacheKey, 10, JSON.stringify(data));
            res.json(data);
        }, 2000);
    } catch (err) {
        logger.error('Redis error in /api/analytics', err);
        res.status(500).send('Internal Server Error');
    }
});

// Real-time Dashboard API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'Healthy',
        uptime: process.uptime(),
        memory: (process.memoryUsage().rss / 1024 / 1024).toFixed(2), // in MB
        cpuLoad: os.loadavg()[0].toFixed(2)
    });
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

const server = app.listen(port, () => {
    logger.info(`App listening at http://localhost:${port}`);
});

// Socket.io for Real-Time Metrics
const io = new Server(server);

io.on('connection', (socket) => {
    logger.info(`New client connected via WebSocket: ${socket.id}`);
    
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Broadcast metrics every 3 seconds
setInterval(() => {
    io.emit('metrics-update', {
        status: 'Healthy',
        uptime: process.uptime(),
        memory: (process.memoryUsage().rss / 1024 / 1024).toFixed(2), // in MB
        cpuLoad: os.loadavg()[0].toFixed(2)
    });
}, 3000);

// Graceful Shutdown for Kubernetes
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        logger.info('HTTP server closed');
        try {
            await redisClient.quit();
            logger.info('Redis client closed');
        } catch(e) {}
        process.exit(0);
    });
});

module.exports = { app, server };
