// Elements
const promptInput = document.getElementById("prompt");
const analyzeBtn = document.getElementById("analyzeBtn");
const imageUpload = document.getElementById("imageUpload");
const clearBtn = document.getElementById("clearBtn");
const imagePreview = document.getElementById("imagePreview");
const output = document.getElementById("output");
const nutritionInfo = document.getElementById("nutritionInfo");
const nutritionList = document.getElementById("nutritionList");
const nutritionChartCanvas = document.getElementById("nutritionChart");

let chartInstance = null;

// ---- Enable/Disable Analyze Button ----
function updateAnalyzeButtonState() {
  const hasText = promptInput.value.trim().length > 0;
  const hasImages = imageUpload.files && imageUpload.files.length > 0;
  analyzeBtn.disabled = !(hasText || hasImages);
}

// Initialize state on load
document.addEventListener("DOMContentLoaded", updateAnalyzeButtonState);

// Re-check on every possible user action
["input", "change", "keyup", "paste"].forEach(evt =>
  promptInput.addEventListener(evt, updateAnalyzeButtonState)
);
imageUpload.addEventListener("change", updateAnalyzeButtonState);

// Auto-grow textarea height while keeping width fixed
promptInput.addEventListener("input", () => {
  promptInput.style.height = "auto";
  promptInput.style.height = promptInput.scrollHeight + "px";
});

// ---- Image Preview (multiple) ----
imageUpload.addEventListener("change", () => {
  imagePreview.innerHTML = "";
  Array.from(imageUpload.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// ---- Clear images ----
clearBtn.addEventListener("click", () => {
  imageUpload.value = "";
  imagePreview.innerHTML = "";
  updateAnalyzeButtonState();
});

// ---- Simulated AI logic (replace later with Puter.ai) ----
async function analyzeProduct({ prompt }) {
  // 4) Detect invalid prompt (not an item):
  // Very simple heuristic: require at least one word character and not only stopwords like 'hi', 'hello'
  const badExamples = ["hi", "hello", "hey", "what", "why", "how", "ok", "okay"];
  const clean = (prompt || "").toLowerCase().trim();
  const isWordy = /\w/.test(clean);
  const isLikelyItem = isWordy && !badExamples.includes(clean);

  if (!isLikelyItem) {
    return { type: "invalid" };
  }

  // Demo classification:
  // Any mention of typical foods → edible; otherwise non-edible example.
  const foods = ["apple", "bread", "cheese", "tuna", "rice", "milk", "egg", "banana", "orange"];
  const edible = foods.some(f => clean.includes(f));

  if (edible) {
    // 3) Edible → show nutrition list; we’ll chart only macros (distinct colors).
    return {
      type: "edible",
      nutrition: {
        Calories: 95,
        Proteins: 0.5,       // grams
        Fats: 0.3,           // grams
        Carbohydrates: 25,   // grams
        Fiber: 4.0           // grams
      }
    };
  }

  // 3) Non-edible → short, sufficient sustainability response
  return {
    type: "non-edible",
    message:
      "Likely non-edible. Consider material composition, carbon footprint, manufacturing practices, and recyclability. " +
      "If this item isn’t eco-friendly, try reusable, repairable, or recycled alternatives."
  };
}

// ---- Analyze click ----
analyzeBtn.addEventListener("click", async () => {
  // 5) Temporarily disable during processing
  analyzeBtn.disabled = true;

  // Reset outputs
  output.textContent = "Analyzing...";
  nutritionInfo.style.display = "none";
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  try {
    const prompt = promptInput.value.trim();
    const result = await analyzeProduct({ prompt });

    output.textContent = ""; // clear the "Analyzing..." line

    if (result.type === "invalid") {
      output.textContent = "⚠️ Please enter a valid product (food or item) description that suits the app’s purpose.";
      nutritionInfo.style.display = "none";
    } else if (result.type === "edible") {
      // Show nutrition block
      nutritionList.innerHTML = "";
      Object.entries(result.nutrition).forEach(([k, v]) => {
        const li = document.createElement("li");
        li.textContent = `${k}: ${v}${typeof v === "number" && k !== "Calories" ? "g" : ""}`;
        nutritionList.appendChild(li);
      });
      nutritionInfo.style.display = "block";

      // 2) Pie chart colors — distinct, clear
      const macros = {
        Proteins: result.nutrition.Proteins || 0,
        Fats: result.nutrition.Fats || 0,
        Carbohydrates: result.nutrition.Carbohydrates || 0
      };

      chartInstance = new Chart(nutritionChartCanvas, {
        type: "pie",
        data: {
          labels: Object.keys(macros),
          datasets: [{
            data: Object.values(macros),
            backgroundColor: ["#2e7d32", "#ff9800", "#1e88e5"], // green / orange / blue
            borderWidth: 2,
            borderColor: "#fff"
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.raw}g`
              }
            }
          }
        }
      });
    } else {
      // Non-edible
      output.textContent = result.message;
      nutritionInfo.style.display = "none";
    }
  } catch (e) {
    output.textContent = "❌ Error while analyzing.";
    console.error(e);
  } finally {
    // Re-enable based on current inputs (so it won't remain grey)
    updateAnalyzeButtonState();
  }
});

// Final safeguard: ensure correct initial state in case scripts loaded before DOM complete
updateAnalyzeButtonState();
