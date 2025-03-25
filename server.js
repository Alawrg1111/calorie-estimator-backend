const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const cors = require('cors');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enable CORS so your frontend can connect
const corsOptions = {
    origin: 'https://calorie-estimator-frontend.vercel.app',
    methods: ['POST'],
    credentials: false
  };
  
  app.use(cors(corsOptions));
  

// Multer config: store uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/analyze', upload.single('photo'), async (req, res) => {
  try {
    const file = req.file;
    const description = req.body.description;

    if (!file || !description) {
      return res.status(400).json({ error: 'Image or description missing.' });
    }

    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const prompt = `
You are a nutritionist. Estimate the number of calories in this meal based on the photo and user input.
User description: "${description}"
Return an estimated calorie count and a rough breakdown (e.g. protein, carbs, fats).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }
      ],
      max_tokens: 500
    });

    const result = response.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
