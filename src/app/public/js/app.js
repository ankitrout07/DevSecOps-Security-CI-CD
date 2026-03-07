// DevSecOps Dashboard Logic
async function init() {
    try {
        // These placeholders are replaced by the server in index.html and passed here via window
        const config = window.__CONFIG__ || { env: 'DEVELOPMENT', version: 'v1.0.0' };

        const body = document.getElementById('app-body');
        const envBadge = document.getElementById('env-badge');
        const appVersion = document.getElementById('app-version');

        if (config.env === 'GREEN') {
            body.classList.add('theme-green');
        } else if (config.env === 'BLUE') {
            body.classList.remove('theme-green');
        }

        if (envBadge) envBadge.textContent = `${config.env} Environment`;
        if (appVersion) appVersion.textContent = config.version;

        console.log(`Initialized in ${config.env} mode (version: ${config.version})`);
    } catch (e) {
        console.error('Initialization failed', e);
    }
}

// Run on load
window.addEventListener('DOMContentLoaded', init);
