const express = require('express');
const winston = require('winston');
const client = require('prom-client');

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

// The APP_ENV variable tells us which environment we are in
const env = process.env.APP_ENV || 'DEVELOPMENT';
const color = env === 'GREEN' ? '#ccbc2e' : '#3498db';

app.get('/', (req, res) => {
    logger.info(`Request received on ${env} environment`);
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>DevSecOps Dashboard</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background-color: #f4f7f6; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                }
                .card { 
                    background: white; 
                    padding: 3rem; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
                    text-align: center; 
                    border-top: 10px solid ${color}; 
                }
                .status-badge { 
                    background-color: ${color}; 
                    color: white; 
                    padding: 0.5rem 1.5rem; 
                    border-radius: 50px; 
                    font-weight: bold; 
                    text-transform: uppercase; 
                }
                h1 { color: #2c3e50; margin-top: 1.5rem; }
                p { color: #7f8c8d; }
                .footer { margin-top: 2rem; font-size: 0.8rem; color: #bdc3c7; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="status-badge">${env} ENVIRONMENT</div>
                <h1>System Status: Operational</h1>
                <p>Deployment version: <strong>v1.1.0</strong></p>
                <p>Security Scan: <strong>Passed (Trivy)</strong></p>
                <p>Observability: <strong>Enabled (Prometheus)</strong></p>
                <div class="footer">DevSecOps Blue-Green Pipeline Demo</div>
            </div>
        </body>
        </html>
    `);
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
