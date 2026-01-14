import nodemailer from 'nodemailer';

// Email service configuration
// For development, we'll use a fake SMTP or console logging
// In production, configure with real SMTP credentials

const createTransporter = () => {
  // Production mode - use real SMTP (only if SMTP_HOST is configured)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development mode - return null (we'll just log instead)
  return null;
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const transporter = createTransporter();
  
  // If no SMTP configured (development mode), just log the email
  if (!transporter) {
    console.log('\n📧 ===== EMAIL NOTIFICATION (DEV MODE - NOT SENT) =====');
    console.log('📧 To:', options.to);
    console.log('📧 Subject:', options.subject);
    const textContent = options.text || options.html.replace(/<[^>]*>/g, '');
    console.log('📧 Content Preview:', textContent.substring(0, 300) + (textContent.length > 300 ? '...' : ''));
    console.log('📧 ====================================================\n');
    console.log('💡 To enable real email sending, configure SMTP settings in .env file');
    return true; // Return true in dev mode to not break the flow
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Community Portal <noreply@communityportal.com>',
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('📧 Email sent successfully to:', options.to);
    console.log('📧 Message ID:', info.messageId);
    
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
    console.error('❌ Email sending failed:', error.message);
    // Don't fail the request if email fails (notifications are optional)
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
