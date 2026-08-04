const fs = require('fs');
let c = fs.readFileSync('src/components/admin/AdminSidebar.jsx', 'utf8');
c = c.replace(/import {[\s\S]*?} from 'lucide-react';/, "import { X, LayoutDashboard, PlusCircle, Briefcase, FileText, Building2, MapPin, BookOpen, MessageSquareQuote, Handshake, MessageSquare, Users2, Sliders, History, BarChart3, Image as ImageIcon, Zap, LogOut } from 'lucide-react';");
c = c.replace(/\];\\n  return \(/, '];\n  return ('); // replace literal \n
fs.writeFileSync('src/components/admin/AdminSidebar.jsx', c);
console.log('Fixed AdminSidebar syntax');
