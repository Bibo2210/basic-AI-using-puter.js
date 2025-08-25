const analyzeBtn = document.getElementById("analyzeBtn");
const promptBox = document.getElementById("prompt");
const outputDiv = document.getElementById("output");
const nutritionDiv = document.getElementById("nutrition");
const chartContainer = document.getElementById("chartContainer");
const clearBtn = document.getElementById("clearBtn");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");

let nutritionChart = null;

// Enable Analyze when text or images exist
function toggleAnalyze() {
  if (promptBox.value.trim() || imageUpload.files.length > 0) {
    analyzeBtn.disabled = false;
  } else {
    analyzeBtn.disabled = true;
  }
}

promptBox.addEventListener("input", () => {
  promptBox.style.height = "auto";
  promptBox.style.height = promptBox.scrollHeight + "px"; // auto expand
  toggleAnalyze();
});

imageUpload.addEventListener("change", () => {
  imagePreview.innerHTML = "";
  [...imageUpload.files].forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
  toggleAnalyze();
});

// Clear button
clearBtn.addEventListener("click", () => {
  imageUpload.value = "";
  imagePreview.innerHTML = "";
  outputDiv.classList.add("hidden");
  nutritionDiv.classList.add("hidden");
  chartContainer.classList.add("hidden");
  toggleAnalyze();
});

// Simulated AI call
analyzeBtn.addEventListener("click", async () => {
  outputDiv.classList.add("hidden");
  nutritionDiv.classList.add("hidden");
  chartContainer.classList.add("hidden");

  let prompt = promptBox.value.trim();
  if (!prompt && imageUpload.files.length === 0) {
    alert("Please provide a product name or image.");
    return;
  }

  // Simple text check to see if it's valid
  if (!/\w/.test(prompt) && imageUpload.files.length === 0) {
    outputDiv.innerHTML = "<b>Please provide a valid product or item description.</b>";
    outputDiv.classList.remove("hidden");
    return;
  }

  // Simulate edible vs non-edible
  let edible = prompt.toLowerCase().includes("apple") || prompt.toLowerCase().includes("bread");

  if (edible) {
    let nutrients = {
      Calories: 95,
      Protein: 0.5,
      Fat: 0.3,
      Carbohydrates: 25,
      Fiber: 4.4
    };

    nutritionDiv.innerHTML = `
      <h3>🍽 Nutritional Information</h3>
      <ul>
        ${Object.entries(nutrients).map(([k,v]) => `<li><b>${k}:</b> ${v}</li>`).join("")}
      </ul>
    `;
    nutritionDiv.classList.remove("hidden");

    // Chart
    if (nutritionChart) nutritionChart.destroy();
    nutritionChart = new Chart(document.getElementById("nutritionChart"), {
      type: "pie",
      data: {
        labels: Object.keys(nutrients),
        datasets: [{
          data: Object.values(nutrients),
          backgroundColor: ["#66bb6a", "#81c784", "#a5d6a7", "#c8e6c9", "#e8f5e9"]
        }]
      }
    });
    chartContainer.classList.remove("hidden");
  } else {
    outputDiv.innerHTML = `
      <h3>♻ Sustainability Check</h3>
      <p>This product may not be edible. Evaluating eco-friendliness...</p>
      <p><b>Eco Tip:</b> Consider using reusable alternatives to reduce waste.</p>
    `;
    outputDiv.classList.remove("hidden");
  }
});
