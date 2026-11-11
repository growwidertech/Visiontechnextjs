import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { WebsiteSettings } from '../models';

export async function sendEnquiryNotificationEmail(enquiry: {
  name: string;
  email: string;
  phone: string;
  location: string;
  serviceInterestedIn: string;
  budgetRange: string;
  projectDetails: string;
}): Promise<boolean> {
  try {
    const settings = await WebsiteSettings.findOne();
    const recipients =
      settings?.notificationEmails && settings.notificationEmails.length > 0
        ? settings.notificationEmails.join(', ')
        : env.COMPANY_NOTIFICATION_EMAIL;

    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 640px; margin: 0 auto; border: 1px solid #E8DEC8; background: #FAF7F2; padding: 32px;">
        <div style="background: #0B1623; color: #FAF7F2; padding: 24px; text-align: center;">
          <h2 style="margin: 0; color: #D4A853; letter-spacing: 2px;">VISION TECH SOLUTIONS</h2>
          <p style="margin: 6px 0 0; font-size: 12px; color: #E8DEC8;">NEW INTERIOR DESIGN CONSULTATION ENQUIRY</p>
        </div>
        <div style="padding: 24px; background: #FFFFFF; color: #1E252B;">
          <p><strong>Client Name:</strong> ${enquiry.name}</p>
          <p><strong>Phone Number:</strong> ${enquiry.phone}</p>
          <p><strong>Email Address:</strong> ${enquiry.email || 'Not Provided'}</p>
          <p><strong>Location:</strong> ${enquiry.location || 'Not Specified'}</p>
          <p><strong>Service Interested In:</strong> ${enquiry.serviceInterestedIn}</p>
          <p><strong>Estimated Budget:</strong> ${enquiry.budgetRange || 'Not Specified'}</p>
          <hr style="border: none; border-top: 1px solid #E8DEC8; margin: 16px 0;" />
          <p><strong>Project Details:</strong></p>
          <p style="white-space: pre-wrap;">${enquiry.projectDetails || 'Requested a free design consultation.'}</p>
        </div>
      </div>
    `;

    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_PASS !== 'your_smtp_app_password') {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Vision Tech Solutions Website" <${env.SMTP_USER}>`,
        to: recipients,
        subject: `New Design Consultation Enquiry from ${enquiry.name} (${enquiry.serviceInterestedIn})`,
        html: htmlBody,
      });

      logger.info({ recipients, client: enquiry.name }, 'Enquiry notification email dispatched via SMTP');
      return true;
    } else {
      logger.info(
        {
          to: recipients,
          subject: `New Design Consultation Enquiry from ${enquiry.name} (${enquiry.serviceInterestedIn})`,
          enquiry,
        },
        'Email notification logged (configure SMTP_HOST/SMTP_USER/SMTP_PASS in .env for live SMTP relay)'
      );
      return true;
    }
  } catch (err) {
    logger.error({ err }, 'Failed to send enquiry notification email');
    return false;
  }
}
