const fs = require('fs');
const files = [
  'AdminLiveTicker.jsx',
  'AdminGlobalStats.jsx',
  'AdminActivityLogs.jsx',
  'AdminTeamManagement.jsx',
  'AdminPermissions.jsx',
  'AdminHeroBanners.jsx',
  'AdminFeedback.jsx'
];
files.forEach(f => {
  let c = fs.readFileSync('src/components/admin/' + f, 'utf8');
  c = c.replace(/\s*}\)\s*<\/>/g, '\n    </>'); 
  c = c.replace(/\s*}\)\n<\/>/g, '\n    </>');
  // Sometimes it's just ')}' right before '</>'
  c = c.replace(/\)}\s*<\/>/g, '\n    </>');
  // Check for lingering activeTab closure if any
  fs.writeFileSync('src/components/admin/' + f, c);
});

let sb = fs.readFileSync('src/components/admin/AdminSidebar.jsx', 'utf8');
sb = sb.replace('../components/common/ThemeToggle', '../common/ThemeToggle');
fs.writeFileSync('src/components/admin/AdminSidebar.jsx', sb);

console.log('Fixed syntax in tabs and sidebar');
