// Topo Hunter Application JS
// Author: hrichter
// ===============================================

// Application data from JSON
const appData = {
    "hero_text_paragraphs": [
        "Nosso algoritmo proprietário combina os 7 indicadores on-chain e macroeconômicos mais relevantes – cada um cuidadosamente ponderado – para formar um score único de risco de topo de ciclo. Ao normalizar cada métrica dentro de intervalos históricos, conseguimos transformar diferentes escalas em um único valor comparável.",
        "Identificar corretamente os topos de ciclo é vital para quem busca maximizar a quantidade de BTC ao longo do tempo. Realizar parcialmente em momentos de exuberância e recomprar em períodos de medo pode aumentar significativamente a sua posição líquida em satoshis.",
        "O Topo Hunter foi criado exatamente com esse objetivo: ajudar Bitcoiners a realizar na hora certa, fornecendo um painel claro sobre onde estamos no ciclo de mercado.",
        "Utilizamos mais de 10 anos de dados históricos para calibrar as fronteiras de risco, assegurando uma abordagem estatisticamente sólida e alinhada às mudanças de regime macroeconômico."
    ],
    "indicators": [
        {"id": "mvrv", "name": "MVRV", "weight": 20, "description": "Market Value to Realized Value – mede sobrecompra on-chain."},
        {"id": "mayer", "name": "Múltiplo de Mayer", "weight": 10, "description": "Preço / média móvel de 200 dias."},
        {"id": "coinbase", "name": "Ranking Coinbase", "weight": 10, "description": "Posição do app Coinbase na App Store como proxy de interesse de varejo."},
        {"id": "m2", "name": "Expansão do M2 EUA", "weight": 25, "description": "Crescimento mensal anualizado da base monetária americana."},
        {"id": "rates", "name": "Taxa de Juros EUA", "weight": 15, "description": "Federal Funds Rate – aperto ou afrouxamento monetário."},
        {"id": "fear", "name": "Fear & Greed", "weight": 10, "description": "Índice de sentimento de mercado cripto."},
        {"id": "liq", "name": "Liquidez Mundial", "weight": 10, "description": "Índice composto de liquidez global."}
    ],
    "defaultIndicatorValues": {
        "mvrv": 6.5,
        "mayer": 4.2,
        "coinbase": 7.2,
        "m2": 7.8,
        "rates": 5.2,
        "fear": 8.6,
        "liq": 7.5
    },
    "donations": {
        "lightning": "lnbc1p583a50pp57ggml5pvls7tuhkajra42wz2zws48zlnastw9lkt8uprxq3jzt7sdqqcqzzsxqrrsssp5wqfzmvslf560hgxer0g0h5x4u5s536ywglf6fmrm5whd0l80prhs9qxpqysgqdw8evxnvpz8gx2zt7a0fq50e5xvjyr5py0k6ec2x3q26877dg6dz2k0j5mvtjjuhqc63vvpl4uu07hc6s6cmydxmdtxl0x9du5gqrlsp8n0avy",
        "onchain": "bc1quaq3lqr0n2kn0e6feudyl7zjun23ftjn0k3kys"
    }
};

// Historical data (mock data for demonstration)
const historicalData = [
    {"data": "Mar/15", "score": 2.45, "status": "Baixo Risco"},
    {"data": "Jun/15", "score": 2.67, "status": "Baixo Risco"},
    {"data": "Set/15", "score": 2.89, "status": "Baixo Risco"},
    {"data": "Dez/15", "score": 3.12, "status": "Baixo Risco"},
    {"data": "Mar/16", "score": 3.34, "status": "Baixo Risco"},
    {"data": "Jun/16", "score": 3.56, "status": "Baixo Risco"},
    {"data": "Set/16", "score": 3.78, "status": "Baixo Risco"},
    {"data": "Dez/16", "score": 4.01, "status": "Baixo Risco"},
    {"data": "Mar/17", "score": 4.23, "status": "Baixo Risco"},
    {"data": "Jun/17", "score": 5.67, "status": "Baixo Risco"},
    {"data": "Set/17", "score": 7.89, "status": "Aproximação"},
    {"data": "Dez/17", "score": 9.47, "status": "Alto Risco"},
    {"data": "Mar/18", "score": 6.12, "status": "Aproximação"},
    {"data": "Jun/18", "score": 3.45, "status": "Baixo Risco"},
    {"data": "Set/18", "score": 2.34, "status": "Baixo Risco"},
    {"data": "Dez/18", "score": 1.58, "status": "Baixo Risco"},
    {"data": "Mar/19", "score": 2.78, "status": "Baixo Risco"},
    {"data": "Jun/19", "score": 3.45, "status": "Baixo Risco"},
    {"data": "Set/19", "score": 4.12, "status": "Baixo Risco"},
    {"data": "Dez/19", "score": 4.67, "status": "Baixo Risco"},
    {"data": "Mar/20", "score": 3.89, "status": "Baixo Risco"},
    {"data": "Jun/20", "score": 5.23, "status": "Baixo Risco"},
    {"data": "Set/20", "score": 6.78, "status": "Aproximação"},
    {"data": "Dez/20", "score": 7.34, "status": "Aproximação"},
    {"data": "Mar/21", "score": 8.12, "status": "Alto Risco"},
    {"data": "Jun/21", "score": 9.12, "status": "Alto Risco"},
    {"data": "Set/21", "score": 7.89, "status": "Aproximação"},
    {"data": "Dez/21", "score": 8.89, "status": "Alto Risco"},
    {"data": "Mar/22", "score": 6.45, "status": "Aproximação"},
    {"data": "Jun/22", "score": 4.23, "status": "Baixo Risco"},
    {"data": "Set/22", "score": 3.12, "status": "Baixo Risco"},
    {"data": "Dez/22", "score": 2.67, "status": "Baixo Risco"},
    {"data": "Mar/23", "score": 2.15, "status": "Baixo Risco"},
    {"data": "Jun/23", "score": 3.34, "status": "Baixo Risco"},
    {"data": "Set/23", "score": 4.56, "status": "Baixo Risco"},
    {"data": "Dez/23", "score": 5.12, "status": "Baixo Risco"},
    {"data": "Mar/24", "score": 5.67, "status": "Baixo Risco"},
    {"data": "Jun/24", "score": 6.23, "status": "Aproximação"},
    {"data": "Set/24", "score": 6.78, "status": "Aproximação"},
    {"data": "Dez/24", "score": 6.45, "status": "Aproximação"},
    {"data": "Mar/25", "score": 6.12, "status": "Aproximação"},
    {"data": "Jun/25", "score": 6.67, "status": "Aproximação"},
    {"data": "Set/25", "score": 6.95, "status": "Aproximação"}
];

let chartInstance;

// -----------------------------------------------
// 1. Navigation & smooth scrolling
// -----------------------------------------------
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav__menu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', e => {
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navToggle && navMenu && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });
}

function initScrollHighlight() {
    const links = document.querySelectorAll('.nav__link');
    const sections = [...document.querySelectorAll('section[id]')];

    const highlight = () => {
        const y = window.scrollY + 150;
        let current = '';
        sections.forEach(sec => {
            if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
                current = `#${sec.id}`;
            }
        });
        links.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === current);
        });
    };

    window.addEventListener('scroll', highlight);
    highlight();
}

// Smooth scroll (native css behavior is already enabled but we adjust offset for fixed header)
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            const headerH = document.querySelector('.header').offsetHeight;
            const top = target.offsetTop - headerH - 20;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

// -----------------------------------------------
// 2. Chart.js setup
// -----------------------------------------------
function buildChart() {
    const ctx = document.getElementById('historical-chart');
    if (!ctx) return;

    const labels = historicalData.map(d => d.data);
    const scores = historicalData.map(d => d.score);

    const pointColors = scores.map(s => (s < 6 ? '#28A745' : s < 8 ? '#FFA500' : '#DC3545'));

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Score Topo Hunter',
                data: scores,
                fill: true,
                borderColor: '#007BFF',
                backgroundColor: 'rgba(0,123,255,0.15)',
                pointBackgroundColor: pointColors,
                pointBorderColor: pointColors,
                tension: 0.35,
                pointRadius: 4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return historicalData[index].data;
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const data = historicalData[index];
                            return [
                                `Score: ${data.score.toFixed(2)}`,
                                `Status: ${data.status}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    suggestedMin: 0,
                    suggestedMax: 10,
                    grid: {
                        color: (ctx) => {
                            if (ctx.tick.value === 6) return '#FFA500';
                            if (ctx.tick.value === 8) return '#C21807';
                            return 'rgba(0,0,0,0.1)';
                        },
                        lineWidth: (ctx) => (ctx.tick.value === 6 || ctx.tick.value === 8 ? 2 : 1)
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// -----------------------------------------------
// 3. Table generation + sort/search/filter
// -----------------------------------------------
function generateMockData(score) {
    // Generate realistic mock data based on score
    const normalizedScore = score / 10;
    
    return {
        mvrv: (2.5 + normalizedScore * 1.5).toFixed(2),
        mayer: (1.0 + normalizedScore * 1.2).toFixed(2),
        coinbase: Math.round(400 - normalizedScore * 350),
        m2: (normalizedScore * 0.8).toFixed(2),
        juros: (5.5 - normalizedScore * 5.0).toFixed(2),
        fg: Math.round(20 + normalizedScore * 70),
        liquidity: Math.round(20 + normalizedScore * 80)
    };
}

function buildTable() {
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    historicalData.forEach(d => {
        const tr = document.createElement('tr');
        if (d.status === 'Aproximação') tr.classList.add('approximation-row');
        if (d.status === 'Alto Risco') tr.classList.add('high-risk-row');
        
        const mockData = generateMockData(d.score);
        const statusClass = d.status === 'Baixo Risco' ? 'success' : 
                           d.status === 'Aproximação' ? 'warning' : 'error';
        
        tr.innerHTML = `
            <td>${d.data}</td>
            <td>${mockData.mvrv}</td>
            <td>${mockData.mayer}</td>
            <td>${mockData.coinbase}</td>
            <td>${mockData.m2}%</td>
            <td>${mockData.juros}%</td>
            <td>${mockData.fg}</td>
            <td>${mockData.liquidity}</td>
            <td class="font-weight-bold">${d.score.toFixed(2)}</td>
            <td><span class="status status--${statusClass}">${d.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function initTableControls() {
    const periodFilter = document.getElementById('period-filter');
    const statusFilter = document.getElementById('status-filter');

    const applyFilters = () => {
        let data = [...historicalData];
        
        if (periodFilter.value !== 'all') {
            const [start, end] = periodFilter.value.split('-').map(Number);
            data = data.filter(d => {
                const year = parseInt(d.data.slice(-2));
                const fullYr = year < 30 ? 2000 + year : 1900 + year;
                return fullYr >= start && fullYr <= end;
            });
        }
        
        if (statusFilter.value !== 'all') {
            data = data.filter(d => d.status === statusFilter.value);
        }
        
        renderRows(data);
    };

    [periodFilter, statusFilter].forEach(el => el.addEventListener('change', applyFilters));

    const renderRows = (data) => {
        const tbody = document.getElementById('data-table-body');
        tbody.innerHTML = '';
        data.forEach(d => {
            const tr = document.createElement('tr');
            if (d.status === 'Aproximação') tr.classList.add('approximation-row');
            if (d.status === 'Alto Risco') tr.classList.add('high-risk-row');
            
            const mockData = generateMockData(d.score);
            const statusClass = d.status === 'Baixo Risco' ? 'success' : 
                               d.status === 'Aproximação' ? 'warning' : 'error';
            
            tr.innerHTML = `
                <td>${d.data}</td>
                <td>${mockData.mvrv}</td>
                <td>${mockData.mayer}</td>
                <td>${mockData.coinbase}</td>
                <td>${mockData.m2}%</td>
                <td>${mockData.juros}%</td>
                <td>${mockData.fg}</td>
                <td>${mockData.liquidity}</td>
                <td class="font-weight-bold">${d.score.toFixed(2)}</td>
                <td><span class="status status--${statusClass}">${d.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    applyFilters();
}

// -----------------------------------------------
// 4. Simulator
// -----------------------------------------------
function initSimulator() {
    const inputs = {
        mvrv: document.getElementById('sim-mvrv'),
        mayer: document.getElementById('sim-mayer'),
        coinbase: document.getElementById('sim-coinbase'),
        m2: document.getElementById('sim-m2'),
        rates: document.getElementById('sim-rates'),
        fear: document.getElementById('sim-fear'),
        liq: document.getElementById('sim-liq')
    };

    const scoreDisplay = document.getElementById('calculated-score');
    const statusDisplay = document.getElementById('score-status');
    const breakdownList = document.getElementById('score-breakdown-list');
    const updateButton = document.getElementById('update-simulator');
    const resetButton = document.getElementById('reset-simulator');

    // Set initial values from defaultIndicatorValues
    if (inputs.mvrv) inputs.mvrv.value = appData.defaultIndicatorValues.mvrv;
    if (inputs.mayer) inputs.mayer.value = appData.defaultIndicatorValues.mayer;
    if (inputs.coinbase) inputs.coinbase.value = appData.defaultIndicatorValues.coinbase;
    if (inputs.m2) inputs.m2.value = appData.defaultIndicatorValues.m2;
    if (inputs.rates) inputs.rates.value = appData.defaultIndicatorValues.rates;
    if (inputs.fear) inputs.fear.value = appData.defaultIndicatorValues.fear;
    if (inputs.liq) inputs.liq.value = appData.defaultIndicatorValues.liq;

    function calculateScore() {
        const values = {};
        let totalScore = 0;

        // Get current values from inputs
        Object.keys(inputs).forEach(key => {
            if (inputs[key]) {
                values[key] = parseFloat(inputs[key].value) || 0;
            }
        });

        // Calculate score based on weighted average
        const weights = {
            mvrv: 0.20,
            mayer: 0.10,
            coinbase: 0.10,
            m2: 0.25,
            rates: 0.15,
            fear: 0.10,
            liq: 0.10
        };

        Object.keys(weights).forEach(key => {
            if (values[key] !== undefined) {
                totalScore += values[key] * weights[key];
            }
        });

        // Update display
        scoreDisplay.textContent = totalScore.toFixed(2);

        // Update status with color
        let status, statusClass;
        if (totalScore <= 6) {
            status = 'Baixo Risco';
            statusClass = 'success';
        } else if (totalScore <= 8) {
            status = 'Aproximação';
            statusClass = 'warning';
        } else {
            status = 'Alto Risco';
            statusClass = 'error';
        }

        statusDisplay.textContent = status;
        statusDisplay.className = `status status--${statusClass}`;

        // Update breakdown
        breakdownList.innerHTML = '';
        Object.keys(weights).forEach(key => {
            const indicator = appData.indicators.find(i => i.id === key);
            const name = indicator ? indicator.name : key.toUpperCase();
            const weight = weights[key];
            const contribution = (values[key] || 0) * weight;
            
            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item';
            breakdownItem.innerHTML = `
                <span class="breakdown-label">${name} (${(weight * 100).toFixed(0)}%)</span>
                <span class="breakdown-value">${contribution.toFixed(2)}</span>
            `;
            breakdownList.appendChild(breakdownItem);
        });
    }

    // Add event listeners to all inputs for real-time calculation
    Object.keys(inputs).forEach(key => {
        if (inputs[key]) {
            inputs[key].addEventListener('input', calculateScore);
            inputs[key].addEventListener('change', calculateScore);
        }
    });

    // Update button functionality
    if (updateButton) {
        updateButton.addEventListener('click', calculateScore);
    }

    // Reset button functionality
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            Object.keys(inputs).forEach(key => {
                if (inputs[key]) {
                    inputs[key].value = appData.defaultIndicatorValues[key];
                }
            });
            calculateScore();
        });
    }

    // Initial calculation
    calculateScore();
}

// -----------------------------------------------
// 5. Copy to clipboard functionality
// -----------------------------------------------
function initCopyFunctionality() {
    const donationAddresses = document.querySelectorAll('.donation-address');
    
    donationAddresses.forEach(address => {
        const code = address.querySelector('code');
        if (code) {
            address.style.cursor = 'pointer';
            address.title = 'Clique para copiar';
            
            address.addEventListener('click', function() {
                navigator.clipboard.writeText(code.textContent).then(() => {
                    const originalText = code.textContent;
                    const originalColor = code.style.color;
                    
                    code.textContent = 'Copiado!';
                    code.style.color = '#28A745';
                    
                    setTimeout(() => {
                        code.textContent = originalText;
                        code.style.color = originalColor;
                    }, 2000);
                }).catch(err => {
                    console.error('Erro ao copiar:', err);
                });
            });
        }
    });
}

// -----------------------------------------------
// 6. Main initialization
// -----------------------------------------------
async function waitForChartJS() {
    return new Promise((resolve) => {
        if (typeof Chart !== 'undefined') {
            resolve();
        } else {
            const checkChart = setInterval(() => {
                if (typeof Chart !== 'undefined') {
                    clearInterval(checkChart);
                    resolve();
                }
            }, 100);
        }
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Topo Hunter application...');
    
    // Wait for Chart.js to load
    await waitForChartJS();
    
    // Initialize all modules
    initNavigation();
    initScrollHighlight();
    initSmoothScroll();
    buildChart();
    buildTable();
    initTableControls();
    initSimulator();
    initCopyFunctionality();
    
    console.log('Topo Hunter application initialized successfully');
});

// -----------------------------------------------
// 7. Utility functions and error handling
// -----------------------------------------------
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape to close mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav__menu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    }
});

// Console welcome message
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║             🟠 TOPO HUNTER BY HRICHTER 🟠                   ║
║                                                              ║
║        Simulador de Análise de Topo do Ciclo do Bitcoin     ║
║                                                              ║
║  Desenvolvido para auxiliar Bitcoiners a identificar        ║
║  momentos ideais para realizar lucros e aumentar            ║
║  suas posições em BTC                                       ║
║                                                              ║
║  📧 hrichter@dmail.ai                                       ║
║  ⚡ Lightning Network donations available                   ║
║  ₿ Bitcoin donations available                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

console.log('✅ Topo Hunter app.js loaded successfully');