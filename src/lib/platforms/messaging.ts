/**
 * Messaging and communication platform definitions.
 */

import type { Platform } from "./types";
import { basicDetect } from "./helpers";

export const MESSAGING_PLATFORMS: Platform[] = [
  {
    id: "discord",
    name: "Discord",
    url: "https://discord.com",
    icon: "MessageCircle",
    category: "Messaging",
    detect: basicDetect,
  },
  {
    id: "telegram",
    name: "Telegram",
    url: "https://t.me",
    icon: "Send",
    category: "Messaging",
    detect: basicDetect,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    url: "https://wa.me",
    icon: "MessageSquare",
    category: "Messaging",
    detect: basicDetect,
  },
];
