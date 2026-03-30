// DevSecOps Dashboard Dynamic Logic - Enhanced Version
const POLLING_INTERVAL = 3000;
let logIndex = 0;

// Mock Logs for the Live Terminal
const pipelineLogs = [
    { type: 'info', msg: '[DOCKER] Building frontend image - tag: latest' },
    { type: 'info', msg: '[DOCKER] Step 1/5: FROM node:18-alpine' },
    { type: 'success', msg: '[DOCKER] Build successful. Image ID: 8f4b2a19' },
    { type: 'info', msg: '[TRIVY] Scanning local image for vulnerabilities...' },
    { type: 'success', msg: '[TRIVY] Scan complete. 0 CRITICAL, 0 HIGH found.' },
    { type: 'info', msg: '[SONAR] Starting source code analysis' },
    { type: 'info', msg: '[SONAR] Quality Gate checked' },
    { type: 'success', msg: '[SONAR] Quality Gate: PASSED (Rating: A)' },
    { type: 'info', msg: '[K8S] Applying manifest templates to cluster' },
    { type: 'info', msg: '[K8S] deployment.apps/devsecops-frontend configured' },
    { type: 'success', msg: '[K8S] Rollout status: successfully rolled out' },
    { type: 'info', msg: '[SYSTEM] Cluster synchronization complete.' }
];

async function init() {
    try {
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

        // Apply config
        if (envBadge) envBadge.textContent = `${config.env} Active`;
        if (appVersion) appVersion.textContent = config.version;

        // Initialize real-time updates and log stream
        startRealTimeUpdates();
        startLogStream();

        console.log(`[UI Control Plane] Initialized in ${config.env} mode`);
    } catch (e) {
        console.error('Initialization failed', e);
    }
}

async function fetchStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        updateDashboard(data);
    } catch (e) {
        console.warn('API unavailable, simulating data for visuals...', e);
        // Fallback simulation for demonstration if backend is down
        const fakeData = {
            uptime: Math.floor(Date.now()/1000) % 100000 + 86400,
            memory: Math.floor(Math.random() * 50) + 150,
            cpuLoad: (Math.random() * 0.5 + 0.1).toFixed(2)
        };
        updateDashboard(fakeData);
    }
}

function updateDashboard(data) {
    const uptimeEl = document.getElementById('uptime-counter');
    const memoryEl = document.getElementById('memory-val');
    const cpuEl = document.getElementById('cpu-val');
    const syncEl = document.getElementById('last-sync');
    const memBar = document.getElementById('mem-bar');
    const cpuBar = document.getElementById('cpu-bar');

    if (uptimeEl) {
        const hours = Math.floor(data.uptime / 3600);
        const minutes = Math.floor((data.uptime % 3600) / 60);
        const seconds = Math.floor(data.uptime % 60);
        uptimeEl.textContent = `${formatZero(hours)}:${formatZero(minutes)}:${formatZero(seconds)}`;
    }
    
    if (memoryEl) memoryEl.textContent = `${data.memory} MB`;
    if (cpuEl) cpuEl.textContent = `${data.cpuLoad}`;
    
    // Update progress bars
    if (memBar) {
        // assume 512MB max for visuals
        const memPercent = Math.min((data.memory / 512) * 100, 100);
        memBar.style.width = `${memPercent}%`;
        memBar.className = `fill ${memPercent > 80 ? 'fill-danger' : 'fill-warning'}`;
    }
    
    if (cpuBar) {
        // assume 2.0 is max load
        const cpuPercent = Math.min((parseFloat(data.cpuLoad) / 2.0) * 100, 100);
        cpuBar.style.width = `${cpuPercent}%`;
    }

    if (syncEl) {
        const now = new Date();
        syncEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

function formatZero(n) {
    return n < 10 ? '0' + n : n;
}

function startRealTimeUpdates() {
    fetchStatus(); // immediate fetch
    setInterval(fetchStatus, POLLING_INTERVAL);
}

function startLogStream() {
    const terminal = document.getElementById('terminal-output');
    if(!terminal) return;

    setInterval(() => {
        if(logIndex < pipelineLogs.length) {
            appendLog(terminal, pipelineLogs[logIndex]);
            logIndex++;
        } else {
            // Reset to loop for demonstration
            logIndex = 0;
            terminal.innerHTML = '';
            appendLog(terminal, { type: 'info', msg: '[SYSTEM] Restarting pipeline observation...' });
        }
    }, 2500 + Math.random() * 1000); // Random interval for realism
}

function appendLog(terminal, logInfo) {
    const line = document.createElement('div');
    line.className = `log-line ${logInfo.type} animate-slide-right`;
    
    const time = new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'});
    
    line.innerHTML = `<span class="timestamp">[${time}]</span> ${logInfo.msg}`;
    terminal.appendChild(line);
    
    // Auto scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
}

window.addEventListener('DOMContentLoaded', init);
