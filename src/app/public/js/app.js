// DevSecOps Dashboard Dynamic Logic
const ANIMATION_INTERVAL = 3000;

async function init() {
    try {
        // These placeholders are replaced by the server in index.html and passed here via window
        const config = window.__CONFIG__ || { env: 'DEVELOPMENT', version: 'v1.0.0' };

        const body = document.getElementById('app-body');
        const envBadge = document.getElementById('env-badge');
        const appVersion = document.getElementById('app-version');
        
        // Setup Theme
        if (config.env === 'GREEN') {
            body.classList.add('theme-green');
        } else if (config.env === 'BLUE') {
            body.classList.remove('theme-green');
        }

        // Apply config data
        if (envBadge) envBadge.textContent = `${config.env} Active`;
        if (appVersion) appVersion.textContent = config.version;

        // Initialize dynamic simulation loops
        startSimulations();

        console.log(`[DevSecOps] UI Initialized in ${config.env} mode (version: ${config.version})`);
    } catch (e) {
        console.error('Initialization failed', e);
    }
}

function startSimulations() {
    // Simulate slight fluctuations in Latency and Throughput metrics to make the UI feel "alive"
    const latencyEl = document.getElementById('latency-val');
    const throughputEl = document.getElementById('throughput-val');
    
    let baseLatency = 42;
    let baseThroughput = 1.2;

    setInterval(() => {
        // Randomize latency +/- 5ms
        const latencyVariation = Math.floor(Math.random() * 11) - 5;
        let newLatency = baseLatency + latencyVariation;
        if (newLatency < 20) newLatency = 20; 
        
        // Randomize throughput +/- 0.3 k/s
        const throughputVariation = (Math.random() * 0.6) - 0.3;
        let newThroughput = (baseThroughput + throughputVariation).toFixed(2);

        if (latencyEl) latencyEl.textContent = `${newLatency} ms`;
        if (throughputEl) throughputEl.textContent = `${newThroughput} k/s`;

        // Update last sync time
        const syncEl = document.getElementById('last-sync');
        if (syncEl) {
            const now = new Date();
            syncEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        
    }, ANIMATION_INTERVAL);
}

// Run on load
window.addEventListener('DOMContentLoaded', init);
