const sheetURL = "https://docs.google.com/spreadsheets/d/1Z0CGwjMagayrDL6Sk1VB68e-GsAZz8jW0a4_YZGZ_S4/export?format=csv";

let allItems = [];

// FETCH DATA
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.split("\n").map(r => r.split(","));

    allItems = rows.slice(1).map(r => ({
      category: r[1] || "",
      subcategory: r[2] || "",
      title: r[3] || "",
      description: r[4] || "",
      source: r[5] || "",
      link: r[6] || "",
      offline: r[7] || "",
      updated: r[8] || ""
    }));

    document.getElementById("loader").style.display = "none";
    showCategories();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("content").innerHTML =
      "<p style='color:red;'>Failed to load data</p>";
  });


// 🏠 CATEGORIES
function showCategories() {
  const categories = [...new Set(allItems.map(i => i.category))];

  let html = "";

  categories.forEach(cat => {
    html += `
      <div class="card" onclick="openCategory('${cat}')">
        <div>
          <div class="title">${cat}</div>
          <div class="meta">Tap to view guidelines</div>
        </div>
        <div class="arrow">→</div>
      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}


// 📂 CATEGORY
function openCategory(cat) {
  const filtered = allItems.filter(i => i.category === cat);
  display(filtered, cat);
}


// 📋 DISPLAY ITEMS
function display(items, categoryName = "") {
  let html = "";

  html += `
    <button onclick="showCategories()" style="
      margin:10px 0;
      padding:8px 12px;
      border:none;
      border-radius:8px;
      background:#f4c542;
      color:#5a3e00;
      font-weight:bold;
      cursor:pointer;
    ">← Back</button>
  `;

  html += `<h2 style="color:#5a3e00;">${categoryName}</h2>`;

  items.forEach(i => {
    html += `
      <div class="card" onclick="openPDF('${i.link}')">
        <div>
          <div class="title">${i.title}</div>
          <div class="meta">
            ${i.source || ""} ${i.updated ? " • " + i.updated : ""}
          </div>
        </div>
        <div class="arrow">→</div>
      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}


// 📄 OPEN PDF
function openPDF(url) {
  if (!url) {
    alert("No PDF linked.");
    return;
  }

  if (!navigator.onLine) {
    alert("You are offline.");
    return;
  }

  document.getElementById("loader").style.display = "flex";

  const viewer = `https://docs.google.com/gview?embedded=true&url=${url}`;

  setTimeout(() => {
    window.location.href = viewer;
    document.getElementById("loader").style.display = "none";
  }, 300);
}


// 🔍 SEARCH
document.addEventListener("input", e => {
  if (e.target.id === "search") {
    const q = e.target.value.toLowerCase();

    if (!q) return showCategories();

    const filtered = allItems.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.subcategory.toLowerCase().includes(q)
    );

    display(filtered, "Search Results");
  }
});
