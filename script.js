const promptBox = document.getElementById("prompt");
const imageInput = document.getElementById("imageInput");
const submitBtn = document.getElementById("submit");

const nutritionSection = document.getElementById("nutritionSection");
const nutritionList = document.getElementById("nutritionList");
const ecoSection = document.getElementById("ecoSection");
const ecoText = document.getElementById("ecoText");

submitBtn.onclick = async () => {
  const textPrompt = promptBox.value.trim();
  const imageFile = imageInput.files[0];

  if (!textPrompt && !imageFile) {
    alert("⚠️ Please enter a product or upload an image.");
    return;
  }

  // Reset sections
  nutritionSection.classList.add("hidden");
  ecoSection.classList.add("hidden");

  try {
    let inputContent;

    if (imageFile) {
      const file = await puter.fs.write(imageFile.name, imageFile);
      inputContent = [
        { type: "file", puter_path: file.path },
        { type: "text", text: textPrompt || "Analyze this product." }
      ];
    } else {
      inputContent = textPrompt;
    }

    // Special EcoReveal prompt
    const systemPrompt = `
You are EcoReveal, an AI that analyzes products for health & sustainability. 
If the product is edible: 
- Output ONLY a JSON object with "Calories", "Proteins", "Fats", "Carbohydrates", "Minerals". 
If the product is not edible: 
- Output ONLY a short sustainability analysis (3-5 sentences) with eco-friendly alternatives if needed.
    `;

    const response = await puter.ai.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: inputContent }
    ]);

    const reply = response.message?.content?.[0]?.text || response;

    // Try parsing as JSON → Edible
    try {
      const data = JSON.parse(reply);
      nutritionList.innerHTML = "";
      for (const [key, value] of Object.entries(data)) {
        const li = document.createElement("li");
        li.textContent = `${key}: ${value}`;
        nutritionList.appendChild(li);
      }
      nutritionSection.classList.remove("hidden");
    } catch {
      // Non-edible → Text response
      ecoText.textContent = reply;
      ecoSection.classList.remove("hidden");
    }

  } catch (err) {
    alert("❌ Error: " + err.message);
  }
};
