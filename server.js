app.post('/analyze', upload.single('photo'), async (req, res) => {
  console.log("📥 Received a request to /analyze");
  console.log("📝 Description:", req.body.description);
  console.log("📸 File:", req.file ? req.file : "No file received");

  const file = req.file;
  const description = req.body.description;

  if (!file || !description) {
    console.log("🚫 Missing file or description.");
    return res.status(400).json({ error: 'Image or description missing.' });
  }

  try {
    console.log("🧠 Sending request to OpenAI...");

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [{ role: 'user', content: description }],
      images: [{ image: file.buffer.toString('base64') }]
    });

    console.log("📝 OpenAI response:", response);

    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    console.error("🚫 Error:", err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});
