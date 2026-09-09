import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

interface SendSmsPayload {
  recipients: string[];
  message: string;
  senderId?: string;
}

/**
 * POST /api/sms/send
 * Sends SMS via Arkesel v2 API (https://sms.arkesel.com/api/v2/sms/send)
 * Protected: Admin authentication required
 */
router.post('/send', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipients, message, senderId }: SendSmsPayload = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      res.status(400).json({ error: 'At least one recipient phone number is required.' });
      return;
    }

    const apiKey = process.env.ARKESEL_API_KEY;
    const defaultSender = process.env.ARKESEL_SENDER_ID || 'Akwasi';
    const finalSender = (senderId || defaultSender).slice(0, 11);

    // Clean recipient phone numbers (ensure format like +233...)
    const cleanRecipients = recipients.map((r) => {
      let cleaned = r.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '233' + cleaned.slice(1);
      } else if (cleaned.startsWith('+')) {
        cleaned = cleaned.slice(1);
      }
      return cleaned;
    });

    if (!apiKey) {
      console.log('⚠️ [Arkesel SMS Simulation Mode]');
      console.log(`Sender ID: "${finalSender}"`);
      console.log(`Recipients (${cleanRecipients.length}):`, cleanRecipients);
      console.log(`Message: "${message}"`);

      res.json({
        success: true,
        count: cleanRecipients.length,
        simulated: true,
        message: `[Simulation Mode] SMS queued for ${cleanRecipients.length} recipients. Add ARKESEL_API_KEY to backend/.env for live dispatch.`,
        arkeselResponse: {
          status: 'success',
          code: 100,
          message: 'Simulation: SMS processed successfully',
          data: { recipients: cleanRecipients },
        },
      });
      return;
    }

    // Call live Arkesel v2 API
    console.log(`📡 Sending SMS via Arkesel to ${cleanRecipients.length} recipients...`);

    const arkeselRes = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: finalSender,
        recipients: cleanRecipients,
        message: message.trim(),
      }),
    });

    const arkeselData = await arkeselRes.json();

    if (!arkeselRes.ok) {
      console.error('❌ Arkesel API error response:', arkeselData);
      res.status(arkeselRes.status).json({
        error: arkeselData?.message || 'Arkesel SMS API failed to send message.',
        details: arkeselData,
      });
      return;
    }

    console.log('✅ Arkesel SMS dispatched successfully:', arkeselData);

    res.json({
      success: true,
      count: cleanRecipients.length,
      simulated: false,
      arkeselResponse: arkeselData,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to send SMS';
    console.error('POST /sms/send error:', err);
    res.status(500).json({ error: errorMsg });
  }
});

export default router;
