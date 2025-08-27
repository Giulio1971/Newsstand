// Lista dei feed RSS che vuoi seguire
const feeds = [
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
  { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/home.xml" },
  { name: "France24", url: "https://www.france24.com/en/europe/rss" },
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
  "France24": "#e0ccff",       // viola chiaro
  "Al Jazeera": "#ffe5cc",     // arancio chiaro
  "BBC News": "#ccffcc"        // verde chiaro
};

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
  ).then(results => {
    // Unisco tutte le notizie in un array unico
    let allItems = results.flat();

    // Ordino in ordine cronologico inverso
    allItems.sort((a, b) => b.pubDate - a.pubDate);

    // Limito a 100 notizie
    const finalList = allItems.slice(0, 100);

    let lastDay = null;

    // Render
    for (const item of finalList) {
      const days = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
      const dayName = days[item.pubDate.getDay()];

      const hours = item.pubDate.getHours().toString().padStart(2, "0");
      const minutes = item.pubDate.getMinutes().toString().padStart(2, "0");

      const formattedDate = `${dayName} alle ${hours}:${minutes}`;

      // 🔹 Se il giorno è diverso dal precedente, inserisco una riga nera separatrice
      if (lastDay && lastDay !== dayName) {
        const separator = document.createElement("hr");
        separator.style.border = "0";
        separator.style.height = "2px";
        separator.style.backgroundColor = "black";
        separator.style.margin = "16px 0";
        list.appendChild(separator);
      }
      lastDay = dayName;

      const li = document.createElement("li");
      li.style.backgroundColor = sourceColors[item.source] || "#ffffff";
      li.style.padding = "12px";
      li.style.borderRadius = "8px";
      li.style.marginBottom = "8px";

      li.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>
                      <span style="color:#555; font-size:14px; margin-left:8px;">${formattedDate}</span>`;
      list.appendChild(li);
    }
  });
}

// Initial load
loadNews();

// Refresh ogni 5 minuti
setInterval(loadNews, 300000);
