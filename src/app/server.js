const express = require('express');
const app = express();
const port = 8080;

// The APP_ENV variable tells us which environment we are in
const env = process.env.APP_ENV || 'DEVELOPMENT';
const color = env === 'GREEN' ? '#2ecc71' : '#3498db';

app.get('/', (req, res) => {
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
                <p>Deployment version: <strong>v1.0.0</strong></p>
                <p>Security Scan: <strong>Passed (Trivy)</strong></p>
                <div class="footer">DevSecOps Blue-Green Pipeline Demo</div>
            </div>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
