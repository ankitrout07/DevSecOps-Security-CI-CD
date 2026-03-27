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

        // Initialize dynamic API polling
        startRealTimeUpdates();

        console.log(`[DevSecOps] UI Initialized in ${config.env} mode (version: ${config.version})`);
    } catch (e) {
        console.error('Initialization failed', e);
    }
}

async function fetchStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        const uptimeEl = document.getElementById('uptime-counter');
        const memoryEl = document.getElementById('memory-val');
        const cpuEl = document.getElementById('cpu-val');
        const syncEl = document.getElementById('last-sync');

        if (uptimeEl) {
            const hours = Math.floor(data.uptime / 3600);
            const minutes = Math.floor((data.uptime % 3600) / 60);
            const seconds = Math.floor(data.uptime % 60);
            uptimeEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
        }
        
        if (memoryEl) memoryEl.textContent = `${data.memory} MB`;
        if (cpuEl) cpuEl.textContent = `${data.cpuLoad}`;

        if (syncEl) {
            const now = new Date();
            syncEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    } catch (e) {
        console.warn('Failed to fetch real-time status API', e);
    }
}

function startRealTimeUpdates() {
    fetchStatus(); // fetch immediately
    setInterval(fetchStatus, ANIMATION_INTERVAL); // then poll
}

// Run on load
window.addEventListener('DOMContentLoaded', init);
