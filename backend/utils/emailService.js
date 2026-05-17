const { Resend }   = require('resend');
const nodemailer   = require('nodemailer');

/* ─── helpers ────────────────────────────────────────────────────── */

const buildHtml = (user, event, ticket) => {
    const ticketCode = ticket._id.toString().substring(0, 8).toUpperCase();
    const eventDate  = event.date
        ? new Date(event.date).toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })
        : 'TBA';

    return { ticketCode, eventDate, html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#0f0f1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr><td style="background:linear-gradient(135deg,#6c63ff,#a855f7);padding:40px 40px 30px;border-radius:16px 16px 0 0;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:-0.5px;">🎉 You're In!</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Your ticket has been confirmed</p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#1a1a2e;padding:36px 40px;">
          <p style="margin:0 0 24px;color:#c4c4d4;font-size:15px;line-height:1.6;">
            Hi <strong style="color:#fff;">${user.name}</strong>, thank you for booking! Here are your ticket details:
          </p>

          <!-- TICKET CARD -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#0f0f1a;border:1px solid rgba(108,99,255,0.3);border-radius:12px;margin-bottom:28px;">
            <tr><td style="padding:24px 28px;">

              <p style="margin:0 0 4px;color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Event</p>
              <p style="margin:0 0 20px;color:#fff;font-size:20px;font-weight:700;">${event.title}</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="vertical-align:top;padding-bottom:16px;">
                    <p style="margin:0 0 4px;color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">📅 Date</p>
                    <p style="margin:0;color:#e2e2f0;font-size:14px;">${eventDate}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top;padding-bottom:16px;">
                    <p style="margin:0 0 4px;color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">📍 Location</p>
                    <p style="margin:0;color:#e2e2f0;font-size:14px;">${event.location || 'TBA'}</p>
                  </td>
                </tr>
                <tr>
                  <td width="48%" style="vertical-align:top;">
                    <p style="margin:0 0 4px;color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">🏷️ Category</p>
                    <p style="margin:0;color:#e2e2f0;font-size:14px;">${event.category || 'General'}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top;">
                    <p style="margin:0 0 4px;color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">👤 Attendee</p>
                    <p style="margin:0;color:#e2e2f0;font-size:14px;">${ticket.attendeeName || user.name}</p>
                  </td>
                </tr>
              </table>

              <!-- TICKET CODE -->
              <div style="background:linear-gradient(135deg,rgba(108,99,255,0.15),rgba(168,85,247,0.15));
                           border:1.5px dashed rgba(108,99,255,0.5);border-radius:10px;
                           padding:20px;text-align:center;margin-top:16px;">
                <p style="margin:0 0 6px;color:#a855f7;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Your Ticket Code</p>
                <p style="margin:0;color:#fff;font-size:32px;font-weight:900;letter-spacing:8px;font-family:monospace;">${ticketCode}</p>
                <p style="margin:8px 0 0;color:#9898b0;font-size:12px;">Present this code at the venue entry gate</p>
              </div>

            </td></tr>
          </table>

          <p style="margin:0 0 8px;color:#9898b0;font-size:13px;line-height:1.6;">✅ &nbsp;Your spot is secured. See you there!</p>
          <p style="margin:0;color:#9898b0;font-size:13px;line-height:1.6;">🔍 &nbsp;View all your tickets on the <strong style="color:#c4c4d4;">My Dashboard</strong> page.</p>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:#13131f;padding:24px 40px;border-radius:0 0 16px 16px;
                        text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="margin:0;color:#5a5a7a;font-size:12px;">
            © 2026 <strong style="color:#7c7c9a;">EventMaster Pro</strong> &nbsp;·&nbsp; Automated email — please do not reply.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`};
};

/* ─── main export ────────────────────────────────────────────────── */

/**
 * Sends a booking confirmation email.
 * Priority: Resend API → Brevo SMTP → Gmail SMTP → Ethereal (test)
 */
const sendBookingConfirmation = async (user, event, ticket) => {
    try {
        const { ticketCode, eventDate, html } = buildHtml(user, event, ticket);
        const subject = `🎟️ Booking Confirmed — ${event.title}`;

        /* ── Option 1: Resend (works for owner's email; auto-fallback for others) ── */
        if (process.env.RESEND_API_KEY) {
            console.log('📧 [EmailService] Trying Resend API...');
            const resend = new Resend(process.env.RESEND_API_KEY);
            const { data, error } = await resend.emails.send({
                from:    'EventMaster Pro <onboarding@resend.dev>',
                to:      [user.email],
                subject,
                html,
            });

            if (!error) {
                console.log(`📧 [EmailService] Email sent to ${user.email} via Resend ✅`);
                return;
            }

            // If blocked (sandbox restriction), fall through to Brevo
            if (error.message && error.message.includes('own email address')) {
                console.log('📧 [EmailService] Resend sandbox limit — falling back to Brevo SMTP...');
            } else {
                throw new Error(error.message);
            }
        }

        /* ── Option 2: Brevo SMTP (works for any recipient) ── */
        /* ── Option 3: Gmail SMTP ── */
        let transportConfig;
        if (process.env.BREVO_USER && process.env.BREVO_PASS) {
            console.log('📧 [EmailService] Using Brevo SMTP');
            transportConfig = {
                host: 'smtp-relay.brevo.com', port: 587, secure: false,
                auth: { user: process.env.BREVO_USER, pass: process.env.BREVO_PASS },
            };
        } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log('📧 [EmailService] Using Gmail SMTP');
            transportConfig = {
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            };
        } else {
            /* ── Option 4: Ethereal test ── */
            const testAccount = await nodemailer.createTestAccount();
            console.log('\n📧 [EmailService] No credentials — using Ethereal (test only)');
            transportConfig = {
                host: 'smtp.ethereal.email', port: 587, secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass },
            };
        }

        const transporter = nodemailer.createTransport(transportConfig);
        const senderEmail = process.env.SENDER_EMAIL || 'sakshisk1110@gmail.com';

        const info = await transporter.sendMail({
            from: `"EventMaster Pro" <${senderEmail}>`,
            to:      user.email,
            subject,
            html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log('\n📧 [EmailService] Ethereal preview URL:');
            console.log('  ', previewUrl, '\n');
        } else {
            console.log(`📧 [EmailService] Email sent to ${user.email}`);
        }

    } catch (err) {
        console.error('⚠️  [EmailService] Failed to send email:', err.message);
    }
};

module.exports = { sendBookingConfirmation };
