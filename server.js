const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware for CORS — allow frontend to talk to backend
const corsOptions = {
  origin: 'https://calorie-estimator-frontend.vercel.app',
  methods: ['POST'],
  credentials: false
};
app.use(cors(corsOptions));

// Middleware to parse incoming data
app.use(express.json());

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route for analyzing the meal
app.post('/analyze', upload.single('photo'), async (req, res) => {
  console.log("📥 Received a request to /analyze");

  const file = req.file;
  const description = req.body.description;

  console.log("📝 Description:", description);
  console.log("📸 File:", file);

  if (!file || !description) {
    console.log("🚫 Missing file or description.");
    return res.status(400).json({ error: 'Image or description missing.' });
  }

  try {
    console.log("🧠 Sending request to OpenAI...");

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: `Analyze this meal. Description: ${description}`,
        },
        { type: 'image', image: file.buffer.toString('base64') }
      ]
    });

    console.log("📝 OpenAI response:", response);

    // Send the response back to the frontend
    res.json({ result: response.choices[0].message.content });
  } catch (err) {
    console.error("🚫 Error:", err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
