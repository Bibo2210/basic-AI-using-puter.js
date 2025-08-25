const promptBox = document.getElementById("prompt");
const imageInput = document.getElementById("imageInput");
const submitBtn = document.getElementById("submit");
const outputDiv = document.getElementById("output");

submitBtn.onclick = async () => {
  const textPrompt = promptBox.value.trim();
  const imageFile = imageInput.files[0];

  if (!textPrompt && !imageFile) {
    outputDiv.textContent = "Please enter a prompt or upload an image.";
    return;
  }

  outputDiv.textContent = "Thinking...";

  try {
    let response;

    if (imageFile) {
      // Convert image file into Puter-compatible file object
      const file = await puter.fs.write(imageFile.name, imageFile);
      response = await puter.ai.chat([
        {
          role: "user",
          content: [
            { type: "file", puter_path: file.path },
            { type: "text", text: textPrompt || "Describe this image." }
          ]
        }
      ]);
    } else {
      // Text-only prompt
      response = await puter.ai.chat(textPrompt);
    }

    outputDiv.textContent = response.message?.content?.[0]?.text || response;
  } catch (err) {
    outputDiv.textContent = "Error: " + err.message;
  }
};
