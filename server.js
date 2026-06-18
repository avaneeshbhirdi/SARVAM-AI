import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env or .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Setup Middleware
app.use(cors());
app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required and must be a string.' });
    }

    // Format history for Gemini API
    // The @google/genai SDK expects parts array for each message
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Generate content using gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ]
    });

    const reply = response.text;
    res.json({ reply });

  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'An error occurred while generating a response.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
