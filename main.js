const CATEGORIES = ['Business', 'Entertainment', 'General', 'Health', 'Science', 'Sports', 'Technology'];
const BASE_NEWS_URL = 'https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines';
const FALLBACK_IMG = 'https://placehold.co/400x300?text=No+Image';
const ERROR_IMG = 'https://placehold.co/400x300?text=Image+Not+Available';

let newsList = [];

// ── DOM 참조 ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const menuBtn = $('#menu-btn');
const sideMenu = $('#side-menu');
const menuOverlay = $('#menu-overlay');
const searchInput = $('#search-input');
const searchBtn = $('#search-btn');

// ── 사이드 메뉴 토글 ──
const toggleMenu = (open) => {
    const method = open ? 'add' : 'remove';
    sideMenu.classList[method]('open');
    menuOverlay.classList[method]('show');
    menuBtn.classList[method]('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    sideMenu.setAttribute('aria-hidden', String(!open));
};

if (menuBtn && sideMenu && menuOverlay) {
    menuBtn.addEventListener('click', () =>
        toggleMenu(!sideMenu.classList.contains('open'))
    );
    menuOverlay.addEventListener('click', () => toggleMenu(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleMenu(false);
    });
}

// ── 뉴스 Fetch (공통) ──
const fetchNews = async (params = {}) => {
    const url = new URL(BASE_NEWS_URL);
    Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
    });

    const response = await fetch(url);
    const data = await response.json();
    newsList = data.articles;
    render();
};

const getLatestNews = (category) =>
    fetchNews(category ? { category: category.toLowerCase().trim() } : {});

const getNewsByKeyword = () =>
    fetchNews({ q: searchInput?.value || '' });

// ── HTML 이스케이프 ──
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, (ch) => ESC_MAP[ch]);

// ── 렌더링 ──
const render = () => {
    document.getElementById('news-board').innerHTML = newsList
        .map((news) => `
            <article class="news-card">
                <div class="news-card-img">
                    <img src="${news.urlToImage || FALLBACK_IMG}"
                         onerror="this.src='${ERROR_IMG}'"
                         alt="${escapeHtml(news.title || 'News image')}">
                </div>
                <div class="news-card-content">
                    <h2>${escapeHtml(news.title || '')}</h2>
                    <p>${escapeHtml(news.description || news.content || '')}</p>
                    <div class="news-meta">${escapeHtml(news.source?.name || '')} ${escapeHtml(news.publishedAt || '')}</div>
                </div>
            </article>`)
        .join('');
};

// ── 메뉴 Active 상태 ──
const setActiveMenu = (keyword) => {
    const norm = keyword.toLowerCase().trim();
    $$('.menus button, .side-menu-nav a').forEach((el) => {
        el.classList.toggle('active', el.textContent.toLowerCase().trim() === norm);
    });
};

// ── 메뉴 동적 생성 & 이벤트 바인딩 ──
const buildMenus = () => {
    const topMenu = $('.menus');
    const sideNav = $('.side-menu-nav');

    if (topMenu) topMenu.innerHTML = CATEGORIES
        .map((c) => `<button>${c}</button>`).join('');

    if (sideNav) sideNav.innerHTML = CATEGORIES
        .map((c) => `<a href="#">${c}</a>`).join('');

    const handleCategory = (keyword, closeSide = false) => {
        setActiveMenu(keyword);
        getLatestNews(keyword);
        if (closeSide) toggleMenu(false);
    };

    $$('.menus button').forEach((btn) =>
        btn.addEventListener('click', () => handleCategory(btn.textContent.trim()))
    );

    $$('.side-menu-nav a').forEach((link) =>
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handleCategory(link.textContent.trim(), true);
        })
    );
};

// ── 검색 이벤트 ──
searchBtn?.addEventListener('click', getNewsByKeyword);
searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getNewsByKeyword();
});

// ── 초기화 ──
buildMenus();
getLatestNews();