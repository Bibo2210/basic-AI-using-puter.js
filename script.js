// Handle image upload + preview
document.getElementById("imageInput").addEventListener("change", function (event) {
  const files = event.target.files;
  const preview = document.getElementById("image-preview");
  preview.innerHTML = ""; // Clear previous previews

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const card = document.createElement("div");
      card.classList.add("image-card");

      const img = document.createElement("img");
      img.src = e.target.result;

      card.appendChild(img);
      preview.appendChild(card);
    };
    reader.readAsDataURL(file);
  });
});

// Analyze button logic
document.getElementById("analyzeBtn").addEventListener("click", function () {
  const btn = this;
  btn.disabled = true; // disable to prevent spam

  const prompt = document.getElementById("prompt").value.trim();
  const responseBox = document.getElementById("response");
  responseBox.innerHTML = "";

  if (!prompt) {
    responseBox.innerHTML = `<p style="color:red;">⚠️ Please enter a prompt.</p>`;
    btn.disabled = false;
    return;
  }

  // Basic check: if it's not a valid item
  if (!isValidItem(prompt)) {
    responseBox.innerHTML = `<p style="color:red;">⚠️ Please enter a valid item (food or product).</p>`;
    btn.disabled = false;
    return;
  }

  // Simulated API response
  setTimeout(() => {
    const isFood = checkIfEdible(prompt);

    if (isFood) {
      responseBox.innerHTML = `
        <h3>🍽 Nutritional Information</h3>
        <p><b>Item:</b> ${prompt}</p>
        <div id="chart-container">
          <canvas id="nutritionChart"></canvas>
        </div>
      `;

      // Example nutrition data
      const nutrition = { proteins: 25, fats: 15, carbohydrates: 60 };
      renderNutritionChart(nutrition);
    } else {
      responseBox.innerHTML = `<p>✅ "${prompt}" is not edible, no nutrition info available.</p>`;
    }

    btn.disabled = false;
  }, 1000);
});

// Check if prompt is valid (simple check)
function isValidItem(text) {
  return /^[a-zA-Z0-9\s]+$/.test(text); // only words & numbers
}

// Check if edible (basic simulation)
function checkIfEdible(item) {
  const foodList = ["apple", "bread", "cheese", "tuna", "rice", "milk", "egg"];
  return foodList.includes(item.toLowerCase());
}

// Render nutrition pie chart
function renderNutritionChart(nutrition) {
  const ctx = document.getElementById("nutritionChart").getContext("2d");

  if (window.nutritionChart) {
    window.nutritionChart.destroy();
  }

  window.nutritionChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Proteins", "Fats", "Carbohydrates"],
      datasets: [{
        data: [nutrition.proteins, nutrition.fats, nutrition.carbohydrates],
        backgroundColor: ["#4caf50", "#ff9800", "#2196f3"], // green, orange, blue
        borderWidth: 2,
        borderColor: "#fff"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#333",
            font: { size: 14, weight: "bold" }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || '';
              let value = context.raw || 0;
              return `${label}: ${value}g`;
            }
          }
        }
      }
    }
  });
}
