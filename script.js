/**
 * Server Monitor Dashboard - Pure WebSocket
 * No Simulation Mode
 */

const CONFIG = {
    wsUrl: 'wss://nc1.lemonhost.me:8080/api/servers/637e6e35-1ebe-4d0d-8560-7c214ba5123b/ws',
    reconnectInterval: 5000,
    maxReconnectAttempts: 999,
    networkChartPoints: 60
};

const state = {
    ws: null,
    reconnectAttempts: 0,
    isConnected: false,
    uptimeSeconds: 0,
    pingHistory: [],
    networkHistory: { upload: [], download: [] },
    lastNetworkBytes: { up: 0, down: 0 }
};

const DOM = {
    connectionStatus: document.getElementById('connectionStatus'),
    statusText: document.querySelector('.status-text'),
    timestamp: document.getElementById('timestamp'),
    lastSync: document.getElementById('lastSync'),
    
    pingValue: document.getElementById('pingValue'),
    pingBars: document.getElementById('pingBars'),
    pingStatus: document.getElementById('pingStatus'),
    
    uptimeDays: document.getElementById('uptimeDays'),
    uptimeHours: document.getElementById('uptimeHours'),
    uptimeMins: document.getElementById('uptimeMins'),
    uptimeSecs: document.getElementById('uptimeSecs'),
    uptimePercent: document.getElementById('uptimePercent'),
    uptimeStatus: document.getElementById('uptimeStatus'),
    
    cpuValue: document.getElementById('cpuValue'),
    cpuGaugeFill: document.getElementById('cpuGaugeFill'),
    cpuCores: document.getElementById('cpuCores'),
    cpuStatus: document.getElementById('cpuStatus'),
    
    memoryUsed: document.getElementById('memoryUsed'),
    memoryTotal: document.getElementById('memoryTotal'),
    memoryPercent: document.getElementById('memoryPercent'),
    memoryUsedBar: document.getElementById('memoryUsedBar'),
    memoryCachedBar: document.getElementById('memoryCachedBar'),
    memoryStatus: document.getElementById('memoryStatus'),
    
    diskUsed: document.getElementById('diskUsed'),
    diskTotal: document.getElementById('diskTotal'),
    diskFree: document.getElementById('diskFree'),
    diskPercent: document.getElementById('diskPercent'),
    diskGaugeFill: document.getElementById('diskGaugeFill'),
    diskStatus: document.getElementById('diskStatus'),
    
    networkUp: document.getElementById('networkUp'),
    networkDown: document.getElementById('networkDown'),
    networkCanvas: document.getElementById('networkCanvas')
};

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function padZero(num) {
    return String(num).padStart(2, '0');
}

function getStatusClass(value, thresholds) {
    if (value < thresholds.good) return 'stat-good';
    if (value < thresholds.warn) return 'stat-warn';
    return 'stat-bad';
}

function updateConnectionStatus(status, message) {
    const el = DOM.connectionStatus;
    el.classList.remove('connected', 'disconnected');
    
    switch(status) {
        case 'connected':
            el.classList.add('connected');
            DOM.statusText.textContent = 'Connected';
            break;
        case 'disconnected':
            el.classList.add('disconnected');
            DOM.statusText.textContent = message || 'Disconnected';
            break;
        case 'error':
            el.classList.add('disconnected');
            DOM.statusText.textContent = message || 'Error';
            break;
        default:
            DOM.statusText.textContent = 'Connecting...';
    }
}

function connectWebSocket() {
    if (state.ws) {
        state.ws.close();
        state.ws = null;
    }
    
    updateConnectionStatus('connecting');
    console.log(`Attempting to connect to ${CONFIG.wsUrl}...`);

    try {
        state.ws = new WebSocket(CONFIG.wsUrl);
        
        state.ws.onopen = () => {
            console.log('WebSocket Connected!');
            state.isConnected = true;
            state.reconnectAttempts = 0;
            updateConnectionStatus('connected');
        };
        
        state.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleServerData(data);
            } catch (err) {
                console.warn('Failed to parse data:', err);
            }
        };
        
        state.ws.onerror = (err) => {
            console.error('WebSocket Error:', err);
            // Check if it's likely a CSP issue
            if (location.protocol === 'https:' && CONFIG.wsUrl.startsWith('ws://')) {
                updateConnectionStatus('error', 'Mixed Content Blocked');
            } else {
                updateConnectionStatus('error', 'Connection Blocked');
            }
        };
        
        state.ws.onclose = (event) => {
            console.log('WebSocket Closed:', event.code, event.reason);
            state.isConnected = false;
            
            if (event.code === 1006) {
                // 1006 = Abnormal closure (usually CSP block or network fail)
                updateConnectionStatus('error', 'Blocked / Network Error');
            } else {
                updateConnectionStatus('disconnected');
            }
            
            attemptReconnect();
        };
        
    } catch (err) {
        console.error('Failed to create WebSocket:', err);
        updateConnectionStatus('error', 'Init Failed');
        attemptReconnect();
    }
}

function attemptReconnect() {
    if (state.reconnectAttempts < CONFIG.maxReconnectAttempts) {
        state.reconnectAttempts++;
        const delay = CONFIG.reconnectInterval;
        console.log(`Reconnecting in ${delay/1000}s (Attempt ${state.reconnectAttempts})`);
        setTimeout(connectWebSocket, delay);
    } else {
        updateConnectionStatus('error', 'Max retries reached');
    }
}

function handleServerData(data) {
    updateTimestamp();
    
    // Direct properties
    if (data.ping !== undefined) updatePing(data.ping);
    if (data.uptime !== undefined) updateUptime(data.uptime);
    if (data.cpu !== undefined) updateCPU(data.cpu);
    if (data.memory !== undefined) updateMemory(data.memory);
    if (data.disk !== undefined) updateDisk(data.disk);
    if (data.network !== undefined) updateNetwork(data.network);
    
    // Nested stats object
    if (data.stats) {
        if (data.stats.ping) updatePing(data.stats.ping);
        if (data.stats.uptime) updateUptime(data.stats.uptime);
        if (data.stats.cpu) updateCPU(data.stats.cpu);
        if (data.stats.memory) updateMemory(data.stats.memory);
        if (data.stats.disk) updateDisk(data.stats.disk);
        if (data.stats.network) updateNetwork(data.stats.network);
    }
}

function updateTimestamp() {
    const now = new Date();
    DOM.timestamp.textContent = now.toLocaleTimeString('id-ID');
    DOM.lastSync.textContent = now.toLocaleTimeString('id-ID');
}

function updatePing(ping) {
    const val = Math.round(ping);
    DOM.pingValue.textContent = val;
    
    const cls = getStatusClass(val, { good: 50, warn: 150 });
    DOM.pingStatus.className = cls;
    DOM.pingStatus.textContent = cls === 'stat-good' ? 'Excellent' : cls === 'stat-warn' ? 'Moderate' : 'High Latency';
    
    state.pingHistory.push(val);
    if (state.pingHistory.length > 10) state.pingHistory.shift();
    
    const bars = DOM.pingBars.querySelectorAll('.bar');
    const max = Math.max(...state.pingHistory, 100);
    
    bars.forEach((bar, i) => {
        const v = state.pingHistory[i] || 0;
        bar.style.height = `${Math.max(4, (v / max) * 40)}px`;
        bar.classList.remove('active', 'warning', 'danger');
        if (v > 0) {
            if (v < 50) bar.classList.add('active');
            else if (v < 150) bar.classList.add('warning');
            else bar.classList.add('danger');
        }
    });
}

function updateUptime(uptime) {
    const sec = parseInt(uptime) || state.uptimeSeconds;
    state.uptimeSeconds = sec;
    
    DOM.uptimeDays.textContent = padZero(Math.floor(sec / 86400));
    DOM.uptimeHours.textContent = padZero(Math.floor((sec % 86400) / 3600));
    DOM.uptimeMins.textContent = padZero(Math.floor((sec % 3600) / 60));
    DOM.uptimeSecs.textContent = padZero(sec % 60);
    
    DOM.uptimePercent.textContent = '99.98%';
    DOM.uptimeStatus.className = 'stat-good';
    DOM.uptimeStatus.textContent = 'Running stable';
}

function updateCPU(cpu) {
    const val = Math.min(100, Math.max(0, cpu));
    DOM.cpuValue.textContent = Math.round(val);
    
    const arc = 251.33;
    DOM.cpuGaugeFill.setAttribute('stroke-dasharray', `${(val / 100) * arc} ${arc}`);
    
    const cls = getStatusClass(val, { good: 50, warn: 80 });
    DOM.cpuStatus.className = cls;
    DOM.cpuStatus.textContent = cls === 'stat-good' ? 'Normal load' : cls === 'stat-warn' ? 'High load' : 'Critical';
}

function updateMemory(mem) {
    let used, total, cached = 0;
    
    if (typeof mem === 'object') {
        used = mem.used || mem.usedBytes || 0;
        total = mem.total || mem.totalBytes || 1;
        cached = mem.cached || 0;
    } else {
        total = 16 * 1024 ** 3;
        used = (mem / 100) * total;
    }
    
    const pct = (used / total) * 100;
    const cachedPct = (cached / total) * 100;
    
    DOM.memoryUsed.textContent = (used / 1024 ** 3).toFixed(1) + ' GB';
    DOM.memoryTotal.textContent = (total / 1024 ** 3).toFixed(1) + ' GB';
    DOM.memoryPercent.textContent = Math.round(pct) + '%';
    DOM.memoryUsedBar.style.width = `${pct - cachedPct}%`;
    DOM.memoryCachedBar.style.width = `${cachedPct}%`;
    
    const cls = getStatusClass(pct, { good: 60, warn: 85 });
    DOM.memoryStatus.className = cls;
    DOM.memoryStatus.textContent = cls === 'stat-good' ? 'Healthy' : cls === 'stat-warn' ? 'High usage' : 'Critical';
}

function updateDisk(disk) {
    let used, total;
    
    if (typeof disk === 'object') {
        used = disk.used || disk.usedBytes || 0;
        total = disk.total || disk.totalBytes || 1;
    } else {
        total = 500 * 1024 ** 3;
        used = (disk / 100) * total;
    }
    
    const pct = (used / total) * 100;
    
    DOM.diskUsed.textContent = (used / 1024 ** 3).toFixed(1) + ' GB';
    DOM.diskTotal.textContent = (total / 1024 ** 3).toFixed(1) + ' GB';
    DOM.diskFree.textContent = ((total - used) / 1024 ** 3).toFixed(1) + ' GB';
    DOM.diskPercent.textContent = Math.round(pct);
    
    const circ = 314.16;
    DOM.diskGaugeFill.setAttribute('stroke-dasharray', `${(pct / 100) * circ} ${circ}`);
    
    const cls = getStatusClass(pct, { good: 70, warn: 90 });
    DOM.diskStatus.className = cls;
    DOM.diskStatus.textContent = cls === 'stat-good' ? 'Plenty of space' : cls === 'stat-warn' ? 'Running low' : 'Critical';
}

function updateNetwork(net) {
    let up = 0, down = 0;
    
    if (typeof net === 'object') {
        up = net.tx || net.upload || net.bytesSent || 0;
        down = net.rx || net.download || net.bytesReceived || 0;
    }
    
    const speedUp = Math.max(0, up - state.lastNetworkBytes.up);
    const speedDown = Math.max(0, down - state.lastNetworkBytes.down);
    
    state.lastNetworkBytes.up = up;
    state.lastNetworkBytes.down = down;
    
    DOM.networkUp.textContent = formatBytes(speedUp) + '/s';
    DOM.networkDown.textContent = formatBytes(speedDown) + '/s';
    
    state.networkHistory.upload.push(speedUp);
    state.networkHistory.download.push(speedDown);
    
    if (state.networkHistory.upload.length > CONFIG.networkChartPoints) {
        state.networkHistory.upload.shift();
        state.networkHistory.download.shift();
    }
    
    drawNetworkChart();
}

function drawNetworkChart() {
    const canvas = DOM.networkCanvas;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const w = rect.width;
    const h = rect.height;
    
    ctx.clearRect(0, 0, w, h);
    
    const all = [...state.networkHistory.upload, ...state.networkHistory.download];
    const max = Math.max(...all, 1000);
    
    const drawLine = (data, color) => {
        if (data.length < 2) return;
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        const step = (w - 8) / (CONFIG.networkChartPoints - 1);
        
        data.forEach((v, i) => {
            const x = 4 + i * step;
            const y = h - 4 - (v / max) * (h - 8);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        
        ctx.stroke();
    };
    
    drawLine(state.networkHistory.upload, '#10b981');
    drawLine(state.networkHistory.download, '#00d9ff');
}

function init() {
    console.log('Initializing Dashboard...');
    
    // Init chart arrays
    for (let i = 0; i < CONFIG.networkChartPoints; i++) {
        state.networkHistory.upload.push(0);
        state.networkHistory.download.push(0);
    }
    
    // Set default core info
    DOM.cpuCores.textContent = '--';
    
    // Start connection
    connectWebSocket();
    
    // Event listeners
    window.addEventListener('resize', drawNetworkChart);
    setInterval(updateTimestamp, 1000);
    updateTimestamp();
}

document.addEventListener('DOMContentLoaded', init);
