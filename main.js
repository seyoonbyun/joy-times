const CATEGORIES = ['Business', 'Entertainment', 'General', 'Health', 'Science', 'Sports', 'Technology'];
const BASE_NEWS_URL = 'https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines';
const FALLBACK_IMG = 'https://placehold.co/400x300?text=No+Image';
const ERROR_IMG = 'https://placehold.co/400x300?text=Image+Not+Available';

let newsList = [];
let totalPages = 50;
let totalResults = 0;
let page = 1;
const groupSize = 10;
const pageGroup = 5;
let isScrapView = false;

// ── 스크랩 (localStorage) ──
const getScrapList = () => JSON.parse(localStorage.getItem('scrapList') || '[]');
const saveScrapList = (list) => localStorage.setItem('scrapList', JSON.stringify(list));

const isScraped = (url) => getScrapList().some((a) => a.url === url);

const toggleScrap = (newsItem) => {
    let list = getScrapList();
    const idx = list.findIndex((a) => a.url === newsItem.url);
    if (idx > -1) {
        list.splice(idx, 1);
    } else {
        list.push(newsItem);
    }
    saveScrapList(list);
    updateScrapCount();
    if (isScrapView) {
        renderScrap();
    } else {
        render();
    }
};

const updateScrapCount = () => {
    const countEl = $('.scrap-count');
    if (countEl) countEl.textContent = getScrapList().length;
};

const HEART_EMPTY = '<svg class="heart-icon" viewBox="0 0 24 24" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#e74c3c" stroke-width="2"/></svg>';
const HEART_FILLED = '<svg class="heart-icon" viewBox="0 0 24 24" width="24" height="24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e74c3c" stroke="#e74c3c" stroke-width="2"/></svg>';

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
    params.page = page;
    params.pageSize = groupSize;
    Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
    });

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `요청에 실패했습니다 (${response.status})`);
        }

        newsList = data.articles;
        // 중복 기사 제거 (url 기준)
        const seen = new Set();
        newsList = newsList.filter((article) => {
            if (!article.url || seen.has(article.url)) return false;
            seen.add(article.url);
            return true;
        });
        totalResults = data.totalResults || 0;
        totalPages = Math.ceil(totalResults / groupSize);
        if (totalPages < 1) totalPages = 1;

        if (!newsList || newsList.length === 0) {
            throw new Error('검색된 결과가 없습니다. 다른 키워드로 검색해 보세요.');
        }

        render();
        paginationRender();
    } catch (err) {
        renderError(err.message);
    }
};

let currentParams = {};

const getLatestNews = (category) => {
    page = 1;
    currentParams = category ? { category: category.toLowerCase().trim() } : {};
    fetchNews({ ...currentParams });
};

const getNewsByKeyword = () => {
    const keyword = searchInput?.value?.trim();
    if (!keyword) {
        renderError('검색어를 입력해 주세요.');
        return;
    }
    page = 1;
    currentParams = { q: keyword };
    fetchNews({ ...currentParams });
};

// ── HTML 이스케이프 ──
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, (ch) => ESC_MAP[ch]);

// ── 에러 렌더링 ──
const renderError = (message) => {
    document.getElementById('news-board').innerHTML =
        `<p class="error-message">${escapeHtml(message)}</p>`;
};

// ── 렌더링 ──
const renderCard = (news, index) => {
    const scraped = isScraped(news.url);
    return `
        <article class="news-card">
            <div class="news-card-img" onclick="openArticle(${index})">
                <img src="${news.urlToImage || FALLBACK_IMG}"
                     onerror="this.src='${ERROR_IMG}'"
                     alt="${escapeHtml(news.title || 'News image')}">
            </div>
            <div class="news-card-content" onclick="openArticle(${index})">
                <h2>${escapeHtml(news.title || '')}</h2>
                <p>${escapeHtml(news.description || news.content || '')}</p>
                <div class="news-meta">${escapeHtml(news.source?.name || '')} ${escapeHtml(news.publishedAt || '')}</div>
            </div>
            <button class="scrap-btn${scraped ? ' scraped' : ''}" onclick="event.stopPropagation(); handleScrap(${index})" aria-label="스크랩" title="${scraped ? '스크랩 해제' : '스크랩'}">
                <span class="heart-text">${scraped ? '&#10084;' : '&#9825;'}</span>
                <span class="heart-svg">${scraped ? HEART_FILLED : HEART_EMPTY}</span>
            </button>
        </article>`;
};

const render = () => {
    isScrapView = false;
    document.getElementById('news-board').innerHTML = newsList
        .map((news, i) => renderCard(news, i))
        .join('');
};

// ── 기사 원문 열기 ──
const openArticle = (index) => {
    const list = isScrapView ? getScrapList() : newsList;
    const news = list[index];
    if (news?.url) window.open(news.url, '_blank');
};

// ── 스크랩 토글 핸들러 ──
const handleScrap = (index) => {
    const list = isScrapView ? getScrapList() : newsList;
    const news = list[index];
    if (news) toggleScrap(news);
};

// ── 스크랩 모아보기 ──
const renderScrap = () => {
    isScrapView = true;
    const scrapList = getScrapList();
    const board = document.getElementById('news-board');
    const paginationUl = $('.pagination');

    if (scrapList.length === 0) {
        board.innerHTML = '<p class="no-results">스크랩한 기사가 없습니다.</p>';
        if (paginationUl) paginationUl.innerHTML = '';
        return;
    }

    board.innerHTML = scrapList
        .map((news, i) => {
            const scraped = isScraped(news.url);
            return `
                <article class="news-card">
                    <div class="news-card-img" onclick="openArticle(${i})">
                        <img src="${news.urlToImage || FALLBACK_IMG}"
                             onerror="this.src='${ERROR_IMG}'"
                             alt="${escapeHtml(news.title || 'News image')}">
                    </div>
                    <div class="news-card-content" onclick="openArticle(${i})">
                        <h2>${escapeHtml(news.title || '')}</h2>
                        <p>${escapeHtml(news.description || news.content || '')}</p>
                        <div class="news-meta">${escapeHtml(news.source?.name || '')} ${escapeHtml(news.publishedAt || '')}</div>
                    </div>
                    <button class="scrap-btn${scraped ? ' scraped' : ''}" onclick="event.stopPropagation(); handleScrap(${i})" aria-label="스크랩 해제" title="스크랩 해제">
                        <span class="heart-text">${scraped ? '&#10084;' : '&#9825;'}</span>
                        <span class="heart-svg">${scraped ? HEART_FILLED : HEART_EMPTY}</span>
                    </button>
                </article>`;
        }).join('');

    if (paginationUl) paginationUl.innerHTML = '';
    setActiveMenu('my scrap');
};

// ── 페이지네이션 렌더링 ──
const paginationRender = () => {
    const paginationUl = $('.pagination');
    if (!paginationUl) return;

    // 현재 페이지 그룹의 첫 페이지와 마지막 페이지 계산
    const firstPage = Math.floor((page - 1) / pageGroup) * pageGroup + 1;
    let lastPage = firstPage + pageGroup - 1;
    if (lastPage > totalPages) lastPage = totalPages;

    let html = '';

    // First 버튼 (1페이지면 숨김)
    if (page > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="moveToPage(1); return false;" aria-label="First">
                <span aria-hidden="true">&laquo;&laquo;</span>
            </a>
        </li>`;
    }

    // Previous 버튼 (1페이지면 숨김)
    if (page > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="moveToPage(${page - 1}); return false;" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span> <span class="prev-text">Previous</span>
            </a>
        </li>`;
    }

    // 페이지 번호
    for (let i = firstPage; i <= lastPage; i++) {
        html += `<li class="page-item${i === page ? ' active' : ''}">
            <a class="page-link" href="#" onclick="moveToPage(${i}); return false;">${i}</a>
        </li>`;
    }

    // Next 버튼 (마지막 페이지면 숨김)
    if (page < totalPages) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="moveToPage(${page + 1}); return false;" aria-label="Next">
                <span class="next-text">Next</span> <span aria-hidden="true">&raquo;</span>
            </a>
        </li>`;
    }

    // Last 버튼 (마지막 페이지면 숨김)
    if (page < totalPages) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="moveToPage(${totalPages}); return false;" aria-label="Last">
                <span aria-hidden="true">&raquo;&raquo;</span>
            </a>
        </li>`;
    }

    paginationUl.innerHTML = html;
};

// ── 페이지 이동 ──
const moveToPage = (pageNum) => {
    page = pageNum;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchNews({ ...currentParams });
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
        .map((c) => `<a href="#">${c}</a>`).join('') +
        `<hr class="side-menu-divider"><a href="#" class="scrap-menu-link">&#10084; My Scrap (<span class="scrap-count">${getScrapList().length}</span>)</a>`;

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
            if (link.classList.contains('scrap-menu-link')) {
                toggleMenu(false);
                renderScrap();
            } else {
                handleCategory(link.textContent.trim(), true);
            }
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