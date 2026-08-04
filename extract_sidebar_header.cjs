const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const sidebarStartStr = '{/* Sidebar */}';
const sidebarEndStr = '{/* Main Content */}';
const sidebarStart = content.indexOf(sidebarStartStr);
const sidebarEnd = content.indexOf(sidebarEndStr);

const sidebarContent = content.slice(sidebarStart, sidebarEnd);

const sidebarCode = `import React from 'react';
import { X, LogOut, LayoutDashboard, PlusCircle, Briefcase, FileText, Building2, MapPin, BookOpen, MessageSquareQuote, Handshake, MessageSquare, Users2, Sliders, History, BarChart3, Image as ImageIcon, Zap } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const AdminSidebar = ({
  isMobileMenuOpen, setIsMobileMenuOpen, navItems, activeTab, setActiveTab,
  logout, navigate
}) => {
  return (
    ${sidebarContent.replace('{/* Sidebar */}', '')}
  );
};

export default AdminSidebar;
`;

fs.writeFileSync('src/components/admin/AdminSidebar.jsx', sidebarCode);

const headerStartStr = '<header';
const headerEndStr = '</header>';
const headerStart = content.indexOf(headerStartStr);
const headerEnd = content.indexOf(headerEndStr) + headerEndStr.length;

const headerContent = content.slice(headerStart, headerEnd);

const headerCode = `import React from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';

const AdminHeader = ({
  activeTab, setIsMobileMenuOpen, toast, getRoleLabel, user
}) => {
  return (
    ${headerContent}
  );
};

export default AdminHeader;
`;

fs.writeFileSync('src/components/admin/AdminHeader.jsx', headerCode);

// update dashboard
let newContent = content.slice(0, sidebarStart) + `
      <AdminSidebar 
        isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen}
        navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab}
        logout={logout} navigate={navigate}
      />
      
      {/* Main Content */}
` + content.slice(sidebarEnd, headerStart) + `
        <AdminHeader 
          activeTab={activeTab} setIsMobileMenuOpen={setIsMobileMenuOpen}
          toast={toast} getRoleLabel={getRoleLabel} user={user}
        />
` + content.slice(headerEnd);

newContent = `import AdminSidebar from '../components/admin/AdminSidebar';\nimport AdminHeader from '../components/admin/AdminHeader';\n` + newContent;

fs.writeFileSync('src/pages/AdminDashboard.jsx', newContent);
console.log('Sidebar and Header extracted');
