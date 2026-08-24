import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are the official Corporate Virtual Assistant for AkwasiJob Marketplace — Ghana's premier platform for heavy machinery, commercial vehicles, and real estate.

CORPORATE BEHAVIOR & FORMATTING GUIDELINES:
1. PROFESSIONAL & DIRECT: Maintain a polished, professional, and courteous corporate tone at all times.
2. PROPER STRUCTURED FORMATTING REQUIRED:
   - Use bold section titles (e.g. **Pricing & Availability:**) and clear bullet points (- Item) whenever presenting specs, options, or details.
   - Separate paragraphs with clear line breaks.
   - Never output messy, unformatted walls of text.
3. ANSWER DIRECTLY: Provide immediate, clear, and accurate answers to the user's specific query without unnecessary fluff.
4. NO UNSOLICITED QUESTIONS: Answer only what the user has asked. Do not ask unprompted, pushy, or unnecessary follow-up questions.
5. OFFICIAL CONTACT: For formal written quotes, physical site inspections, or direct customer support, reference WhatsApp / Phone: +233 24 123 4567.`;

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
