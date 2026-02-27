let newsList = [];
const BASE_NEWS_URL = 'https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines';

const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const menuOverlay = document.getElementById('menu-overlay');

const openMenu = ()=>{
    sideMenu.classList.add('open');
    menuOverlay.classList.add('show');
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    sideMenu.setAttribute('aria-hidden', 'false');
};

const closeMenu = ()=>{
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    sideMenu.setAttribute('aria-hidden', 'true');
};

if(menuBtn && sideMenu && menuOverlay){
    menuBtn.addEventListener('click', ()=>{
        const isOpen = sideMenu.classList.contains('open');
        if(isOpen){
            closeMenu();
            return;
        }
        openMenu();
    });

    menuOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (event)=>{
        if(event.key === 'Escape'){
            closeMenu();
        }
    });
}

const getLatestNews = async(menuKeyword)=>{
    const url = new URL(BASE_NEWS_URL);

    if(menuKeyword){
        const category = menuKeyword.toLowerCase().trim();
        url.searchParams.set('category', category);
    }

    const response = await fetch(url);
    const data = await response.json();
    newsList = data.articles;
    console.log("data", newsList);
    console.log("첫번째 뉴스 이미지 URL:", newsList[0]?.urlToImage);
    render();
};

const getNewsByKeyword = async () => {
    const keyword = document.getElementById("search-input").value;
    console.log("keyword", keyword);
    const url = new URL(BASE_NEWS_URL);
    url.searchParams.set('q', keyword);
    
    const response = await fetch(url);
    const data = await response.json();
    console.log("keyword data", data);
    newsList = data.articles;
    render();
};

const setActiveMenu = (keyword)=>{
    const normalizedKeyword = keyword.toLowerCase().trim();
    const topMenuButtons = document.querySelectorAll('.menus button');
    const sideMenuLinks = document.querySelectorAll('.side-menu-nav a');

    topMenuButtons.forEach((button)=>{
        const isActive = button.textContent.toLowerCase().trim() === normalizedKeyword;
        button.classList.toggle('active', isActive);
    });

    sideMenuLinks.forEach((link)=>{
        const isActive = link.textContent.toLowerCase().trim() === normalizedKeyword;
        link.classList.toggle('active', isActive);
    });
};

const connectMenuEvents = ()=>{
    const topMenuButtons = document.querySelectorAll('.menus button');
    const sideMenuLinks = document.querySelectorAll('.side-menu-nav a');

    topMenuButtons.forEach((button)=>{
        button.addEventListener('click', ()=>{
            const keyword = button.textContent.trim();
            setActiveMenu(keyword);
            getLatestNews(keyword);
        });
    });

    sideMenuLinks.forEach((link)=>{
        link.addEventListener('click', (event)=>{
            event.preventDefault();
            const keyword = link.textContent.trim();
            setActiveMenu(keyword);
            getLatestNews(keyword);
            closeMenu();
        });
    });
};

const escapeHtml = (value = '')=>{
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
};


const render=()=>{
    const newsHTML = newsList.map((news)=>`<article class="news-card">
                <div class="news-card-img">
                    <img src="${news.urlToImage || 'https://placehold.co/400x300?text=No+Image'}"
                        onerror="this.src='https://placehold.co/400x300?text=Image+Not+Available'"
                        alt="${escapeHtml(news.title || 'News image')}">
                </div>
                <div class="news-card-content">
                    <h2>${escapeHtml(news.title || '')}</h2>
                    <p>${escapeHtml(news.description || news.content || '')}</p>
                    <div class="news-meta">${escapeHtml(news.source?.name || '')} ${escapeHtml(news.publishedAt || '')}</div>
                </div>
            </article>`
    ).join('');
    
    document.getElementById('news-board').innerHTML = newsHTML;
};


const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');

if(searchBtn){
    searchBtn.addEventListener('click', getNewsByKeyword);
}

if(searchInput){
    searchInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter'){
            getNewsByKeyword();
        }
    });
}

connectMenuEvents();
getLatestNews(); 