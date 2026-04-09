/**
 * CompanyLogo — renders a professional Lucide SVG icon for a given company name.
 * Use this instead of emoji logos throughout the app.
 */
import React from 'react';
import {
  Music, ShoppingCart, Globe, BarChart3, Zap, Car,
  Code2, Film, Search, Brain, Landmark, FileText,
  Building2, Play, Share2, Home, UtensilsCrossed, Smartphone,
  Server, Database, Layers, Shield, Cpu,
} from 'lucide-react';

const iconMap = {
  Spotify:              Music,
  Amazon:               ShoppingCart,
  'Apple India':        Globe,
  Apple:                Globe,
  HubSpot:              BarChart3,
  ISRO:                 Zap,
  Lyft:                 Car,
  Microsoft:            Code2,
  Adobe:                Film,
  Google:               Search,
  OpenAI:               Brain,
  'State Bank of India': Landmark,
  'Indian Railways':    Landmark,
  Notion:               FileText,
  Tesla:                Zap,
  Netflix:              Play,
  Meta:                 Share2,
  Airbnb:               Home,
  Swiggy:               UtensilsCrossed,
  PhonePe:              Smartphone,
  Infosys:              Server,
  TCS:                  Database,
  Wipro:                Layers,
  Concentrix:           Shield,
  Accenture:            Cpu,
};

export const CompanyLogo = ({ company, color, size = 20 }) => {
  const IconComp = iconMap[company] || Building2;
  return <IconComp size={size} strokeWidth={1.5} style={{ color }} />;
};

export default CompanyLogo;
