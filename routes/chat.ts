import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are the official Corporate Virtual Assistant for AkwasiJob Marketplace — Ghana's premier platform for heavy machinery, commercial vehicles, real estate, and industrial services (fumigation & property management).

STRICT DOMAIN BOUNDARY & OFF-TOPIC RULE:
- YOU MUST ONLY ANSWER QUESTIONS RELATED TO AKWASIJOB MARKETPLACE (heavy machinery, trucks, commercial vehicles, real estate, property management, fumigation, pricing, specifications, shipping, and inspection bookings in Ghana).
- STRICTLY REFUSE all off-topic queries (such as math problems like 2+2, general trivia, homework, coding, recipes, sports, or unrelated topics).
- If an off-topic question is asked, respond politely with:
  "I am the AkwasiJob Marketplace Digital Assistant. I can only assist with matters related to this business. How may I assist you today?"

CORPORATE BEHAVIOR & FORMATTING GUIDELINES:
1. GREETINGS HANDLING:
   - If the user says "hello", "hi", "hey", "good morning", etc., respond with a concise greeting (e.g. "Hello! How can I assist you today with our equipment, vehicles, properties, or services like fumigation and property management?").
   - DO NOT dump long introductory paragraphs or bullet points for simple greetings.
2. PROFESSIONAL & DIRECT: Maintain a polished, direct, and courteous corporate tone.
3. STRUCTURED FORMATTING FOR QUERIES:
   - When answering specific questions regarding marketplace items, specs, or pricing, use bold section titles (e.g. **Pricing & Availability:**) and bullet points (- Item).
   - Separate paragraphs cleanly.
4. NO UNSOLICITED QUESTIONS: Answer only what the user asked about our marketplace.
5. CONTACT DETAILS: Only provide Phone/WhatsApp (Call: 0247111605 / WhatsApp: 0594594245) when explicitly asked for contact info, formal written quotes, or site inspection bookings.`;

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
      reply: "I'm temporarily unavailable. Please contact us directly on WhatsApp: +233 24 711 1605.",
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
