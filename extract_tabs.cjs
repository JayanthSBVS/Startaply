const fs = require('fs');

const content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');

const extract = (start, end, compName) => {
  let lines = content.slice(start - 1, end);
  
  // Clean up wrapping condition
  if (lines[0].includes('activeTab ===')) lines.shift();
  if (lines[lines.length - 1].includes(')}')) lines.pop();
  if (lines[lines.length - 1].includes('}')) lines.pop(); // sometimes there are multiple closing braces
  
  const code = `import React from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle, XCircle, Search, Settings, FileText, 
  Users, Briefcase, Calendar, MessageSquare, ArrowRight, Activity, Handshake, 
  Mail, X, Image as ImageIcon, MapPin, DollarSign, Building, AlertCircle, RefreshCw, Eye, MoveUp, MoveDown, Info, Shield, ShieldAlert, Key, Loader, Unlock, UploadCloud, PlayCircle, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { inputCls, selectCls, textareaCls, ROLE_CONFIG } from './adminConstants';
import axios from 'axios';
import { handleImageCompression } from '../../utils/imageCompression';

const ${compName} = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  return (
    <>
${lines.join('\n')}
    </>
  );
});

export default ${compName};
`;
  fs.writeFileSync('src/components/admin/' + compName + '.jsx', code);
};

extract(1369, 1400, 'AdminFeedback');
extract(1401, 1462, 'AdminLiveTicker');
extract(1463, 1526, 'AdminHeroBanners');
extract(1527, 1611, 'AdminActivityLogs');
extract(1612, 1780, 'AdminTeamManagement');
extract(1781, 1914, 'AdminPermissions');
extract(1915, 2098, 'AdminGlobalStats');
extract(2099, 2139, 'AdminCollabs');
console.log('Files generated.');
