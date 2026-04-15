import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verificationEmail } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'gtech@connekt.gm';

// Simple in-memory OTP store (for production, use Firestore)
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST — Send OTP
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = generateOTP();
    const expires = Date.now() + 15 * 60 * 1000; // 15 min

    otpStore.set(email.toLowerCase(), { code, expires, attempts: 0 });

    const html = verificationEmail(name || 'there', code);

    const { error } = await resend.emails.send({
      from: `B-Flex <${fromEmail}>`,
      to: [email],
      subject: 'Your Verification Code - B-Flex',
      html,
    });

    if (error) {
      console.error('Resend verify error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('OTP send error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT — Verify OTP
export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const stored = otpStore.get(email.toLowerCase());

    if (!stored) {
      return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    if (stored.attempts >= 5) {
      otpStore.delete(email.toLowerCase());
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(email.toLowerCase());
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 400 });
    }

    if (stored.code !== code) {
      stored.attempts += 1;
      return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
    }

    // Success — clean up
    otpStore.delete(email.toLowerCase());

    // Update user verified status in Firestore
    // This is done client-side via refreshUser after success
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
