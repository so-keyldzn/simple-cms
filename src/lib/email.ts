import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import React from "react";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Get email settings from database
 */
async function getEmailSettings() {
  try {
    const [fromEmailSetting, fromNameSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "from_email" } }),
      prisma.setting.findUnique({ where: { key: "from_name" } }),
    ]);

    return {
      fromEmail: fromEmailSetting?.value || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      fromName: fromNameSetting?.value || process.env.RESEND_FROM_NAME || "Your Site Name",
    };
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return {
      fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      fromName: process.env.RESEND_FROM_NAME || "Your Site Name",
    };
  }
}

/**
 * Send an email using Resend with settings from database
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  react,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  react?: JSX.Element;
}) {
  try {
    const { fromEmail, fromName } = await getEmailSettings();

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      text,
      react: react as any,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
