import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are an AI assistant for AkwasiJob Marketplace — Ghana's premier platform for buying and selling heavy machinery, commercial vehicles, and real estate.

You help customers with:
- Equipment and vehicle enquiries (pricing, availability, specifications, condition)
- Property and real estate questions (location, amenities, pricing)
- Inspection scheduling (Monday–Saturday, 8 AM – 5 PM)
- Shipping & logistics within Ghana (Tema Port, Takoradi, Accra, Kumasi)
- Lease and financing options

Always be professional, helpful, and concise. Respond in English.
If a user asks about a specific listing and you have details, answer accurately.
For complex negotiations or urgent requests, direct them to WhatsApp: +233 24 123 4567.
Keep responses under 150 words.`;

// POST /api/chat
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { message, history } = req.body as {
    message?: string;
    history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  };

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  try {
    const model = genai.getGenerativeModel
      ? // @ts-expect-error – older SDK compat
        genai.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' })
      : null;

    // Use the chat API with history for context
    const chat = await genai.chats.create({
      model: 'gemini-2.5-flash-preview-04-17',
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      history: history ?? [],
    });

    const result = await chat.sendMessage({ message });
    const text = result.text ?? "I'm sorry, I couldn't process that. Please try again or contact us on WhatsApp.";

    res.json({ reply: text });
  } catch (err) {
    console.error('Gemini chat error:', err);
    res.status(500).json({
      error: 'AI chat failed',
      reply: "I'm temporarily unavailable. Please contact us directly on WhatsApp: +233 24 123 4567.",
    });
  }
});

// POST /api/chat/enquiry — save a customer enquiry to the DB
router.post('/enquiry', async (req: Request, res: Response): Promise<void> => {
  const { customerName, phone, email, category, source, message, aiConversationSnippet, itemTitle, listingId } =
    req.body as {
      customerName?: string;
      phone?: string;
      email?: string;
      category?: string;
      source?: string;
      message?: string;
      aiConversationSnippet?: { userPrompt: string; botAnswer: string };
      itemTitle?: string;
      listingId?: string;
    };

  if (!customerName || !phone || !message) {
    res.status(400).json({ error: 'customerName, phone, and message are required' });
    return;
  }

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        customer_name: customerName,
        phone,
        email: email ?? null,
        category: category ?? 'General',
        source: source ?? 'ai_assistant',
        message,
        ai_conversation_snippet: aiConversationSnippet ?? null,
        item_title: itemTitle ?? null,
        listing_id: listingId ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Save enquiry error:', err);
    res.status(500).json({ error: 'Failed to save enquiry' });
  }
});

export default router;
