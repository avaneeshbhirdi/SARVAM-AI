import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Create Supabase client with user's JWT
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    // Get user profile for limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, prompts_used_today, last_usage_reset')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Could not fetch user profile.' });
    }

    // Check reset
    const now = new Date();
    const lastReset = new Date(profile.last_usage_reset);
    let promptsUsed = profile.prompts_used_today || 0;

    // If last reset was not today, reset counts
    if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      promptsUsed = 0;
    }

    // Check limits
    const plan = profile.plan || 'free';
    let limit = 3;
    if (plan === 'pro') limit = 50;
    if (plan === 'max') limit = Infinity;

    if (promptsUsed >= limit) {
      return res.status(403).json({ error: 'Daily prompt limit reached. Please upgrade your plan.' });
    }

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
    
    // Increment usage
    await supabase.from('profiles').update({
      prompts_used_today: promptsUsed + 1,
      last_usage_reset: new Date().toISOString()
    }).eq('id', user.id);

    res.json({ reply });

  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'An error occurred while generating a response.' });
  }
});

// Create Order endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum amount is 100 paise.' });
    }

    const options = {
      amount,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// Verify Payment endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment signature fields.' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature.' });
    }

    // Verify Auth and Update Supabase Profile
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
    }
    const token = authHeader.split(' ')[1];
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (plan) {
      const { error: updateError } = await supabase.from('profiles').update({ plan }).eq('id', user.id);
      if (updateError) {
         console.error("Failed to update profile", updateError);
         return res.status(500).json({ error: 'Failed to update user profile.' });
      }
    }

    res.json({ success: true, message: 'Payment verified successfully.' });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'An error occurred while verifying the payment.' });
  }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
