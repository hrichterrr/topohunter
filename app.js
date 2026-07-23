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
    "donations": {
        "lightning": "lnbc1p583a50pp57ggml5pvls7tuhkajra42wz2zws48zlnastw9lkt8uprxq3jzt7sdqqcqzzsxqrrsssp5wqfzmvslf560hgxer0g0h5x4u5s536ywglf6fmrm5whd0l80prhs9qxpqysgqdw8evxnvpz8gx2zt7a0fq50e5xvjyr5py0k6ec2x3q26877dg6dz2k0j5mvtjjuhqc63vvpl4uu07hc6s6cmydxmdtxl0x9du5gqrlsp8n0avy",
        "onchain": "bc1quaq3lqr0n2kn0e6feudyl7zjun23ftjn0k3kys"
    }
};

// -----------------------------------------------
// Hunter mode configuration (Topo Hunter / Bottom Hunter)
// -----------------------------------------------
// Topo Hunter looks for cycle-top euphoria; Bottom Hunter mirrors the same
// seven indicators plus an ATH-drawdown indicator, but scores the opposite
// (capitulation/apathy) conditions that historically precede a new bull cycle.
// A single global toggle (see initGlobalModeToggle) switches every section —
// indicators, chart, table and simulator — between the two.
const HUNTER_MODES = {
    topo: {
        label: 'Topo Hunter',
        scoreTitle: 'Score de Topo de Ciclo',
        chartLabel: 'Score Topo Hunter',
        indicators: [
            { id: 'mvrv', name: 'MVRV', weight: 20, source: 'manual', description: 'Market Value to Realized Value – mede sobrecompra on-chain.', help: 'Sem API pública gratuita confiável para o MVRV real. Consulte um agregador on-chain (ex: LookIntoBitcoin, CryptoQuant) e insira o valor manualmente.' },
            { id: 'mayer', name: 'Múltiplo de Mayer', weight: 10, source: 'live', description: 'Preço / média móvel de 200 dias.' },
            { id: 'coinbase', name: 'Ranking Coinbase', weight: 10, source: 'live', description: 'Posição do app Coinbase na App Store como proxy de interesse de varejo.' },
            { id: 'm2', name: 'Expansão M2 EUA', weight: 25, source: 'live', description: 'Crescimento mensal anualizado da base monetária americana.' },
            { id: 'rates', name: 'Taxa de Juros EUA', weight: 15, source: 'live', description: 'Federal Funds Rate – aperto ou afrouxamento monetário.' },
            { id: 'fear', name: 'Fear & Greed', weight: 10, source: 'live', description: 'Índice de sentimento de mercado cripto.' },
            { id: 'liq', name: 'Liquidez Mundial', weight: 10, source: 'manual', description: 'Índice composto de liquidez global.', help: 'Índice composto proprietário, sem fonte pública única — insira manualmente.' }
        ],
        defaults: { mvrv: 6.5, mayer: 4.2, coinbase: 7.2, m2: 7.8, rates: 5.2, fear: 8.6, liq: 7.5 },
        statusRanges: [
            { max: 6, label: 'Baixo Risco', cssClass: 'success' },
            { max: 8, label: 'Aproximação', cssClass: 'warning' },
            { max: Infinity, label: 'Alto Risco', cssClass: 'error' }
        ]
    },
    bottom: {
        label: 'Bottom Hunter',
        scoreTitle: 'Score de Fundo de Ciclo',
        chartLabel: 'Score Bottom Hunter',
        indicators: [
            { id: 'mvrv', name: 'MVRV', weight: 19, source: 'manual', description: 'Market Value to Realized Value – valores baixos (próximos ou abaixo de 1) indicam subvalorização e potencial fundo de mercado.', help: 'Sem API pública gratuita confiável para o MVRV real. Consulte um agregador on-chain (ex: LookIntoBitcoin, CryptoQuant) e insira o valor manualmente.' },
            { id: 'mayer', name: 'Múltiplo de Mayer', weight: 9.5, source: 'live', description: 'Preço / média móvel de 200 dias – valores abaixo de 1 historicamente marcam zonas de fundo.' },
            { id: 'coinbase', name: 'Ranking Coinbase', weight: 9.5, source: 'live', description: 'Queda no ranking do app Coinbase sinaliza apatia do varejo, típica de fundos de ciclo.' },
            { id: 'm2', name: 'Expansão M2 EUA', weight: 23.75, source: 'live', description: 'Contração ou desaceleração do M2 americano, associada a apertos de liquidez que precedem fundos de mercado.' },
            { id: 'rates', name: 'Taxa de Juros EUA', weight: 14.25, source: 'live', description: 'Federal Funds Rate – juros altos (aperto monetário) historicamente coincidem com fundos de ciclo.' },
            { id: 'fear', name: 'Fear & Greed', weight: 9.5, source: 'live', description: 'Medo extremo no mercado cripto historicamente marca fundos de mercado.' },
            { id: 'liq', name: 'Liquidez Mundial', weight: 9.5, source: 'manual', description: 'Contração da liquidez global associada a fundos de ciclo.', help: 'Índice composto proprietário, sem fonte pública única — insira manualmente.' },
            { id: 'ath', name: 'Drawdown do ATH', weight: 5, source: 'live', description: 'Queda percentual em relação à máxima histórica – quedas profundas historicamente marcam zonas de fundo.' }
        ],
        defaults: { mvrv: 3.0, mayer: 3.5, coinbase: 2.8, m2: 3.2, rates: 6.5, fear: 3.0, liq: 3.5, ath: 4.5 },
        statusRanges: [
            { max: 6, label: 'Sem Sinal de Fundo', cssClass: 'info' },
            { max: 8, label: 'Zona de Acumulação', cssClass: 'accumulation' },
            { max: Infinity, label: 'Oportunidade de Fundo', cssClass: 'success' }
        ]
    }
};

const STATUS_COLOR_HEX = {
    success: '#28A745',
    warning: '#FFA500',
    error: '#DC3545',
    info: '#6C757D',
    accumulation: '#1E3A8A'
};

function getStatusMeta(score, mode) {
    return HUNTER_MODES[mode].statusRanges.find(r => score <= r.max);
}

// -----------------------------------------------
// Historical data (mock data for demonstration)
// -----------------------------------------------
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
    {"data": "Set/25", "score": 6.95, "status": "Aproximação"},
    {"data": "Dez/25", "score": 8.95, "status": "Alto Risco"},
    {"data": "Mar/26", "score": 6.35, "status": "Aproximação"},
    {"data": "Jun/26", "score": 3.80, "status": "Baixo Risco"}
];

// Bottom Hunter historical mirror — heuristic (10 - Topo score), since top and
// bottom conditions are roughly inversely correlated across a market cycle.
// Same illustrative/mock nature as historicalData above, not real on-chain history.
const bottomHistoricalData = historicalData.map(d => {
    const score = Math.round((10 - d.score) * 100) / 100;
    return { data: d.data, score, status: getStatusMeta(score, 'bottom').label };
});

function getHistoricalData(mode) {
    return mode === 'topo' ? historicalData : bottomHistoricalData;
}

// -----------------------------------------------
// Shared hunter-mode state — one global toggle drives every section
// -----------------------------------------------
let currentHunterMode = 'topo';
const hunterModeListeners = [];

function onHunterModeChange(fn) {
    hunterModeListeners.push(fn);
}

function setHunterMode(mode) {
    if (mode === currentHunterMode) return;
    currentHunterMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        const isActive = btn.dataset.mode === mode;
        btn.classList.toggle('mode-btn--active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
    });
    hunterModeListeners.forEach(fn => fn(mode));
}

function initGlobalModeToggle() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => setHunterMode(btn.dataset.mode));
    });
}

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
// 2. Indicators grid ("Indicadores do Algoritmo")
// -----------------------------------------------
function renderIndicatorsSection(mode) {
    const grid = document.getElementById('indicators-grid');
    const title = document.getElementById('indicators-title');
    if (!grid) return;

    const config = HUNTER_MODES[mode];
    if (title) title.textContent = `Indicadores do Algoritmo — ${config.label}`;

    grid.innerHTML = config.indicators.map(ind => `
        <div class="indicator-card">
            <div class="indicator-card__header">
                <h3>${ind.name}</h3>
                <span class="indicator-weight">(${ind.weight}%)</span>
            </div>
            <p class="indicator-description">${ind.description}</p>
            <small class="indicator-boundaries">Intervalo: 0 → 10</small>
        </div>
    `).join('');
}

function initIndicatorsSection() {
    renderIndicatorsSection(currentHunterMode);
    onHunterModeChange(renderIndicatorsSection);
}

// -----------------------------------------------
// 3. Chart.js setup
// -----------------------------------------------
function formatRangeThreshold(range, index, ranges) {
    if (index === 0) return `≤ ${range.max.toFixed(1)}`;
    if (index === ranges.length - 1) return `≥ ${ranges[index - 1].max.toFixed(1)}`;
    return `${ranges[index - 1].max.toFixed(1)} - ${range.max.toFixed(1)}`;
}

function renderChartLegend(mode) {
    const legend = document.getElementById('chart-legend');
    if (!legend) return;
    const ranges = HUNTER_MODES[mode].statusRanges;

    legend.innerHTML = ranges.map((range, i) => `
        <div class="legend-item">
            <div class="legend-color" style="background:${STATUS_COLOR_HEX[range.cssClass]}"></div>
            <span>${range.label} (${formatRangeThreshold(range, i, ranges)})</span>
        </div>
    `).join('');
}

function buildChart(mode) {
    const ctx = document.getElementById('historical-chart');
    if (!ctx) return;

    const config = HUNTER_MODES[mode];
    const data = getHistoricalData(mode);
    const labels = data.map(d => d.data);
    const scores = data.map(d => d.score);
    const pointColors = data.map(d => STATUS_COLOR_HEX[getStatusMeta(d.score, mode).cssClass]);
    const ranges = config.statusRanges;
    const midColor = STATUS_COLOR_HEX[ranges[1].cssClass];
    const highColor = STATUS_COLOR_HEX[ranges[2].cssClass];

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: config.chartLabel,
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
                            return data[context[0].dataIndex].data;
                        },
                        label: function(context) {
                            const d = data[context.dataIndex];
                            return [
                                `Score: ${d.score.toFixed(2)}`,
                                `Status: ${d.status}`
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
                        color: (c) => {
                            if (c.tick.value === 6) return midColor;
                            if (c.tick.value === 8) return highColor;
                            return 'rgba(0,0,0,0.1)';
                        },
                        lineWidth: (c) => (c.tick.value === 6 || c.tick.value === 8 ? 2 : 1)
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

function initChartSection() {
    renderChartLegend(currentHunterMode);
    buildChart(currentHunterMode);
    onHunterModeChange(mode => {
        renderChartLegend(mode);
        buildChart(mode);
    });
}

// -----------------------------------------------
// 4. Table generation + sort/search/filter
// -----------------------------------------------
const TABLE_COLUMN_META = {
    mvrv: { label: 'MVRV', suffix: '' },
    mayer: { label: 'Múltiplo Mayer', suffix: '' },
    coinbase: { label: 'Ranking Coinbase', suffix: '' },
    m2: { label: 'Expansão M2 (%)', suffix: '%' },
    rates: { label: 'Taxa Juros (%)', suffix: '%' },
    fear: { label: 'Fear & Greed', suffix: '' },
    liq: { label: 'Liquidez Mundial', suffix: '' },
    ath: { label: 'Drawdown ATH (%)', suffix: '%' }
};

function generateMockRow(score, mode) {
    // Generate illustrative per-indicator readings from the period's score,
    // same demonstration purpose as historicalData/bottomHistoricalData above.
    const t = score / 10;

    if (mode === 'topo') {
        return {
            mvrv: (2.5 + t * 1.5).toFixed(2),
            mayer: (1.0 + t * 1.2).toFixed(2),
            coinbase: Math.round(400 - t * 350),
            m2: (t * 0.8).toFixed(2),
            rates: (5.5 - t * 5.0).toFixed(2),
            fear: Math.round(20 + t * 70),
            liq: Math.round(20 + t * 80)
        };
    }

    return {
        mvrv: (0.6 + (1 - t) * 1.8).toFixed(2),
        mayer: (0.5 + (1 - t) * 1.3).toFixed(2),
        coinbase: Math.round(60 + t * 300),
        m2: ((1 - t) * 6 - 1).toFixed(2),
        rates: (2.0 + t * 4.0).toFixed(2),
        fear: Math.round(75 - t * 60),
        liq: Math.round(80 - t * 60),
        ath: Math.round(5 + t * 70)
    };
}

function rowTintClass(cssClass, mode) {
    if (cssClass === 'warning') return 'approximation-row';
    if (cssClass === 'error') return 'high-risk-row';
    if (cssClass === 'accumulation') return 'row-tint--accumulation';
    if (cssClass === 'success' && mode === 'bottom') return 'row-tint--opportunity';
    return '';
}

function renderTableHeader(mode) {
    const headerRow = document.getElementById('table-header-row');
    if (!headerRow) return;
    const config = HUNTER_MODES[mode];
    const cols = ['Período', ...config.indicators.map(ind => TABLE_COLUMN_META[ind.id].label), 'Score Final', 'Status'];
    headerRow.innerHTML = cols.map(c => `<th>${c}</th>`).join('');
}

function renderStatusFilterOptions(mode) {
    const statusFilter = document.getElementById('status-filter');
    if (!statusFilter) return;
    const ranges = HUNTER_MODES[mode].statusRanges;
    statusFilter.innerHTML = '<option value="all">Todos os Status</option>' +
        ranges.map(r => `<option value="${r.label}">${r.label}</option>`).join('');
}

function renderTableRows(mode, data) {
    const tbody = document.getElementById('data-table-body');
    if (!tbody) return;
    const config = HUNTER_MODES[mode];

    tbody.innerHTML = '';
    data.forEach(d => {
        const meta = getStatusMeta(d.score, mode);
        const mockRow = generateMockRow(d.score, mode);

        const tr = document.createElement('tr');
        const tint = rowTintClass(meta.cssClass, mode);
        if (tint) tr.classList.add(tint);

        const cells = [`<td>${d.data}</td>`];
        config.indicators.forEach(ind => {
            const meta2 = TABLE_COLUMN_META[ind.id];
            cells.push(`<td>${mockRow[ind.id]}${meta2.suffix}</td>`);
        });
        cells.push(`<td class="font-weight-bold">${d.score.toFixed(2)}</td>`);
        cells.push(`<td><span class="status status--${meta.cssClass}">${meta.label}</span></td>`);

        tr.innerHTML = cells.join('');
        tbody.appendChild(tr);
    });
}

function initTableControls() {
    const periodFilter = document.getElementById('period-filter');
    const statusFilter = document.getElementById('status-filter');
    if (!periodFilter || !statusFilter) return;

    const applyFilters = () => {
        let data = [...getHistoricalData(currentHunterMode)];

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

        renderTableRows(currentHunterMode, data);
    };

    [periodFilter, statusFilter].forEach(el => el.addEventListener('change', applyFilters));

    function refreshForMode(mode) {
        renderTableHeader(mode);
        renderStatusFilterOptions(mode);
        statusFilter.value = 'all';
        applyFilters();
    }

    refreshForMode(currentHunterMode);
    onHunterModeChange(refreshForMode);
}

// -----------------------------------------------
// 5. Simulator (Topo Hunter / Bottom Hunter)
// -----------------------------------------------

// Historical bounds used to normalize raw fetched metrics onto the 0-10 scale
// the simulator works with. These are heuristic (industry rules of thumb),
// not guaranteed thresholds — the tool is educational, per the disclaimer.
const RAW_METRIC_BOUNDS = {
    mayer: { min: 0.5, max: 3.0 },   // Múltiplo de Mayer (preço / SMA200)
    coinbase: { min: 1, max: 100 },  // posição no ranking de apps grátis (Finanças)
    m2: { min: -2, max: 10 },        // expansão do M2 EUA, % anualizado
    rates: { min: 0, max: 6 },       // Fed Funds Rate, %
    fear: { min: 0, max: 100 },      // Fear & Greed Index
    ath: { min: 0, max: 85 }         // drawdown desde a máxima histórica, %
};

function normalizeRawMetric(id, raw, mode) {
    const bounds = RAW_METRIC_BOUNDS[id];
    if (!bounds || raw === null || raw === undefined || Number.isNaN(raw)) return null;
    let t = (raw - bounds.min) / (bounds.max - bounds.min);
    t = Math.max(0, Math.min(1, t));

    switch (id) {
        case 'mayer': // alto = sobreaquecido (topo); baixo = subvalorizado (fundo)
            return mode === 'topo' ? t * 10 : (1 - t) * 10;
        case 'coinbase': // rank numérico baixo = app popular (euforia de varejo)
            return mode === 'topo' ? (1 - t) * 10 : t * 10;
        case 'm2': // expansão forte = liquidez alimentando o topo
            return mode === 'topo' ? t * 10 : (1 - t) * 10;
        case 'rates': // juros baixos = dinheiro fácil (favorece topo); juros altos = aperto (favorece fundo)
            return mode === 'topo' ? (1 - t) * 10 : t * 10;
        case 'fear': // ganância extrema = topo; medo extremo = fundo
            return mode === 'topo' ? t * 10 : (1 - t) * 10;
        case 'ath': // só existe no Bottom Hunter: drawdown profundo = sinal de fundo
            return t * 10;
        default:
            return null;
    }
}

async function fetchLiveMetrics() {
    const raw = {};
    const failed = [];

    try {
        const r = await fetch('https://api.alternative.me/fng/?limit=1');
        if (!r.ok) throw new Error('fear&greed request failed');
        const data = await r.json();
        raw.fear = parseFloat(data.data[0].value);
    } catch (e) {
        failed.push('fear');
    }

    try {
        const [coinRes, chartRes] = await Promise.all([
            fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false'),
            fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=200&interval=daily')
        ]);
        if (!coinRes.ok || !chartRes.ok) throw new Error('coingecko request failed');
        const coinData = await coinRes.json();
        const chartData = await chartRes.json();
        raw.ath = Math.abs(coinData.market_data.ath_change_percentage.usd);
        const prices = chartData.prices.map(p => p[1]);
        const sma200 = prices.reduce((a, b) => a + b, 0) / prices.length;
        raw.mayer = coinData.market_data.current_price.usd / sma200;
    } catch (e) {
        failed.push('mayer', 'ath');
    }

    try {
        const r = await fetch('https://itunes.apple.com/us/rss/topfreeapplications/limit=200/genre=6015/json');
        if (!r.ok) throw new Error('apple rss request failed');
        const data = await r.json();
        const entries = (data.feed && data.feed.entry) || [];
        const idx = entries.findIndex(e => (e['im:name'] && e['im:name'].label || '').toLowerCase().includes('coinbase'));
        raw.coinbase = idx >= 0 ? idx + 1 : entries.length || 100;
    } catch (e) {
        failed.push('coinbase');
    }

    try {
        const [m2Res, ratesRes] = await Promise.all([
            fetch('/api/fred?series=m2'),
            fetch('/api/fred?series=rates')
        ]);
        if (!m2Res.ok || !ratesRes.ok) throw new Error('fred proxy request failed');
        const m2Data = await m2Res.json();
        const ratesData = await ratesRes.json();

        const m2Values = (m2Data.observations || []).filter(o => o.value !== '.').map(o => parseFloat(o.value));
        if (m2Values.length >= 2) {
            const monthlyGrowth = (m2Values[0] / m2Values[1]) - 1;
            raw.m2 = (Math.pow(1 + monthlyGrowth, 12) - 1) * 100;
        } else {
            failed.push('m2');
        }

        const latestRate = (ratesData.observations || []).find(o => o.value !== '.');
        if (latestRate) {
            raw.rates = parseFloat(latestRate.value);
        } else {
            failed.push('rates');
        }
    } catch (e) {
        failed.push('m2', 'rates');
    }

    return { raw, failed };
}

function initSimulator() {
    const inputsContainer = document.getElementById('simulator-inputs');
    const scoreTitle = document.getElementById('simulator-score-title');
    const scoreDisplay = document.getElementById('calculated-score');
    const statusDisplay = document.getElementById('score-status');
    const breakdownList = document.getElementById('score-breakdown-list');
    const calcButton = document.getElementById('update-simulator');
    const fetchButton = document.getElementById('fetch-live-data');
    const fetchStatusMsg = document.getElementById('fetch-status-msg');

    if (!inputsContainer) return;

    // Keeps whatever value the user has typed/fetched per indicator, per mode.
    const values = { topo: { ...HUNTER_MODES.topo.defaults }, bottom: { ...HUNTER_MODES.bottom.defaults } };

    function renderInputs() {
        const config = HUNTER_MODES[currentHunterMode];
        inputsContainer.innerHTML = '';

        config.indicators.forEach(ind => {
            const group = document.createElement('div');
            group.className = 'input-group';
            group.dataset.indicator = ind.id;

            const manualBadge = ind.source === 'manual'
                ? `<span class="manual-badge" title="${ind.help}">manual</span>`
                : '';

            group.innerHTML = `
                <label for="sim-${ind.id}" class="form-label">${ind.name}${manualBadge}</label>
                <input type="number" id="sim-${ind.id}" class="form-control" min="0" max="10" step="0.1" value="${values[currentHunterMode][ind.id]}">
                <span class="input-weight">Peso: ${ind.weight}%</span>
            `;
            inputsContainer.appendChild(group);

            const input = group.querySelector('input');
            input.addEventListener('input', () => {
                values[currentHunterMode][ind.id] = parseFloat(input.value) || 0;
                calculateScore();
            });
        });

        scoreTitle.textContent = config.scoreTitle;
    }

    function calculateScore() {
        const config = HUNTER_MODES[currentHunterMode];
        let totalScore = 0;

        config.indicators.forEach(ind => {
            const value = values[currentHunterMode][ind.id] || 0;
            totalScore += value * (ind.weight / 100);
        });

        scoreDisplay.textContent = totalScore.toFixed(2);

        const range = getStatusMeta(totalScore, currentHunterMode);
        statusDisplay.textContent = range.label;
        statusDisplay.className = `status status--${range.cssClass}`;

        breakdownList.innerHTML = '';
        config.indicators.forEach(ind => {
            const value = values[currentHunterMode][ind.id] || 0;
            const contribution = value * (ind.weight / 100);

            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item';
            breakdownItem.innerHTML = `
                <span class="breakdown-label">${ind.name} (${ind.weight}%)</span>
                <span class="breakdown-value">${contribution.toFixed(2)}</span>
            `;
            breakdownList.appendChild(breakdownItem);
        });
    }

    if (calcButton) {
        calcButton.addEventListener('click', calculateScore);
    }

    if (fetchButton) {
        fetchButton.addEventListener('click', async function() {
            fetchButton.disabled = true;
            fetchButton.classList.add('is-loading');
            fetchStatusMsg.textContent = 'Buscando dados ao vivo...';

            const { raw, failed } = await fetchLiveMetrics();
            const config = HUNTER_MODES[currentHunterMode];
            let updated = 0;

            config.indicators.forEach(ind => {
                if (ind.source !== 'live') return;
                const normalized = normalizeRawMetric(ind.id, raw[ind.id], currentHunterMode);
                const group = inputsContainer.querySelector(`[data-indicator="${ind.id}"]`);
                if (normalized !== null && !failed.includes(ind.id)) {
                    values[currentHunterMode][ind.id] = Math.round(normalized * 100) / 100;
                    if (group) {
                        group.querySelector('input').value = values[currentHunterMode][ind.id];
                        group.classList.remove('input-group--stale');
                    }
                    updated += 1;
                } else if (group) {
                    group.classList.add('input-group--stale');
                }
            });

            calculateScore();

            const liveCount = config.indicators.filter(i => i.source === 'live').length;
            fetchStatusMsg.textContent = updated === liveCount
                ? `Atualizado com dados ao vivo (${updated}/${liveCount} indicadores).`
                : `Atualizado parcialmente (${updated}/${liveCount} indicadores). Os demais mantiveram o valor manual — veja o destaque em dourado.`;

            fetchButton.disabled = false;
            fetchButton.classList.remove('is-loading');
        });
    }

    renderInputs();
    calculateScore();

    onHunterModeChange(() => {
        fetchStatusMsg.textContent = '';
        renderInputs();
        calculateScore();
    });
}

// -----------------------------------------------
// 6. Copy to clipboard functionality
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
// 7. Main initialization
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
    initGlobalModeToggle();
    initNavigation();
    initScrollHighlight();
    initSmoothScroll();
    initIndicatorsSection();
    initChartSection();
    initTableControls();
    initSimulator();
    initCopyFunctionality();

    console.log('Topo Hunter application initialized successfully');
});

// -----------------------------------------------
// 8. Utility functions and error handling
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
