import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  applicationSubmittedEmail,
  applicationAcceptedEmail,
  applicationRejectedEmail,
} from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'gtech@connekt.gm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, name, programName, reason } = body;

    if (!to || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let subject = '';
    let html = '';

    switch (type) {
      case 'application_submitted':
        subject = 'Application Received - B-Flex';
        html = applicationSubmittedEmail(name || 'Applicant', programName || 'G-Tech Program');
        break;
      case 'application_accepted':
        subject = 'Congratulations! Application Accepted - B-Flex';
        html = applicationAcceptedEmail(name || 'Applicant', programName || 'G-Tech Program', reason);
        break;
      case 'application_rejected':
        subject = 'Application Update - B-Flex';
        html = applicationRejectedEmail(name || 'Applicant', programName || 'G-Tech Program', reason);
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: `B-Flex <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
