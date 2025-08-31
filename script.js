// Elements
const promptEl = document.getElementById("prompt");
const imageUploadEl = document.getElementById("imageUpload");
const clearBtn = document.getElementById("clearBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const imagePreview = document.getElementById("imagePreview");
const results = document.getElementById("results");

let lastChart = null;

// ---------- helper: enable/disable analyze ----------
function updateAnalyzeState() {
  const hasText = promptEl.value.trim().length > 0;
  const hasImages = imageUploadEl.files && imageUploadEl.files.length > 0;
  analyzeBtn.disabled = !(hasText || hasImages);
}

// run on load in case
document.addEventListener("DOMContentLoaded", updateAnalyzeState);
["input", "keyup", "paste"].forEach(e => promptEl.addEventListener(e, () => {
  // auto-grow height but keep width fixed
  promptEl.style.height = "auto";
  promptEl.style.height = Math.min(promptEl.scrollHeight, 360) + "px";
  updateAnalyzeState();
}));

imageUploadEl.addEventListener("change", () => {
  // show thumbnails
  imagePreview.innerHTML = "";
  const files = Array.from(imageUploadEl.files || []);
  files.forEach(f => {
    const url = URL.createObjectURL(f);
    const img = document.createElement("img");
    img.src = url;
    imagePreview.appendChild(img);
  });
  updateAnalyzeState();
});

clearBtn.addEventListener("click", () => {
  imageUploadEl.value = "";
  imagePreview.innerHTML = "";
  updateAnalyzeState();
});

// ---------- helper: parse response text ----------
function extractTextFromPuterResponse(r) {
  if (!r) return "";
  if (typeof r === "string") return r;
  // new Puter responses often have r.message.content as array
  if (r.message && Array.isArray(r.message.content)) {
    for (const c of r.message.content) {
      if (typeof c === "string") return c;
      if (c?.type === "text" && (c?.text || c?.content)) return c.text || c.content;
      if (c?.text) return c.text;
    }
  }
  // fallback common shapes:
  if (r.text) return r.text;
  if (r.choices && r.choices[0]) {
    const msg = r.choices[0].message;
    if (msg && typeof msg === "string") return msg;
    if (msg?.content) return msg.content;
  }
  // last resort:
  try { return JSON.stringify(r); } catch { return String(r); }
}

// ---------- helper: clean number from text like "12 g" or "12g" or "12.5" ----------
function numberFrom(value) {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const s = String(value);
  const n = parseFloat(s.replace(/[^0-9.]/g, "")); // remove units
  return isNaN(n) ? 0 : n;
}

// ---------- Render functions ----------
function showNutrition(nutObj) {
  results.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h3");
  title.textContent = "🍽 Nutritional Information";
  card.appendChild(title);

  const calories = document.createElement("p");
  calories.innerHTML = `<b>Calories:</b> ${nutObj.Calories ?? nutObj.calories ?? "—"} kcal`;
  card.appendChild(calories);

  const ul = document.createElement("ul");
  ul.style.paddingLeft = "16px";
  ul.style.marginTop = "6px";
  const keys = ["Proteins","Fats","Carbohydrates","Fiber","Minerals","Protein","Fat","Carbs"];
  // print canonical items (prefer plural keys)
  const items = [
    ["Proteins", nutObj.Proteins ?? nutObj.proteins ?? nutObj.Protein ?? nutObj.protein],
    ["Fats", nutObj.Fats ?? nutObj.fats ?? nutObj.Fat ?? nutObj.fat],
    ["Carbohydrates", nutObj.Carbohydrates ?? nutObj.carbohydrates ?? nutObj.Carbs ?? nutObj.carbs],
    ["Fiber", nutObj.Fiber ?? nutObj.fiber],
  ];
  items.forEach(([label, val]) => {
    if (val !== undefined && val !== null) {
      const li = document.createElement("li");
      li.innerHTML = `<b>${label}:</b> ${val}${typeof val === "number" ? " g" : ""}`;
      ul.appendChild(li);
    }
  });

  // minerals (array or string)
  const minerals = nutObj.Minerals ?? nutObj.minerals ?? nutObj.mineral;
  if (minerals) {
    const li = document.createElement("li");
    li.innerHTML = `<b>Minerals:</b> ${Array.isArray(minerals) ? minerals.join(", ") : minerals}`;
    ul.appendChild(li);
  }

  card.appendChild(ul);

  // small chart for macros (proteins/fats/carbs)
  const canvas = document.createElement("canvas");
  canvas.className = "chart-small";
  canvas.id = "nutritionChart";
  card.appendChild(canvas);

  results.appendChild(card);

  // Build chart
  const proteins = numberFrom(nutObj.Proteins ?? nutObj.proteins ?? nutObj.Protein ?? nutObj.protein);
  const fats = numberFrom(nutObj.Fats ?? nutObj.fats ?? nutObj.Fat ?? nutObj.fat);
  const carbs = numberFrom(nutObj.Carbohydrates ?? nutObj.carbohydrates ?? nutObj.Carbs ?? nutObj.carbs);
  const data = [proteins, fats, carbs];

  if (lastChart) lastChart.destroy();
  lastChart = new Chart(canvas.getContext("2d"), {
    type: "pie",
    data: {
      labels: ["Proteins", "Fats", "Carbohydrates"],
      datasets: [{
        data,
        backgroundColor: ["#2e7d32", "#ff9800", "#1976d2"],
        borderColor: "#ffffff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function showSustainability(obj) {
  results.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h3");
  title.textContent = "♻ Sustainability Summary";
  card.appendChild(title);

  // meta grid
  const meta = document.createElement("div");
  meta.className = "meta-row";

  const mat = document.createElement("div");
  mat.className = "meta-item";
  mat.innerHTML = `<b>🛠 Material</b><div>${obj.material || obj.Material || "Unknown"}</div>`;
  meta.appendChild(mat);

  const rec = document.createElement("div");
  rec.className = "meta-item";
  rec.innerHTML = `<b>♻ Recyclability</b><div>${obj.recyclability || obj.Recyclability || "Unknown"}</div>`;
  meta.appendChild(rec);

  const alt = document.createElement("div");
  alt.className = "meta-item";
  alt.innerHTML = `<b>🌱 Alternatives</b><div>${Array.isArray(obj.alternatives) ? obj.alternatives.join(", ") : (obj.alternatives || obj.Alternatives || "—")}</div>`;
  meta.appendChild(alt);

  const tip = document.createElement("div");
  tip.className = "meta-item";
  tip.innerHTML = `<b>💡 Tip</b><div>${Array.isArray(obj.tips) ? obj.tips.join(" • ") : (obj.tips || obj.Tips || obj.tip || "Reuse before recycling")}</div>`;
  meta.appendChild(tip);

  card.appendChild(meta);

  // small friendly sentence (spice)
  const fun = document.createElement("p");
  fun.style.marginTop = "12px";
  fun.innerHTML = `<em>Quick take:</em> ${obj.summary || obj.message || "Consider reuse, repair, or switching to a reusable alternative."}`;
  card.appendChild(fun);

  results.appendChild(card);
}

// ---------- Core: call Puter.ai.chat with uploaded files (if any) ----------
analyzeBtn.addEventListener("click", async () => {
  // disable to prevent double clicks
  analyzeBtn.disabled = true;
  results.innerHTML = `<div class="card"><em>Analyzing…</em></div>`;

  try {
    // 1) If images present: upload to Puter FS first
    let uploaded = [];
    if (imageUploadEl.files && imageUploadEl.files.length > 0) {
      // puter.fs.upload accepts FileList or Array of File objects
      uploaded = await puter.fs.upload(imageUploadEl.files);
      // uploaded is an array of file objects (each has .path). We'll pass puter_path to the AI message.
    }

    // 2) Build system prompt that forces JSON response structure
    const systemPrompt = `
You are EcoReveal. When analyzing a product:

- IF THE ITEM IS EDIBLE: respond with ONLY a valid JSON object (no extra text) with EXACT keys:
  {
    "type": "edible",
    "Calories": <number in kcal>,
    "Proteins": <number in grams>,
    "Fats": <number in grams>,
    "Carbohydrates": <number in grams>,
    "Minerals": [ "Calcium", "Iron", ... ]  // optional
  }

- IF THE ITEM IS NON-EDIBLE: respond with ONLY a valid JSON object (no extra text) with EXACT keys:
  {
    "type": "non-edible",
    "material": "<short material name>",
    "recyclability": "<short recyclability note>",
    "alternatives": ["Glass", "Stainless steel"], // array
    "tips": ["Tip 1", "Tip 2"],
    "summary": "<one engaging 1-sentence summary>"
  }

- If you are unsure, return:
  { "type": "unknown", "message": "short explanation" }

Do NOT include any additional commentary, headings, or markdown — output must be pure JSON.
`;

    // 3) Build user message: if we uploaded files, include them as file content objects; also include text prompt if provided
    const userContent = [];
    for (const f of uploaded) {
      // Using puter_path lets the model access the file stored in Puter FS.
      userContent.push({ type: "file", puter_path: f.path });
    }
    const userText = promptEl.value.trim() || "Please analyze the uploaded product.";
    userContent.push({ type: "text", text: userText });

    // 4) Call Puter AI
    // We send messages array: system + user
    const response = await puter.ai.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ]);

    // 5) Extract the plain reply text
    const replyText = extractTextFromPuterResponse(response).trim();

    // 6) Try parse JSON strictly
    let parsed;
    try {
      parsed = JSON.parse(replyText);
    } catch (e) {
      // If parsing failed, show fallback and advise model didn't follow JSON contract
      results.innerHTML = `
        <div class="card">
          <b>AI returned an unexpected format.</b>
          <p style="margin-top:8px">Model reply (raw):</p>
          <pre>${escapeHtml(replyText).slice(0, 2000)}</pre>
          <p style="margin-top:8px;color:#666">Tip: if this keeps happening, re-run or slightly rephrase the prompt. The app expects JSON from the model.</p>
        </div>
      `;
      return;
    }

    // 7) Handle parsed data
    if (parsed.type === "edible") {
      showNutrition(parsed);
    } else if (parsed.type === "non-edible") {
      showSustainability(parsed);
    } else if (parsed.type === "unknown") {
      results.innerHTML = `<div class="card"><b>Not sure:</b> ${escapeHtml(parsed.message || "I couldn't determine the item type.")}</div>`;
    } else {
      // unknown shape — fallback
      results.innerHTML = `<div class="card"><b>Unexpected JSON shape:</b> <pre>${escapeHtml(JSON.stringify(parsed, null, 2))}</pre></div>`;
    }
  } catch (err) {
    console.error(err);
    results.innerHTML = `<div class="card"><b>❌ Error:</b> ${escapeHtml(err?.message || String(err))}</div>`;
  } finally {
    // re-enable based on current inputs
    updateAnalyzeState();
  }
});

// small helper to escape HTML for safety
function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}
