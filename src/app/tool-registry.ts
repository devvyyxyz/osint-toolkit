/**
 * Tool registry — defines all available tools and their groupings.
 *
 * This was extracted from app-sidebar.tsx to keep the sidebar component
 * focused on rendering rather than data definition.
 */

import {
  AtSign,
  Mail,
  Phone,
  Image as ImageIcon,
  Users,
  Fingerprint,
  Globe,
  MapPin,
  Wifi,
  Network,
  Server,
  Lock,
  ShieldCheck,
  Key,
  ShieldAlert,
  Crosshair,
  AlertTriangle,
  Eye,
  Share2,
  FileSearch,
  Clock,
  Link2,
  Hash,
  Bookmark,
  Bitcoin,
  Activity,
  Code,
  Database,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
}

export interface ToolGroup {
  label: string;
  tools: ToolDef[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    label: "Identity",
    tools: [
      { id: "username-finder", name: "Username Finder", description: "Search @usernames across 100+ social platforms", icon: AtSign, enabled: true },
      { id: "email-lookup", name: "Email Lookup", description: "Find accounts linked to an email address across services", icon: Mail, enabled: true },
      { id: "phone-lookup", name: "Phone Lookup", description: "Find accounts linked to a phone number via caller ID & social", icon: Phone, enabled: true },
      { id: "reverse-image", name: "Reverse Image", description: "Find where a profile picture appears across the web", icon: ImageIcon, enabled: true },
      { id: "name-search", name: "Name Search", description: "Search for a person by real name across public records", icon: Users, enabled: true },
      { id: "fingerprint", name: "Fingerprint", description: "Generate a digital fingerprint for an identity", icon: Fingerprint, enabled: true },
    ],
  },
  {
    label: "Network",
    tools: [
      { id: "domain-scanner", name: "Domain Scanner", description: "DNS, WHOIS, SSL, subdomains, tech stack & security headers", icon: Globe, enabled: true },
      { id: "ip-lookup", name: "IP Lookup", description: "Geolocate an IP and see ASN, ISP, and hosting info", icon: MapPin, enabled: true },
      { id: "wifi-scanner", name: "WiFi Scanner", description: "Scan nearby WiFi networks and their security", icon: Wifi, enabled: false },
      { id: "port-scanner", name: "Port Scanner", description: "Scan a host for open ports and running services", icon: Network, enabled: true },
      { id: "dns-lookup", name: "DNS Lookup", description: "Query DNS records for a domain across all record types", icon: Server, enabled: true },
      { id: "ssl-inspector", name: "SSL Inspector", description: "Inspect SSL/TLS certificate chain for any domain", icon: Lock, enabled: true },
    ],
  },
  {
    label: "Security",
    tools: [
      { id: "breach-checker", name: "Breach Checker", description: "Check if an email or username appears in known data breaches", icon: ShieldCheck, enabled: true },
      { id: "password-checker", name: "Password Strength", description: "Check password strength and breach history", icon: Key, enabled: true },
      { id: "malware-scanner", name: "Malware Scanner", description: "Scan a URL or file against known malware databases", icon: ShieldAlert, enabled: true },
      { id: "phishing-detector", name: "Phishing Detector", description: "Check if a URL is flagged as a phishing site", icon: Crosshair, enabled: true },
      { id: "vuln-scanner", name: "Vuln Scanner", description: "Scan a domain for known CVEs and vulnerabilities", icon: AlertTriangle, enabled: true },
      { id: "privacy-audit", name: "Privacy Audit", description: "Audit your digital footprint across platforms", icon: Eye, enabled: true },
    ],
  },
  {
    label: "Investigation",
    tools: [
      { id: "social-graph", name: "Social Graph", description: "Map connections between accounts across platforms", icon: Share2, enabled: true },
      { id: "metadata-extractor", name: "Metadata Extractor", description: "Extract EXIF and metadata from images and documents", icon: FileSearch, enabled: true },
      { id: "wayback-explorer", name: "Wayback Explorer", description: "Browse archived snapshots of any URL over time", icon: Clock, enabled: true },
      { id: "link-extractor", name: "Link Extractor", description: "Extract all links from a web page and analyze them", icon: Link2, enabled: true },
      { id: "hashtag-tracker", name: "Hashtag Tracker", description: "Track a hashtag across social platforms", icon: Hash, enabled: true },
      { id: "archive-search", name: "Archive Search", description: "Search deleted content across archive services", icon: Bookmark, enabled: true },
    ],
  },
  {
    label: "Crypto & Finance",
    tools: [
      { id: "crypto-wallet", name: "Crypto Wallet", description: "Look up a blockchain wallet address and transaction history", icon: Bitcoin, enabled: true },
      { id: "transaction-tracer", name: "Transaction Tracer", description: "Trace cryptocurrency transactions across the blockchain", icon: Activity, enabled: true },
    ],
  },
  {
    label: "Developer",
    tools: [
      { id: "tech-detector", name: "Tech Detector", description: "Identify technologies powering any website", icon: Code, enabled: true },
      { id: "api-explorer", name: "API Explorer", description: "Discover and test public APIs for any service", icon: Database, enabled: true },
      { id: "github-search", name: "Code Search", description: "Search for code, repos, and developer profiles", icon: FileSearch, enabled: true },
      { id: "dns-history", name: "DNS History", description: "View historical DNS records for a domain", icon: Calendar, enabled: true },
    ],
  },
];

export const ALL_TOOLS: ToolDef[] = TOOL_GROUPS.flatMap((g) => g.tools);
export const ENABLED_COUNT = ALL_TOOLS.filter((t) => t.enabled).length;
export const TOTAL_COUNT = ALL_TOOLS.length;
