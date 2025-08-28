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

// Auto-grow textarea height
promptInput.addEventListener("input", () => {
  promptInput.style.height = "auto";
  promptInput.style.height = promptInput.scrollHeight + "px";
  toggleAnalyzeButton();
});

// Enable/disable Analyze button
function toggleAnalyzeButton() {
  if (promptInput.value.trim() || imageUpload.files.length > 0) {
    analyzeBtn.disabled = false;
  } else {
    analyzeBtn.disabled = true;
  }
}

// Preview uploaded images
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
  toggleAnalyzeButton();
});

// Clear images
clearBtn.addEventListener("click", () => {
  imageUpload.value = "";
  imagePreview.innerHTML = "";
  toggleAnalyzeButton();
});

// Simulated AI response
async function analyzeProduct(prompt) {
  // Fake detection logic
  if (!prompt.toLowerCase().includes("apple") && !prompt.toLowerCase().includes("bottle")) {
    return { type: "invalid" };
  }

  if (prompt.toLowerCase().includes("apple")) {
    return {
      type: "edible",
      nutrition: {
        Calories: 95,
        Protein: "0.5g",
        Fat: "0.3g",
        Carbohydrates: "25g",
        Fiber: "4g"
      }
    };
  } else {
    return {
      type: "non-edible",
      message: "This plastic bottle has a high carbon footprint. Consider using a reusable glass or metal bottle."
    };
  }
}

// Handle Analyze button click
analyzeBtn.addEventListener("click", async () => {
  analyzeBtn.disabled = true;
  output.textContent = "Analyzing...";

  const prompt = promptInput.value.trim();

  const response = await analyzeProduct(prompt);

  output.textContent = "";

  if (response.type === "invalid") {
    output.textContent = "⚠️ Please enter a valid product description or upload an image.";
    nutritionInfo.style.display = "none";
  } else if (response.type === "edible") {
    nutritionInfo.style.display = "block";
    nutritionList.innerHTML = "";
    Object.entries(response.nutrition).forEach(([key, value]) => {
      const li = document.createElement("li");
      li.textContent = `${key}: ${value}`;
      nutritionList.appendChild(li);
    });

    // Pie chart
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(nutritionChartCanvas, {
      type: "pie",
      data: {
        labels: Object.keys(response.nutrition),
        datasets: [{
          data: Object.values(response.nutrition).map(v => parseFloat(v) || 0),
          backgroundColor: [
            "#43a047", "#1e88e5", "#fdd835", "#fb8c00", "#8e24aa"
          ]
        }]
      }
    });
  } else {
    output.textContent = response.message;
    nutritionInfo.style.display = "none";
  }

  analyzeBtn.disabled = false;
});
