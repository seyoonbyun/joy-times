let newsList = [];
const getLatestNews = async()=>{
    const url = new URL(`https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines`);
    const response = await fetch(url);
    const data = await response.json();
    newsList = data.articles;
    console.log("data", newsList);
    console.log("첫번째 뉴스 이미지 URL:", newsList[0]?.urlToImage);
    render();
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


getLatestNews(); 