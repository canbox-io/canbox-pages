// APP 中心 - 从 catalog.json 动态加载
import categoryMap from '../data/categories.js';

// 配置
const CATALOG_BASE_URL = './data';
const CATALOG_INDEX_URL = `${CATALOG_BASE_URL}/catalog.json`;

// 状态
let currentLang = 'zh';
let currentCategory = 'all';
let currentSort = 'stars'; // stars | updated | name
let searchQuery = '';
let catalogApps = [];
let catalogMeta = null;
let isLoading = true;
let loadError = null;

// 获取分类名称
function getCategoryName(category) {
    const name = categoryMap[category] || categoryMap['all'];
    return currentLang === 'en' ? name.en : name.zh;
}

// 获取风险等级文本
function getRiskLevelText(riskLevel) {
    const map = {
        'none': { zh: '', en: '' },
        'low': { zh: '轻微风险', en: 'Low Risk' },
        'medium': { zh: '警告', en: 'Warning' },
        'high': { zh: '明显风险', en: 'High Risk' },
        'critical': { zh: '严重异常', en: 'Critical' }
    };
    const item = map[riskLevel] || map['none'];
    return currentLang === 'en' ? item.en : item.zh;
}

// 获取风险等级图标
function getRiskLevelIcon(riskLevel) {
    const map = {
        'none': '',
        'low': '⚠️',
        'medium': '⚠️',
        'high': '⚠️⚠️',
        'critical': '⛔'
    };
    return map[riskLevel] || '';
}

// 默认 APP 图标 SVG
const defaultAppLogo = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#grad)"/>
        <circle cx="32" cy="32" r="14" fill="#9ca3af"/>
        <circle cx="32" cy="32" r="7" fill="white"/>
        <path d="M32 16 L35 20 L32 18 L29 20 Z" fill="#9ca3af"/>
        <path d="M32 48 L29 44 L32 46 L35 44 Z" fill="#9ca3af"/>
        <path d="M16 32 L20 29 L18 32 L20 35 Z" fill="#9ca3af"/>
        <path d="M48 32 L44 35 L46 32 L44 29 Z" fill="#9ca3af"/>
        <path d="M20 20 L24 24 L22 25 L21 22 Z" fill="#9ca3af"/>
        <path d="M44 44 L40 40 L42 39 L43 42 Z" fill="#9ca3af"/>
        <path d="M20 44 L24 40 L22 39 L21 42 Z" fill="#9ca3af"/>
        <path d="M44 20 L40 24 L42 25 L43 22 Z" fill="#9ca3af"/>
    </svg>
`)}`;

// 加载 catalog 数据
async function loadCatalog() {
    isLoading = true;
    loadError = null;
    renderApps();

    try {
        // 1. 加载索引
        const indexResp = await fetch(CATALOG_INDEX_URL);
        if (!indexResp.ok) {
            throw new Error(`Failed to load catalog index: ${indexResp.status}`);
        }
        catalogMeta = await indexResp.json();

        if (!catalogMeta.shards || catalogMeta.shards.length === 0) {
            catalogApps = [];
            isLoading = false;
            renderApps();
            return;
        }

        // 2. 并行加载所有分片
        const shardPromises = catalogMeta.shards.map(shard => {
            const shardUrl = `${CATALOG_BASE_URL}/${shard.file}`;
            return fetch(shardUrl)
                .then(resp => {
                    if (!resp.ok) {
                        console.warn(`Failed to load shard ${shard.file}: ${resp.status}`);
                        return { apps: [] };
                    }
                    return resp.json();
                })
                .catch(err => {
                    console.warn(`Error loading shard ${shard.file}:`, err);
                    return { apps: [] };
                });
        });

        const shardResults = await Promise.all(shardPromises);
        catalogApps = shardResults.flatMap(shard => shard.apps || []);

        isLoading = false;
        renderApps();
        renderFilters();
    } catch (err) {
        console.error('Failed to load catalog:', err);
        loadError = err.message;
        isLoading = false;
        catalogApps = [];
        renderApps();
    }
}

// 过滤和排序 APP
function getFilteredApps() {
    let apps = [...catalogApps];

    // 分类过滤
    if (currentCategory !== 'all') {
        apps = apps.filter(app => app.category === currentCategory);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        apps = apps.filter(app => {
            const name = (app.name || '').toLowerCase();
            const desc = (app.description || '').toLowerCase();
            const descEn = (app.description_en || '').toLowerCase();
            const author = (app.author || '').toLowerCase();
            const tags = (app.tags || []).join(' ').toLowerCase();
            return name.includes(query) || desc.includes(query) || descEn.includes(query) || author.includes(query) || tags.includes(query);
        });
    }

    // 排序
    if (currentSort === 'stars') {
        apps.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    } else if (currentSort === 'updated') {
        apps.sort((a, b) => {
            const aTime = a.lastCommitAt ? new Date(a.lastCommitAt).getTime() : 0;
            const bTime = b.lastCommitAt ? new Date(b.lastCommitAt).getTime() : 0;
            return bTime - aTime;
        });
    } else if (currentSort === 'name') {
        apps.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return apps;
}

// 渲染 APP 卡片
function renderApps() {
    const appsGrid = document.getElementById('appsGrid');
    if (!appsGrid) return;

    if (isLoading) {
        appsGrid.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem; color: var(--text-secondary);">
                <div class="loading-spinner"></div>
                <p data-zh="加载中..." data-en="Loading...">${currentLang === 'en' ? 'Loading...' : '加载中...'}</p>
            </div>
        `;
        return;
    }

    if (loadError) {
        appsGrid.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <p data-zh="数据加载失败，请稍后刷新重试" data-en="Failed to load data, please refresh later">${currentLang === 'en' ? 'Failed to load data, please refresh later' : '数据加载失败，请稍后刷新重试'}</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem; color: var(--text-secondary);">${loadError}</p>
            </div>
        `;
        return;
    }

    const apps = getFilteredApps();

    if (apps.length === 0) {
        const emptyText = catalogApps.length === 0
            ? (currentLang === 'en' ? 'No apps available' : '暂无应用')
            : (currentLang === 'en' ? 'No matching apps' : '没有匹配的应用');
        appsGrid.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 4rem; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <p>${emptyText}</p>
            </div>
        `;
        return;
    }

    appsGrid.innerHTML = apps.map(app => {
        const description = currentLang === 'en' && app.description_en ? app.description_en : (app.description || '');
        const homeText = currentLang === 'en' ? 'Home' : '主页';
        const sourceText = currentLang === 'en' ? 'Source' : '源码';
        const installText = currentLang === 'en' ? 'Install' : '安装';

        // 风险标识
        let riskBadge = '';
        if (app.riskLevel && app.riskLevel !== 'none') {
            const icon = getRiskLevelIcon(app.riskLevel);
            const text = getRiskLevelText(app.riskLevel);
            const riskClass = `risk-${app.riskLevel}`;
            riskBadge = `<span class="risk-badge ${riskClass}">${icon} ${text}</span>`;
        }

        // 类型标签
        let typeBadge = '';
        if (app.type) {
            const typeLabels = {
                'native': currentLang === 'en' ? 'Native' : '原生',
                'web': 'Web',
                'pwa': 'PWA'
            };
            typeBadge = `<span class="type-badge">${typeLabels[app.type] || app.type}</span>`;
        }

        // 安装按钮
        let installBtn = '';
        if (app.showDownload) {
            installBtn = `<a href="canbox://install?repo=${encodeURIComponent(app.repo)}" class="app-link install-link" data-zh="安装" data-en="Install">${installText}</a>`;
        } else if (app.disabledReason) {
            installBtn = `<span class="app-link disabled-link" title="${app.disabledReason}">${currentLang === 'en' ? 'Unavailable' : '不可用'}</span>`;
        }

        return `
            <div class="app-card" data-category="${app.category || ''}" data-app-id="${app.id}">
                <button class="copy-repo-btn" data-repo="${app.repo}" title="${currentLang === 'en' ? 'Copy repo URL' : '复制仓库地址'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <div class="app-header">
                    <img src="${app.logo || defaultAppLogo}" alt="${app.name}" class="app-logo" onerror="this.src='${defaultAppLogo}'">
                    <div class="app-info">
                        <div class="app-name">${app.name || app.id}</div>
                        <div class="app-badges">
                            <span class="app-category" data-category="${app.category || ''}">${getCategoryName(app.category || 'all')}</span>
                            ${typeBadge}
                            ${riskBadge}
                        </div>
                    </div>
                </div>
                <div class="app-description">
                    <p data-description-zh="${app.description || ''}" data-description-en="${app.description_en || app.description || ''}">${description}</p>
                </div>
                <div class="app-meta">
                    ${app.stars !== undefined ? `<span class="app-meta-item">⭐ ${app.stars}</span>` : ''}
                    ${app.appVersion ? `<span class="app-meta-item">v${app.appVersion}</span>` : ''}
                    ${app.license ? `<span class="app-meta-item">${app.license}</span>` : ''}
                </div>
                <div class="app-footer">
                    <div class="app-author">
                        <span class="app-author-icon">👤</span>
                        <span>${app.author || ''}</span>
                    </div>
                    <div class="app-links">
                        ${installBtn}
                        <a href="${app.homepage || app.repo}" target="_blank" class="app-link primary" data-zh="主页" data-en="Home">${homeText}</a>
                        <a href="${app.repo}" target="_blank" class="app-link" data-zh="源码" data-en="Source">${sourceText}</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染分类过滤器
function renderFilters() {
    const existingFilter = document.querySelector('.apps-filter');
    if (existingFilter) existingFilter.remove();

    const appsHeader = document.querySelector('.apps-header');
    if (!appsHeader) return;

    const filterDiv = document.createElement('div');
    filterDiv.className = 'apps-filter';

    // 分类按钮
    Object.keys(categoryMap).forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (key === currentCategory ? ' active' : '');
        const name = categoryMap[key];
        btn.textContent = currentLang === 'en' ? name.en : name.zh;
        btn.onclick = () => {
            currentCategory = key;
            renderFilters();
            renderApps();
        };
        filterDiv.appendChild(btn);
    });

    // 搜索框
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = currentLang === 'en' ? 'Search apps...' : '搜索应用...';
    searchInput.value = searchQuery;
    searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        renderApps();
    };
    filterDiv.appendChild(searchInput);

    // 排序选择
    const sortSelect = document.createElement('select');
    sortSelect.className = 'sort-select';
    const sortOptions = [
        { value: 'stars', zh: '按 Stars', en: 'By Stars' },
        { value: 'updated', zh: '按更新时间', en: 'By Updated' },
        { value: 'name', zh: '按名称', en: 'By Name' }
    ];
    sortOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = currentLang === 'en' ? opt.en : opt.zh;
        if (opt.value === currentSort) option.selected = true;
        sortSelect.appendChild(option);
    });
    sortSelect.onchange = (e) => {
        currentSort = e.target.value;
        renderApps();
    };
    filterDiv.appendChild(sortSelect);

    appsHeader.appendChild(filterDiv);
}

// 切换分类显示（不重新渲染 DOM，只显示/隐藏）
function filterApps() {
    // 改为直接重新渲染
    renderApps();
}

// 更新语言显示
function updateAppLanguage() {
    // 更新分类标签
    document.querySelectorAll('.app-category').forEach(el => {
        const category = el.getAttribute('data-category');
        el.textContent = getCategoryName(category || 'all');
    });

    // 更新描述
    document.querySelectorAll('.app-description p').forEach(el => {
        const zhText = el.getAttribute('data-description-zh');
        const enText = el.getAttribute('data-description-en');
        el.textContent = currentLang === 'en' ? enText : zhText;
    });

    // 更新按钮文字
    const buttons = document.querySelectorAll('.app-link');
    buttons.forEach(btn => {
        const zhText = btn.getAttribute('data-zh');
        const enText = btn.getAttribute('data-en');
        if (currentLang === 'en' && enText) {
            btn.textContent = enText;
        } else if (currentLang === 'zh' && zhText) {
            btn.textContent = zhText;
        }
    });

    // 更新复制按钮的 title
    document.querySelectorAll('.copy-repo-btn').forEach(btn => {
        btn.title = currentLang === 'en' ? 'Copy repo URL' : '复制仓库地址';
    });
}

// 语言切换
function switchLanguage(lang) {
    currentLang = lang;

    // 更新所有可翻译元素
    const translatableElements = document.querySelectorAll('[data-zh]');
    translatableElements.forEach(el => {
        const zhText = el.getAttribute('data-zh');
        const enText = el.getAttribute('data-en');
        if (lang === 'en' && enText) {
            el.textContent = enText;
        } else if (lang === 'zh' && zhText) {
            el.textContent = zhText;
        }
    });

    // 更新页面标题
    const pageTitle = document.querySelector('title');
    if (pageTitle) {
        pageTitle.textContent = pageTitle.getAttribute('data-' + lang);
    }

    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

    // 更新语言切换按钮状态
    const langLinks = document.querySelectorAll('.lang-switch a');
    langLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + lang) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 重新渲染过滤器和 APP 列表
    renderFilters();
    renderApps();

    // 保存到 localStorage
    localStorage.setItem('lang', lang);
}

// 初始化语言
function initLanguage() {
    const savedLang = localStorage.getItem('lang') || 'zh';
    switchLanguage(savedLang);
}

// 绑定语言切换事件
document.querySelectorAll('.lang-switch a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.getAttribute('href').substring(1);
        switchLanguage(lang);
    });
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    renderFilters();
    loadCatalog();

    // 折叠面板切换
    const submitToggle = document.getElementById('submitToggle');
    const submitContent = document.getElementById('submitContent');
    if (submitToggle && submitContent) {
        submitToggle.addEventListener('click', () => {
            submitToggle.classList.toggle('active');
            submitContent.classList.toggle('open');
        });
    }

    // 复制仓库地址功能
    document.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('.copy-repo-btn');
        if (copyBtn) {
            const repo = copyBtn.getAttribute('data-repo');
            try {
                await navigator.clipboard.writeText(repo);
                const originalTitle = copyBtn.title;
                copyBtn.classList.add('copied');
                copyBtn.title = currentLang === 'en' ? 'Copied!' : '已复制！';
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.title = originalTitle;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    });
});
