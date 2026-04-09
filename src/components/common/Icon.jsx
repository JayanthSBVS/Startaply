/**
 * Central icon resolver — maps iconName strings to Lucide components.
 * All icons are professional SVG icons from lucide-react.
 */
import {
  Landmark, Building2, Settings2, GraduationCap,
  Search, Code2, ShoppingCart, Globe, Share2, Play, Music, Brain, Zap, Home,
  Calculator, Users, Terminal, MapPin, DollarSign, Clock, Bookmark,
  Filter, ChevronDown, ArrowRight, Plus, Check, X, Star,
  Briefcase, Award, TrendingUp, BarChart3, FileText, Shield,
  Loader2, ChevronUp, Layers, LayoutGrid, SlidersHorizontal,
  MessageCircle, Send, Cpu, Car, Film,
} from 'lucide-react';

const iconMap = {
  Landmark, Building2, Settings2, GraduationCap,
  Search, Code2, ShoppingCart, Globe, Share2, Play, Music, Brain, Zap, Home,
  Calculator, Users, Terminal, MapPin, DollarSign, Clock, Bookmark,
  Filter, ChevronDown, ArrowRight, Plus, Check, X, Star,
  Briefcase, Award, TrendingUp, BarChart3, FileText, Shield,
  Loader2, ChevronUp, Layers, LayoutGrid, SlidersHorizontal,
  MessageCircle, Send, Cpu, Car, Film,
};

export const Icon = ({ name, size = 18, strokeWidth = 1.75, className = '', style = {} }) => {
  const LucideIcon = iconMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} style={style} />;
};

export default Icon;
