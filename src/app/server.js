const express = require('express');
const winston = require('winston');
const client = require('prom-client');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Structured Logging with Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

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

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(port, () => {
    logger.info(`App listening at http://localhost:${port}`);
});
