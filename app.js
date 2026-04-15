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

    showCategories();
  })
  .catch(err => {
    console.error(err);
    document.getElementById("content").innerHTML =
      "<p style='color:red;'>Failed to load data</p>";
  });


// 🏠 SHOW CATEGORIES
function showCategories() {
  let categories = [...new Set(allItems.map(i => i.category))];

  // Move Emergency to top
  categories = categories.sort((a, b) => {
    if (a.toLowerCase() === "emergency") return -1;
    if (b.toLowerCase() === "emergency") return 1;
    return a.localeCompare(b);
  });

  let html = "";

  categories.forEach(cat => {
    const isEmergency = cat.toLowerCase() === "emergency";

    html += `
      <div class="card" 
           onclick="openSubcategories('${cat}')"
           style="${isEmergency ? 'background:#ffdddd;border:1px solid #ff4d4d;' : ''}">
        <div>
          <div class="title" style="${isEmergency ? 'color:#b30000;' : ''}">
            ${cat}
          </div>
          <div class="meta">Tap to view sections</div>
        </div>
        <div class="arrow" style="${isEmergency ? 'color:#b30000;' : ''}">→</div>
      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}


// 📂 OPEN SUBCATEGORIES
function openSubcategories(category) {
  const filtered = allItems.filter(i => i.category === category);

  // Clean + normalize subcategories
  let subcategories = filtered
    .map(i => (i.subcategory || "").trim())
    .filter(s => s !== "" && s.toLowerCase() !== "null" && s.toLowerCase() !== "undefined");

  // Unique values
  subcategories = [...new Set(subcategories)];

  console.log("Subcategories:", subcategories); // DEBUG

  // ✅ If NONE → go straight to guidelines
  if (subcategories.length === 0) {
    openGuidelines(category, "");
    return;
  }

  // Otherwise show subcategory screen
  let html = `
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

  html += `<h2 style="color:#5a3e00;">${category}</h2>`;

  subcategories.forEach(sub => {
    html += `
      <div class="card" onclick="openGuidelines('${category}', '${sub}')">
        <div>
          <div class="title">${sub}</div>
          <div class="meta">Tap to view guidelines</div>
        </div>
        <div class="arrow">→</div>
      </div>
    `;
  });

  document.getElementById("content").innerHTML = html;
}
// 📋 OPEN GUIDELINES
function openGuidelines(category, subcategory) {
  const filtered = allItems.filter(i => {
    if (!subcategory) {
      return i.category === category;
    }
    return i.category === category && i.subcategory === subcategory;
  });

  let html = `
    <button onclick="openSubcategories('${category}')" style="
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

  html += `<h2 style="color:#5a3e00;">${subcategory || category}</h2>`;

  filtered.forEach(i => {
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

    // ✅ If it's a Google Form → open directly
  if (url.includes("docs.google.com/forms")) {
    window.open(url, "_blank");
    return;

  const viewer = `https://docs.google.com/gview?embedded=true&url=${url}`;
  window.open(viewer, "_blank");
}


// 🔍 SEARCH (still works globally)
document.addEventListener("input", e => {
  if (e.target.id === "search") {
    const q = e.target.value.toLowerCase();

    if (!q) return showCategories();

    const filtered = allItems.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.subcategory.toLowerCase().includes(q)
    );

    let html = `<h2 style="color:#5a3e00;">Search Results</h2>`;

    filtered.forEach(i => {
      html += `
        <div class="card" onclick="openPDF('${i.link}')">
          <div>
            <div class="title">${i.title}</div>
            <div class="meta">${i.category} • ${i.subcategory}</div>
          </div>
          <div class="arrow">→</div>
        </div>
      `;
    });

    document.getElementById("content").innerHTML = html;
  }
});
