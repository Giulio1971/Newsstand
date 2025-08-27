// Lista dei feed RSS che vuoi seguire
const feeds = [
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
  { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/home.xml" },
  { name: "CNN", url: "http://rss.cnn.com/rss/cnn_topstories.rss" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "BBC News", url: "http://feeds.bbci.co.uk/news/rss.xml" }
];

const container = document.getElementById("news");

// Create one <ul> for all news
const list = document.createElement("ul");
container.appendChild(list);

// 🎨 Mappa colori per ogni fonte
const sourceColors = {
  "The Guardian": "#cce5ff",   // azzurro chiaro
  "Sky News": "#ffcccc",       // rosso chiaro
  "CNN": "#e0ccff",            // viola chiaro
  "Al Jazeera": "#ffe5cc",     // arancio chiaro
  "BBC News": "#ccffcc"        // verde chiaro
};

// 🔤 Funzione per tradurre il testo in italiano (MyMemory API)
async function translateText(text) {
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|it`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    return data.responseData.translatedText || text;
  } catch (e) {
    console.error("Errore traduzione:", e);
    return text; // fallback: titolo originale
  }
}

function loadNews() {
  list.innerHTML = ""; // svuoto la lista

  Promise.all(
    feeds.map(feed => {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
      return fetch(apiUrl)
        .then(res => res.json())
        .then(data => data.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: new Date(item.pubDate),
          source: feed.name
        })))
        .catch(err => {
          console.error("Errore nel caricare", feed.name, err);
          return [];
        });
    })
  ).then(async results => {
    // Unisco tutte le notizie in un array unico
    let allItems = results.flat();

    // Ordino in ordine cronologico inverso
    allItems.sort((a, b) => b.pubDate - a.pubDate);

    // Limito a 50 notizie
    const finalList = allItems.slice(0, 50);

    // Render
    for (const item of finalList) {
      const days = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
      const dayName = days[item.pubDate.getDay()];

      const hours = item.pubDate.getHours().toString().padStart(2, "0");
      const minutes = item.pubDate.getMinutes().toString().padStart(2, "0");

      const formattedDate = `${dayName} alle ${hours}:${minutes}`;

      // Traduzione titolo
      const translatedTitle = await translateText(item.title);

      const li = document.createElement("li");
      li.style.backgroundColor = sourceColors[item.source] || "#ffffff";
      li.style.padding = "12px";
      li.style.borderRadius = "8px";
      li.style.marginBottom = "8px";

      li.innerHTML = `<strong style="display:block; font-size:14px; color:#333;">${item.source}</strong>
                      <a href="${item.link}" target="_blank">${translatedTitle}</a>
                      <span style="color:#555; font-size:14px; margin-left:8px;">${formattedDate}</span>`;
      list.appendChild(li);
    }
  });
}

// Initial load
loadNews();

// Refresh ogni 5 minuti
setInterval(loadNews, 300000);
