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

const categoryMap = {
    sport: 'sports',
    sports: 'sports',
    tech: 'technology',
    technology: 'technology',
    business: 'business',
    entertainment: 'entertainment',
    science: 'science'
};

const normalizeKeyword = (keyword)=> keyword.toLowerCase().trim();

const getLatestNews = async(menuKeyword)=>{
    const url = new URL(BASE_NEWS_URL);

    if(menuKeyword){
        const normalizedKeyword = normalizeKeyword(menuKeyword);
        const mappedCategory = categoryMap[normalizedKeyword];

        if(mappedCategory){
            url.searchParams.set('category', mappedCategory);
        }else{
            url.searchParams.set('q', menuKeyword);
        }
    }

    const response = await fetch(url);
    const data = await response.json();
    newsList = data.articles;
    console.log("data", newsList);
    console.log("첫번째 뉴스 이미지 URL:", newsList[0]?.urlToImage);
    render();
};

const setActiveMenu = (keyword)=>{
    const normalizedKeyword = normalizeKeyword(keyword);
    const topMenuButtons = document.querySelectorAll('.menus button');
    const sideMenuLinks = document.querySelectorAll('.side-menu-nav a');

    topMenuButtons.forEach((button)=>{
        const isActive = normalizeKeyword(button.textContent) === normalizedKeyword;
        button.classList.toggle('active', isActive);
    });

    sideMenuLinks.forEach((link)=>{
        const isActive = normalizeKeyword(link.textContent) === normalizedKeyword;
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


const render=()=>{
    const newsHTML = newsList.map((news)=>`<div class="row news">
                <div class="col-lg-4">
                    <img class="news-img-size"
                        src="${news.urlToImage || 'https://via.placeholder.com/400x300?text=No+Image'}"
                        onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Available'"
                        alt="${news.title}">
                </div>
                <div class="col-lg-8">
                    <h2>${news.title}</h2>
                    <div class="news-list">
                        <div class="news-item">
                            <p>${news.description || news.content || ''}</p>
                            <div>
                                ${news.source.name} ${news.publishedAt}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
    ).join('');
    
    document.getElementById('news-board').innerHTML = newsHTML;
};


connectMenuEvents();
getLatestNews(); 