import nodemailer from 'nodemailer';

// Email service configuration
// NOTE: Render free tier blocks SMTP ports (25, 465, 587)
// For Render, use API-based email services (SendGrid, Mailgun, Resend) or upgrade to paid plan
// For local development, SMTP works fine

const createTransporter = () => {
  // Don't create SMTP transporter if API key is set (API takes priority)
  if (process.env.EMAIL_API_KEY) {
    return null; // Will use API instead
  }

  // Use SMTP (works locally, but blocked on Render free tier)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '587');
    
    // Warn if using blocked ports on Render
    if (process.env.NODE_ENV === 'production' && [25, 465, 587].includes(port)) {
      console.warn('⚠️  WARNING: SMTP ports 25, 465, and 587 are BLOCKED on Render free tier!');
      console.warn('⚠️  Emails will NOT work. Use an API-based email service instead.');
      console.warn('⚠️  Options: SendGrid, Mailgun, Resend, or upgrade Render plan');
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Add debug logging
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
      // Add connection timeout for Render
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
    
    // Verify connection on creation (async, don't wait)
    transporter.verify((error) => {
      if (error) {
        console.error('❌ SMTP Connection verification failed:', error.message);
        const errorCode = (error as any).code;
        if (errorCode === 'ETIMEDOUT' || errorCode === 'ECONNREFUSED') {
          console.error('❌ This is likely because Render blocks SMTP ports on free tier');
          console.error('❌ Switch to API-based email service (SendGrid, Mailgun, Resend)');
        }
      } else {
        console.log('✅ SMTP Connection verified successfully');
      }
    });
    
    return transporter;
  }

  // No email configuration - return null (we'll just log instead)
  return null;
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // Check if using API-based email service (for Render free tier) - PRIORITY CHECK
  if (process.env.EMAIL_API_KEY) {
    console.log('📧 Using API-based email service (Render-compatible)');
    return sendEmailViaAPI(options);
  }

  // Fallback to SMTP (only if API key not set)
  const transporter = createTransporter();
  
  // If no email configured, just log the email
  if (!transporter) {
    console.log('\n📧 ===== EMAIL NOTIFICATION (NOT CONFIGURED - NOT SENT) =====');
    console.log('📧 To:', options.to);
    console.log('📧 Subject:', options.subject);
    const textContent = options.text || options.html.replace(/<[^>]*>/g, '');
    console.log('📧 Content Preview:', textContent.substring(0, 300) + (textContent.length > 300 ? '...' : ''));
    console.log('📧 ====================================================\n');
    console.log('💡 To enable email sending:');
    console.log('   - For Render free tier: Set EMAIL_SERVICE and EMAIL_API_KEY');
    console.log('   - For local/paid Render: Configure SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS)');
    return true; // Return true to not break the flow
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Community Portal <noreply@communityportal.com>',
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      html: options.html,
    };

    console.log('📧 Attempting to send email...');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email accepted by SMTP server');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    
    // Log additional info for Gmail
    if (process.env.SMTP_HOST === 'smtp.gmail.com') {
      console.log('📧 Gmail SMTP: Email accepted. Check recipient inbox and spam folder.');
      console.log('📧 Note: Gmail may delay or block emails if:');
      console.log('   - Sending to many recipients quickly');
      console.log('   - Email content triggers spam filters');
      console.log('   - App password is incorrect or expired');
    }
    
    // If using Ethereal Email, show preview URL
    if (process.env.SMTP_HOST === 'smtp.ethereal.email' && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Preview URL:', previewUrl);
        console.log('💡 Open this URL in your browser to view the email!');
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Email sending failed!');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error command:', error.command);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    
    // Common errors
    if (error.code === 'EAUTH') {
      console.error('❌ Authentication failed! Check:');
      console.error('   - SMTP_USER is correct');
      console.error('   - SMTP_PASS is the App Password (not regular password)');
      console.error('   - 2-Factor Authentication is enabled on Gmail');
      console.error('   - App Password was generated correctly');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('❌ Connection failed! This is likely because:');
      console.error('   - Render free tier BLOCKS SMTP ports (25, 465, 587)');
      console.error('   - Solution: Use API-based email service (SendGrid, Mailgun, Resend)');
      console.error('   - Or upgrade Render to paid plan to unblock SMTP ports');
    } else if (error.responseCode) {
      console.error('❌ SMTP Server Error:', error.responseCode, error.response);
    }
    
    // Don't fail the request if email fails (notifications are optional)
    return false;
  }
};

// Send email via API (for Render free tier - uses HTTPS, not SMTP)
const sendEmailViaAPI = async (options: EmailOptions): Promise<boolean> => {
  try {
    const apiKey = process.env.EMAIL_API_KEY;
    const emailService = process.env.EMAIL_SERVICE || 'sendgrid'; // sendgrid, mailgun, resend
    
    if (!apiKey) {
      console.error('❌ EMAIL_API_KEY not configured');
      return false;
    }

    console.log('📧 Sending email via API (Render-compatible)...');
    console.log('📧 Service:', emailService);
    console.log('📧 To:', options.to);
    console.log('📧 Subject:', options.subject);

    const fromEmail = process.env.SMTP_FROM || 'Community Portal <noreply@communityportal.com>';
    const fromMatch = fromEmail.match(/<(.+)>/) || fromEmail.match(/(\S+@\S+)/);
    const fromAddress = fromMatch ? fromMatch[1] : fromEmail;

    let response: Response;
    
    if (emailService === 'sendgrid') {
      // SendGrid API
      // SendGrid requires verified sender - use verified email or default
      // Extract verified sender from SMTP_FROM or use a default
      let sendgridFrom = fromAddress;
      
      // If using Gmail address, SendGrid needs it verified or use a default
      // For now, try to use the email but it must be verified in SendGrid dashboard
      // If verification fails, user needs to verify sender in SendGrid
      
      const emailPayload: any = {
        personalizations: [{
          to: [{ email: options.to }],
          subject: options.subject,
        }],
        from: { email: sendgridFrom },
        content: [
          { type: 'text/html', value: options.html },
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
        ],
      };
      
      // Add reply-to if different from from address
      const replyToEmail = process.env.REPLY_TO_EMAIL;
      if (replyToEmail && replyToEmail !== sendgridFrom) {
        const replyToMatch = replyToEmail.match(/<(.+)>/) || replyToEmail.match(/(\S+@\S+)/);
        if (replyToMatch) {
          emailPayload.reply_to = { email: replyToMatch[1] };
          console.log('📧 Reply-To set to:', replyToMatch[1]);
        }
      }
      
      response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(emailPayload),
      });
    } else if (emailService === 'resend') {
      // Resend API
      // Extract reply-to email if specified, otherwise use SMTP_FROM
      const replyToEmail = process.env.REPLY_TO_EMAIL || process.env.SMTP_FROM;
      const replyToMatch = replyToEmail ? (replyToEmail.match(/<(.+)>/) || replyToEmail.match(/(\S+@\S+)/)) : null;
      const replyToAddress = replyToMatch ? replyToMatch[1] : null;
      
      // Use Resend's default domain for "from" (required), but set reply-to to Gmail
      const resendFrom = fromAddress.includes('@gmail.com') 
        ? 'onboarding@resend.dev' // Resend requires verified domain, use default
        : fromAddress;
      
      const emailPayload: any = {
        from: resendFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };
      
      // Add reply-to if different from "from" address
      if (replyToAddress && replyToAddress !== resendFrom) {
        emailPayload.reply_to = replyToAddress;
        console.log('📧 Reply-To set to:', replyToAddress);
      }
      
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(emailPayload),
      });
    } else if (emailService === 'mailgun') {
      // Mailgun API
      const mailgunDomain = process.env.MAILGUN_DOMAIN || 'your-domain.com';
      const authString = Buffer.from(`api:${apiKey}`).toString('base64');
      response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
        },
        body: new URLSearchParams({
          from: fromAddress,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text || options.html.replace(/<[^>]*>/g, ''),
        }),
      });
    } else {
      console.error('❌ Unknown email service:', emailService);
      console.error('❌ Supported services: sendgrid, resend, mailgun');
      return false;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Email API request failed:', response.status, errorText);
      return false;
    }

    const result = await response.json().catch(() => ({}));
    console.log('✅ Email sent via API successfully');
    console.log('📧 Response:', result);
    return true;
  } catch (error: any) {
    console.error('❌ Email API request failed:', error.message);
    return false;
  }
};

export const sendEventRegistrationEmail = async (
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
  isFirstTime: boolean = false
): Promise<boolean> => {
  const html = isFirstTime ? `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7BA09F 0%, #6a8f8e 100%); color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
        .welcome-badge { background-color: #D9191C; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 15px; font-size: 14px; font-weight: bold; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .event-details { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #7BA09F; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .welcome-message { background: linear-gradient(135deg, #f0f9f9 0%, #e8f5f5 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #7BA09F; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="welcome-badge">🎉 WELCOME TO YOUR FIRST EVENT! 🎉</div>
          <h1>Event Registration Confirmation</h1>
        </div>
        <div class="content">
          <div class="welcome-message">
            <p style="font-size: 18px; font-weight: bold; color: #7BA09F; margin-bottom: 10px;">Welcome to the Community Portal, ${userName}!</p>
            <p style="margin: 0;">We're thrilled that you've registered for your first event with us! This is the beginning of an amazing journey in our community.</p>
          </div>
          <p>Hello ${userName},</p>
          <p>You have successfully registered for your <strong>first event</strong> in our community portal:</p>
          <div class="event-details">
            <h2 style="color: #7BA09F; margin-top: 0;">${eventTitle}</h2>
            <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
          </div>
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>You'll receive reminders before the event</li>
            <li>Check your dashboard for updates and other upcoming events</li>
            <li>Connect with other community members</li>
          </ul>
          <p>We're so excited to have you join us and look forward to seeing you there!</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>
        <div class="footer">
          <p>Community Portal - Bringing communities together</p>
          <p style="margin-top: 10px; font-size: 11px; color: #999;">Thank you for being part of our community!</p>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #7BA09F; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
        .event-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #7BA09F; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Registration Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>You have successfully registered for the following event:</p>
          <div class="event-details">
            <h2>${eventTitle}</h2>
            <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
          </div>
          <p>We look forward to seeing you there!</p>
          <p>If you have any questions, please contact us.</p>
        </div>
        <div class="footer">
          <p>Community Portal - Bringing communities together</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: isFirstTime 
      ? `🎉 Welcome! Your First Event Registration: ${eventTitle}`
      : `Registration Confirmed: ${eventTitle}`,
    html,
  });
};

export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7BA09F 0%, #6a8f8e 100%); color: white; padding: 40px; text-align: center; border-radius: 5px 5px 0 0; }
        .welcome-badge { background-color: #D9191C; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin-bottom: 20px; font-size: 16px; font-weight: bold; }
        .content { background-color: #f9f9f9; padding: 40px; border-radius: 0 0 5px 5px; }
        .welcome-message { background: linear-gradient(135deg, #f0f9f9 0%, #e8f5f5 100%); padding: 25px; border-radius: 8px; margin-bottom: 25px; border: 2px solid #7BA09F; }
        .features { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #7BA09F; border-radius: 4px; }
        .button { display: inline-block; background-color: #7BA09F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="welcome-badge">🎉 WELCOME! 🎉</div>
          <h1>Welcome to Community Portal</h1>
        </div>
        <div class="content">
          <div class="welcome-message">
            <p style="font-size: 20px; font-weight: bold; color: #7BA09F; margin-bottom: 15px;">Hello ${userName}!</p>
            <p style="margin: 0; font-size: 16px;">We're thrilled to have you join our community! Your account has been successfully created.</p>
          </div>
          <p>Thank you for registering with Community Portal. You're now part of an amazing community where you can:</p>
          <div class="features">
            <h3 style="color: #7BA09F; margin-top: 0;">What you can do:</h3>
            <ul>
              <li><strong>Create and share posts</strong> with the community</li>
              <li><strong>Discover and register</strong> for exciting events</li>
              <li><strong>Connect and interact</strong> with other members</li>
              <li><strong>Stay updated</strong> with real-time notifications</li>
            </ul>
          </div>
          <p>Get started by exploring your dashboard and checking out upcoming events!</p>
          <p>If you have any questions or need help, feel free to reach out to us.</p>
          <p style="margin-top: 30px;">Welcome aboard!</p>
          <p style="margin: 0;"><strong>The Community Portal Team</strong></p>
        </div>
        <div class="footer">
          <p>Community Portal - Bringing communities together</p>
          <p style="margin-top: 10px; font-size: 11px; color: #999;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject: '🎉 Welcome to Community Portal!',
    html,
  });
};
