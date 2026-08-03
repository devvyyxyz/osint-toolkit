import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook API endpoint
 * 
 * POST /api/webhook - Send a report to the configured webhook
 * GET /api/webhook - Get current webhook configuration status
 */

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Send a report to the configured webhook URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body as WebhookPayload;

    // Check if webhooks are enabled
    const webhookEnabled = process.env.WEBHOOK_ENABLED === "true";
    if (!webhookEnabled) {
      return NextResponse.json(
        { error: "Webhooks are not enabled. Set WEBHOOK_ENABLED=true in .env" },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "No webhook URL configured. Set WEBHOOK_URL in .env" },
        { status: 400 }
      );
    }

    // Check if this event type is enabled
    const enabledEvents = (process.env.WEBHOOK_EVENTS || "scan_complete,breach_found,error")
      .split(",")
      .map((e) => e.trim());
    
    if (!enabledEvents.includes(event)) {
      return NextResponse.json(
        { error: `Event type '${event}' is not enabled. Enabled events: ${enabledEvents.join(", ")}` },
        { status: 400 }
      );
    }

    // Build the webhook payload
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Send to webhook
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add signature header if secret is configured
    if (webhookSecret) {
      const crypto = await import("crypto");
      const signature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(payload))
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    return NextResponse.json({ success: true, message: "Report sent to webhook" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to send webhook", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get webhook configuration status
 */
export async function GET() {
  return NextResponse.json({
    enabled: process.env.WEBHOOK_ENABLED === "true",
    url: process.env.WEBHOOK_URL ? "[configured]" : "[not set]",
    events: (process.env.WEBHOOK_EVENTS || "scan_complete,breach_found,error")
      .split(",")
      .map((e) => e.trim()),
    hasSecret: !!process.env.WEBHOOK_SECRET,
  });
}