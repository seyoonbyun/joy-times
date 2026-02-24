const API_KEY = `939e4cb8554a4958a946476534952d50`;
const getLatestNews = async()=>{
    const url = new URL(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log("rrrr" , response);
    console.log("data", data);
};

getLatestNews(); 