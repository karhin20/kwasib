import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are the official Corporate Virtual Assistant for AkwasiJob Marketplace — Ghana's premier platform for heavy machinery, commercial vehicles, and real estate.

CORPORATE BEHAVIOR & FORMATTING GUIDELINES:
1. GREETINGS HANDLING:
   - If the user says "hello", "hi", "hey", "good morning", etc., respond with a concise 1-sentence greeting (e.g. "Hello! How can I assist you with our equipment, vehicles, or real estate listings today?").
   - DO NOT dump long introductory paragraphs, company summaries, or bullet points for simple greetings.
2. PROFESSIONAL & DIRECT: Maintain a polished, direct, and courteous corporate tone.
3. STRUCTURED FORMATTING FOR QUERIES:
   - When answering specific questions regarding items, specs, or pricing, use bold section titles (e.g. **Pricing & Availability:**) and bullet points (- Item).
   - Separate paragraphs cleanly.
4. ANSWER DIRECTLY: Provide accurate answers without unsolicited questions or irrelevant disclaimers.
5. CONTACT DETAILS: Only provide Phone/WhatsApp (+233 24 123 4567) when explicitly asked for contact info, formal written quotes, or site inspection bookings.`;

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
    // Use the chat API with history for context
    const chat = await genai.chats.create({
      model: 'gemini-3.6-flash',
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
