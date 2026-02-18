/* ============================================
   AL FARRIZI MUSIC BOT - DASHBOARD SCRIPTS
   Modern Glassmorphism Admin Panel
   Version: 4.23.7
   ============================================ */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather Icons
    feather.replace();
    
    // Initialize all components
    initNavigation();
    initSidebar();
    initTheme();
    initCharts();
    initStarRating();
    initCommandCategories();
    initFilters();
    initSourceManagers();
    initSystemResources();
    initAnimations();
    
    // Load saved preferences
    loadUserPreferences();
    
    console.log('🎵 Al Farrizi Music Bot Dashboard v4.23.7 initialized');
});

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPage = item.dataset.page;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `page-${targetPage}`) {
                    page.classList.add('active');
                }
            });
            
            // Close mobile sidebar after navigation
            closeMobileSidebar();
            
            // Update URL hash
            window.location.hash = targetPage;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Handle initial hash
    handleInitialHash();
}

function handleInitialHash() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        const targetNav = document.querySelector(`.nav-item[data-page="${hash}"]`);
        if (targetNav) {
            targetNav.click();
        }
    }
}

// Listen for hash changes
window.addEventListener('hashchange', handleInitialHash);

// ============================================
// SIDEBAR
// ============================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const savedState = localStorage.getItem('sidebarCollapsed');
    
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // Save state
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    
    // Re-render icons after toggle
    setTimeout(() => feather.replace(), 300);
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('mobile-open');
    
    // Toggle body scroll
    document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('mobile-open');
    document.body.style.overflow = '';
}

// Close sidebar on outside click (mobile)
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    
    if (sidebar.classList.contains('mobile-open') && 
        !sidebar.contains(e.target) && 
        !mobileToggle.contains(e.target)) {
        closeMobileSidebar();
    }
});

// ============================================
// THEME CUSTOMIZATION
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedColor = localStorage.getItem('primaryColor') || '#6366f1';
    const savedBgImage = localStorage.getItem('bgImage');
    
    setTheme(savedTheme, false);
    setPrimaryColor(savedColor, false);
    
    if (savedBgImage) {
        document.getElementById('bgImageInput').value = savedBgImage;
        applyBackgroundImage(false);
    }
}

function setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    // Update charts for theme
    updateChartsTheme();
    
    if (save) {
        localStorage.setItem('theme', theme);
        showToast('success', 'Theme Updated', `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode activated`);
    }
}

function setPrimaryColor(color, save = true) {
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Calculate lighter and darker variants
    const lighterColor = adjustColorBrightness(color, 30);
    const darkerColor = adjustColorBrightness(color, -20);
    
    document.documentElement.style.setProperty('--primary-light', lighterColor);
    document.documentElement.style.setProperty('--primary-dark', darkerColor);
    
    // Update color option buttons
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
    
    if (save) {
        localStorage.setItem('primaryColor', color);
        showToast('success', 'Color Updated', 'Primary color has been changed');
    }
}

function adjustColorBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

function applyBackgroundImage(save = true) {
    const input = document.getElementById('bgImageInput');
    const url = input.value.trim();
    
    if (url) {
        // Validate URL
        const img = new Image();
        img.onload = () => {
            document.querySelector('.background-image').style.backgroundImage = `url('${url}')`;
            if (save) {
                localStorage.setItem('bgImage', url);
                showToast('success', 'Background Updated', 'New background image applied');
            }
        };
        img.onerror = () => {
            showToast('error', 'Invalid Image', 'Could not load the image URL');
        };
        img.src = url;
    } else {
        // Reset to default
        document.querySelector('.background-image').style.backgroundImage = '';
        localStorage.removeItem('bgImage');
        if (save) {
            showToast('info', 'Background Reset', 'Default background restored');
        }
    }
}

function toggleCustomizer() {
    const customizer = document.getElementById('themeCustomizer');
    customizer.classList.toggle('open');
}

// Close customizer on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const customizer = document.getElementById('themeCustomizer');
        if (customizer.classList.contains('open')) {
            customizer.classList.remove('open');
        }
    }
});

// ============================================
// CHARTS
// ============================================

let playerChart, nowPlayingChart, cpuChart, memoryChart, diskChart;

function initCharts() {
    initPlayerChart();
    initNowPlayingChart();
    initResourceCharts();
}

function getChartColors() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
        text: isDark ? '#a1a1aa' : '#64748b',
        grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6366f1',
        gradient1: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)',
        gradient2: 'rgba(99, 102, 241, 0)'
    };
}

function initPlayerChart() {
    const ctx = document.getElementById('playerChart');
    if (!ctx) return;
    
    const colors = getChartColors();
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, colors.gradient1);
    gradient.addColorStop(1, colors.gradient2);
    
    playerChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Tracks Played',
                data: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
                borderColor: colors.primary,
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }, {
                label: 'Active Servers',
                data: [800, 1100, 950, 1300, 1200, 1500, 1400],
                borderColor: '#8b5cf6',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colors.text,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text
                    }
                },
                y: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function initNowPlayingChart() {
    const ctx = document.getElementById('nowPlayingChart');
    if (!ctx) return;
    
    const colors = getChartColors();
    
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    
    nowPlayingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
            datasets: [{
                label: 'Active Tracks',
                data: [15, 8, 12, 45, 52, 68, 43],
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }, {
                label: 'Listeners',
                data: [120, 65, 95, 380, 420, 550, 350],
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#f59e0b',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colors.text,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text
                    }
                },
                y: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text
                    },
                    beginAtZero: true,
                    position: 'left'
                },
                y1: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: colors.text
                    },
                    beginAtZero: true,
                    position: 'right'
                }
            }
        }
    });
}

function initResourceCharts() {
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false, min: 0, max: 100 }
            },
            elements: {
                point: { radius: 0 },
                line: { borderWidth: 2, tension: 0.4 }
            }
        }
    };
    
    // CPU Chart
    const cpuCtx = document.getElementById('cpuChart');
    if (cpuCtx) {
        cpuChart = new Chart(cpuCtx, {
            ...chartConfig,
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: generateRandomData(20, 20, 35),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true
                }]
            }
        });
    }
    
    // Memory Chart
    const memCtx = document.getElementById('memoryChart');
    if (memCtx) {
        memoryChart = new Chart(memCtx, {
            ...chartConfig,
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: generateRandomData(20, 25, 40),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                }]
            }
        });
    }
    
    // Disk Chart
    const diskCtx = document.getElementById('diskChart');
    if (diskCtx) {
        diskChart = new Chart(diskCtx, {
            ...chartConfig,
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: generateRandomData(20, 40, 50),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true
                }]
            }
        });
    }
}

function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

function updatePlayerChart() {
    const period = document.getElementById('playerChartPeriod').value;
    let labels, data1, data2;
    
    switch(period) {
        case '7':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data1 = [1200, 1900, 1500, 2100, 1800, 2400, 2200];
            data2 = [800, 1100, 950, 1300, 1200, 1500, 1400];
            break;
        case '30':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data1 = [8500, 12000, 10500, 15000];
            data2 = [5200, 7500, 6800, 9200];
            break;
        case '90':
            labels = ['Jan', 'Feb', 'Mar'];
            data1 = [35000, 42000, 48000];
            data2 = [22000, 28000, 32000];
            break;
    }
    
    if (playerChart) {
        playerChart.data.labels = labels;
        playerChart.data.datasets[0].data = data1;
        playerChart.data.datasets[1].data = data2;
        playerChart.update('active');
    }
}

function updateNowPlayingChart() {
    const period = document.getElementById('nowPlayingChartPeriod').value;
    let labels, data1, data2;
    
    switch(period) {
        case '24':
            labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
            data1 = [15, 8, 12, 45, 52, 68, 43];
            data2 = [120, 65, 95, 380, 420, 550, 350];
            break;
        case '7':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data1 = [38, 42, 35, 48, 55, 72, 65];
            data2 = [320, 380, 290, 420, 480, 650, 580];
            break;
    }
    
    if (nowPlayingChart) {
        nowPlayingChart.data.labels = labels;
        nowPlayingChart.data.datasets[0].data = data1;
        nowPlayingChart.data.datasets[1].data = data2;
        nowPlayingChart.update('active');
    }
}

function updateChartsTheme() {
    const colors = getChartColors();
    
    const updateChart = (chart) => {
        if (!chart) return;
        
        chart.options.plugins.legend.labels.color = colors.text;
        chart.options.scales.x.ticks.color = colors.text;
        chart.options.scales.x.grid.color = colors.grid;
        chart.options.scales.y.ticks.color = colors.text;
        chart.options.scales.y.grid.color = colors.grid;
        
        if (chart.options.scales.y1) {
            chart.options.scales.y1.ticks.color = colors.text;
        }
        
        chart.update();
    };
    
    updateChart(playerChart);
    updateChart(nowPlayingChart);
}

// ============================================
// SYSTEM RESOURCES SIMULATION
// ============================================

function initSystemResources() {
    // Update resources every 2 seconds
    setInterval(updateSystemResources, 2000);
}

function updateSystemResources() {
    // Simulate CPU usage
    const cpuValue = Math.floor(Math.random() * 15) + 20;
    updateResourceDisplay('cpu', cpuValue, `${cpuValue}%`);
    
    // Simulate Memory usage
    const memoryValue = Math.floor(Math.random() * 10) + 25;
    const memoryGB = (memoryValue / 100 * 8).toFixed(1);
    updateResourceDisplay('memory', memoryValue, `${memoryGB} GB / 8 GB`);
    
    // Simulate Disk usage (more stable)
    const diskValue = 45 + Math.floor(Math.random() * 3);
    const diskGB = (diskValue / 100 * 100).toFixed(1);
    updateResourceDisplay('disk', diskValue, `${diskGB} GB / 100 GB`);
    
    // Update mini charts
    updateResourceChart(cpuChart, cpuValue);
    updateResourceChart(memoryChart, memoryValue);
    updateResourceChart(diskChart, diskValue);
}

function updateResourceDisplay(type, value, text) {
    const progressEl = document.getElementById(`${type}Progress`);
    const valueEl = document.getElementById(`${type}Value`);
    
    if (progressEl) {
        progressEl.style.width = `${value}%`;
        
        // Change color based on value
        if (value > 80) {
            progressEl.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        } else if (value > 60) {
            progressEl.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        }
    }
    
    if (valueEl) {
        valueEl.textContent = text;
    }
}

function updateResourceChart(chart, newValue) {
    if (!chart) return;
    
    chart.data.datasets[0].data.shift();
    chart.data.datasets[0].data.push(newValue);
    chart.update('none');
}

// ============================================
// COMMANDS
// ============================================

function initCommandCategories() {
    // All categories start expanded
    document.querySelectorAll('.category-header').forEach(header => {
        header.classList.remove('collapsed');
        const content = header.nextElementSibling;
        if (content) {
            content.classList.remove('collapsed');
        }
    });
}

function toggleCategory(header) {
    header.classList.toggle('collapsed');
    const content = header.nextElementSibling;
    
    if (content) {
        content.classList.toggle('collapsed');
    }
    
    // Re-render icons
    feather.replace();
}

function copyCommand(command) {
    navigator.clipboard.writeText(command).then(() => {
        showToast('success', 'Copied!', `Command "${command}" copied to clipboard`);
        
        // Visual feedback on button
        event.target.closest('.copy-btn').classList.add('copied');
        setTimeout(() => {
            event.target.closest('.copy-btn').classList.remove('copied');
        }, 1000);
    }).catch(err => {
        showToast('error', 'Copy Failed', 'Could not copy to clipboard');
    });
}

// ============================================
// SOURCE MANAGERS
// ============================================

function initSourceManagers() {
    // Load saved states
    const sources = ['youtube', 'spotify', 'soundcloud', 'http'];
    sources.forEach(source => {
        const saved = localStorage.getItem(`source_${source}`);
        if (saved !== null) {
            const toggle = document.querySelector(`[onchange="toggleSource('${source}', this.checked)"]`);
            if (toggle) {
                toggle.checked = saved === 'true';
                updateSourceStatus(source, saved === 'true');
            }
        }
    });
}

function toggleSource(source, enabled) {
    // Save state
    localStorage.setItem(`source_${source}`, enabled);
    
    // Update UI
    updateSourceStatus(source, enabled);
    
    // Show notification
    const sourceName = source.charAt(0).toUpperCase() + source.slice(1);
    showToast(
        enabled ? 'success' : 'warning',
        `${sourceName} ${enabled ? 'Enabled' : 'Disabled'}`,
        `${sourceName} source has been ${enabled ? 'connected' : 'disconnected'}`
    );
}

function updateSourceStatus(source, enabled) {
    const card = event?.target?.closest('.source-card');
    if (card) {
        const status = card.querySelector('.source-status');
        if (status) {
            status.textContent = enabled ? 'Connected' : 'Disconnected';
            status.className = `source-status ${enabled ? 'online' : 'offline'}`;
        }
    }
}

// ============================================
// AUDIO FILTERS
// ============================================

const filterStates = {
    bassBoost: { enabled: false, value: 50 },
    nightcore: { enabled: false, value: 30 },
    vaporwave: { enabled: false, value: 40 },
    karaoke: { enabled: false, value: 80 },
    speed: { value: 100 },
    pitch: { value: 100 },
    eq: { enabled: false, bands: Array(9).fill(0) }
};

function initFilters() {
    // Load saved filter states
    const saved = localStorage.getItem('filterStates');
    if (saved) {
        Object.assign(filterStates, JSON.parse(saved));
        applyFilterStates();
    }
}

function applyFilterStates() {
    // Apply saved states to UI
    Object.keys(filterStates).forEach(filter => {
        if (filter === 'eq') return;
        if (filter === 'speed' || filter === 'pitch') {
            const slider = document.getElementById(`${filter}Slider`);
            const value = document.getElementById(`${filter}Value`);
            if (slider) slider.value = filterStates[filter].value;
            if (value) value.textContent = (filterStates[filter].value / 100).toFixed(1);
        } else {
            const toggle = document.getElementById(`${filter}Toggle`);
            const slider = document.getElementById(`${filter}Slider`);
            const value = document.getElementById(`${filter}Value`);
            
            if (toggle) toggle.checked = filterStates[filter].enabled;
            if (slider) slider.value = filterStates[filter].value;
            if (value) value.textContent = filterStates[filter].value;
        }
    });
}

function toggleFilter(filter) {
    const toggle = document.getElementById(`${filter}Toggle`);
    filterStates[filter].enabled = toggle.checked;
    
    saveFilterStates();
    
    const filterName = filter.replace(/([A-Z])/g, ' $1').trim();
    showToast(
        toggle.checked ? 'success' : 'info',
        `${filterName} ${toggle.checked ? 'Enabled' : 'Disabled'}`,
        `${filterName} filter has been ${toggle.checked ? 'activated' : 'deactivated'}`
    );
}

function updateFilterValue(filter, value) {
    const valueEl = document.getElementById(`${filter}Value`);
    
    if (filter === 'speed' || filter === 'pitch') {
        filterStates[filter].value = parseInt(value);
        if (valueEl) valueEl.textContent = (value / 100).toFixed(1);
    } else {
        filterStates[filter].value = parseInt(value);
        if (valueEl) valueEl.textContent = value;
    }
    
    // Update preset buttons
    updatePresetButtons(filter, value);
    
    saveFilterStates();
}

function updatePresetButtons(filter, value) {
    const filterCard = document.getElementById(`${filter}Slider`)?.closest('.filter-card');
    if (!filterCard) return;
    
    filterCard.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function setFilterPreset(filter, value) {
    const slider = document.getElementById(`${filter}Slider`);
    if (slider) {
        slider.value = value;
        updateFilterValue(filter, value);
    }
    
    // Update active preset button
    event.target.closest('.filter-presets').querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function resetSpeedPitch() {
    document.getElementById('speedSlider').value = 100;
    document.getElementById('pitchSlider').value = 100;
    document.getElementById('speedValue').textContent = '1.0';
    document.getElementById('pitchValue').textContent = '1.0';
    
    filterStates.speed.value = 100;
    filterStates.pitch.value = 100;
    
    saveFilterStates();
    showToast('info', 'Reset Complete', 'Speed and Pitch reset to default');
}

function updateEQ(band, value) {
    filterStates.eq.bands[band] = parseInt(value);
    saveFilterStates();
}

function setEQPreset(preset) {
    let values;
    
    switch(preset) {
        case 'flat':
            values = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            break;
        case 'bass':
            values = [8, 6, 4, 2, 0, 0, 0, 0, 0];
            break;
        case 'treble':
            values = [0, 0, 0, 0, 2, 4, 6, 8, 10];
            break;
        case 'vocal':
            values = [-2, -1, 0, 4, 6, 4, 0, -1, -2];
            break;
        default:
            values = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    
    // Apply to sliders
    document.querySelectorAll('.eq-slider').forEach((slider, index) => {
        slider.value = values[index];
        filterStates.eq.bands[index] = values[index];
    });
    
    // Update active preset
    document.querySelectorAll('.eq-presets .preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    saveFilterStates();
    showToast('success', 'Preset Applied', `${preset.charAt(0).toUpperCase() + preset.slice(1)} equalizer preset loaded`);
}

function saveFilterStates() {
    localStorage.setItem('filterStates', JSON.stringify(filterStates));
}

// ============================================
// FAQ
// ============================================

function toggleFAQ(item) {
    const isOpen = item.classList.contains('open');
    
    // Close all FAQs
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('open');
    });
    
    // Open clicked one if it wasn't open
    if (!isOpen) {
        item.classList.add('open');
    }
    
    feather.replace();
}

// ============================================
// STAR RATING
// ============================================

function initStarRating() {
    const starRating = document.getElementById('starRating');
    if (!starRating) return;
    
    const stars = starRating.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            ratingInput.value = rating;
            
            stars.forEach((s, index) => {
                s.classList.toggle('active', index < rating);
            });
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, index) => {
                s.classList.toggle('hover', index < rating);
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// ============================================
// FEEDBACK FORM
// ============================================

function submitFeedback(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        type: form.feedbackType.value,
        username: form.discordUsername.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
        rating: document.getElementById('rating').value
    };
    
    // Validate
    if (!formData.type) {
        showToast('error', 'Validation Error', 'Please select a feedback type');
        return;
    }
    
    if (!formData.username) {
        showToast('error', 'Validation Error', 'Discord username is required');
        return;
    }
    
    if (!formData.message) {
        showToast('error', 'Validation Error', 'Please enter your message');
        return;
    }
    
    // Simulate submission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-feather="loader" class="spin"></i> Submitting...';
    feather.replace();
    
    // Simulate API call
    setTimeout(() => {
        showToast('success', 'Feedback Submitted!', 'Thank you for your feedback. We\'ll review it shortly.');
        form.reset();
        
        // Reset star rating
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('active');
        });
        document.getElementById('rating').value = 0;
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-feather="send"></i> Submit Feedback';
        feather.replace();
    }, 1500);
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'alert-triangle',
        info: 'info'
    };
    
    toast.innerHTML = `
        <i data-feather="${iconMap[type]}" class="toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="closeToast(this.parentElement)">
            <i data-feather="x"></i>
        </button>
    `;
    
    container.appendChild(toast);
    feather.replace();
    
    // Auto remove
    setTimeout(() => {
        closeToast(toast);
    }, duration);
}

function closeToast(toast) {
    if (!toast || toast.classList.contains('removing')) return;
    
    toast.classList.add('removing');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// ============================================
// ANIMATIONS & EFFECTS
// ============================================

function initAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe cards and sections
    document.querySelectorAll('.glass-card, .info-card, .stat-card').forEach(el => {
        observer.observe(el);
    });
    
    // Counter animations for stats
    animateCounters();
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-value, .card-content h3');
    
    counters.forEach(counter => {
        const text = counter.textContent;
        const number = parseInt(text.replace(/[^0-9]/g, ''));
        
        if (!isNaN(number) && number > 0) {
            const suffix = text.replace(/[0-9,]/g, '');
            animateCounter(counter, 0, number, 1500, suffix);
        }
    });
}

function animateCounter(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    const range = end - start;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + range * easeOutQuart);
        
        element.textContent = current.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// ============================================
// USER PREFERENCES
// ============================================

function loadUserPreferences() {
    // Load any additional user preferences here
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    
    // Apply preferences
    if (preferences.sidebarCollapsed) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
}

function saveUserPreferences(key, value) {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Random ID generator
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    // Ctrl/Cmd + K - Open search (placeholder)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showToast('info', 'Search', 'Search feature coming soon!');
    }
    
    // Ctrl/Cmd + B - Toggle sidebar
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
    }
    
    // Ctrl/Cmd + , - Open settings
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        toggleCustomizer();
    }
    
    // Number keys 1-8 for navigation
    if (e.key >= '1' && e.key <= '8' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const navItems = document.querySelectorAll('.nav-item');
        const index = parseInt(e.key) - 1;
        if (navItems[index]) {
            navItems[index].click();
        }
    }
});

// ============================================
// RESIZE HANDLER
// ============================================

window.addEventListener('resize', debounce(() => {
    // Close mobile sidebar on resize to desktop
    if (window.innerWidth > 768) {
        closeMobileSidebar();
    }
    
    // Update charts on resize
    if (playerChart) playerChart.resize();
    if (nowPlayingChart) nowPlayingChart.resize();
}, 250));

// ============================================
// PLAYER CONTROLS (DEMO)
// ============================================

let isPlaying = true;
let currentProgress = 45;

document.querySelectorAll('.control-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const icon = btn.querySelector('svg');
        
        if (btn.classList.contains('play-btn')) {
            isPlaying = !isPlaying;
            // This is a simplified demo - feather.replace() will handle icon changes
            showToast('info', isPlaying ? 'Playing' : 'Paused', 
                isPlaying ? 'Playback resumed' : 'Playback paused');
        } else if (icon?.classList?.contains('feather-skip-forward')) {
            showToast('info', 'Next Track', 'Skipped to next track');
        } else if (icon?.classList?.contains('feather-skip-back')) {
            showToast('info', 'Previous Track', 'Went to previous track');
        }
    });
});

// Simulate progress bar update
setInterval(() => {
    if (isPlaying && currentProgress < 100) {
        currentProgress += 0.5;
        const progressBar = document.querySelector('.now-playing .progress');
        if (progressBar) {
            progressBar.style.width = `${currentProgress}%`;
        }
        
        // Update time
        const totalSeconds = 230; // 3:50
        const currentSeconds = Math.floor((currentProgress / 100) * totalSeconds);
        const timeInfo = document.querySelector('.time-info');
        if (timeInfo) {
            timeInfo.children[0].textContent = formatTime(currentSeconds);
        }
    }
}, 1000);

// ============================================
// LIVE STATS UPDATE (DEMO)
// ============================================

setInterval(() => {
    // Update random stat values for demo
    const totalTracks = document.getElementById('totalTracks');
    const totalServers = document.getElementById('totalServers');
    const activeTracks = document.getElementById('activeTracks');
    const currentListeners = document.getElementById('currentListeners');
    
    if (totalTracks) {
        const current = parseInt(totalTracks.textContent.replace(/,/g, ''));
        totalTracks.textContent = formatNumber(current + Math.floor(Math.random() * 3));
    }
    
    if (activeTracks) {
        const current = parseInt(activeTracks.textContent);
        activeTracks.textContent = Math.max(30, current + Math.floor(Math.random() * 5) - 2);
    }
    
    if (currentListeners) {
        const current = parseInt(currentListeners.textContent.replace(/,/g, ''));
        currentListeners.textContent = formatNumber(Math.max(800, current + Math.floor(Math.random() * 20) - 10));
    }
}, 5000);

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('Application Error:', e.error);
    // Optionally show error toast
    // showToast('error', 'Error', 'An unexpected error occurred');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// ============================================
// SERVICE WORKER REGISTRATION (Optional)
// ============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('SW registered'))
        //     .catch(err => console.log('SW registration failed:', err));
    });
}

// ============================================
// EXPORT FUNCTIONS (for module usage)
// ============================================

// If using modules, export necessary functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        toggleSidebar,
        setTheme,
        setPrimaryColor,
        toggleCustomizer
    };
}

// Make functions globally available
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.toggleCustomizer = toggleCustomizer;
window.setTheme = setTheme;
window.setPrimaryColor = setPrimaryColor;
window.applyBackgroundImage = applyBackgroundImage;
window.toggleCategory = toggleCategory;
window.copyCommand = copyCommand;
window.toggleSource = toggleSource;
window.toggleFilter = toggleFilter;
window.updateFilterValue = updateFilterValue;
window.setFilterPreset = setFilterPreset;
window.resetSpeedPitch = resetSpeedPitch;
window.updateEQ = updateEQ;
window.setEQPreset = setEQPreset;
window.toggleFAQ = toggleFAQ;
window.submitFeedback = submitFeedback;
window.showToast = showToast;
window.closeToast = closeToast;
window.updatePlayerChart = updatePlayerChart;
window.updateNowPlayingChart = updateNowPlayingChart;
