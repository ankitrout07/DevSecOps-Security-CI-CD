const express = require('express');
const app = express();
const os = require('os');
const PORT = process.env.PORT || 8080;
const APP_ENV = process.env.APP_ENV || 'BLUE';

app.get('/', (req, res) => {
    const color = APP_ENV === 'GREEN' ? '#2ecc71' : '#3498db';
    res.send(`<html><body style="font-family:sans-serif;text-align:center;background-color:${color};color:white;padding-top:100px;"><h1>DevSecOps Managed Service</h1><div style="background:rgba(0,0,0,0.2);display:inline-block;padding:20px;border-radius:10px;"><h2>Environment: ${APP_ENV}</h2><p>Hostname: ${os.hostname()}</p></div></body></html>`);
});

app.get('/health', (req, res) => { res.status(200).json({ status: 'UP' }); });
app.listen(PORT, () => { console.log(`Server running on ${PORT}`); });
