const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const modalStart = content.indexOf('{isCompanyModalOpen && (');
const modalEnd = content.indexOf(')}', content.lastIndexOf('</motion.div>')) + 2;

const modalContent = content.slice(modalStart, modalEnd);

const modalCode = `import React from 'react';
import { Building2, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { inputCls, selectCls } from './adminConstants';
import axios from 'axios';
import { compressImage } from '../../utils/imageCompression';
import { toast } from 'react-hot-toast';

const AdminCompanyModal = ({
  companyForm, setCompanyForm, setIsCompanyModalOpen, setJobForm,
  jobForm, setCompanySearch, fetchData, showMsg, getConfig, API
}) => {
  return (
    ${modalContent.replace('{isCompanyModalOpen && (', '').slice(0, -2)}
  );
};

export default AdminCompanyModal;
`;

fs.writeFileSync('src/components/admin/AdminCompanyModal.jsx', modalCode);

const newDashboardContent = content.slice(0, modalStart) + `
      {isCompanyModalOpen && (
        <AdminCompanyModal 
          companyForm={companyForm} setCompanyForm={setCompanyForm}
          setIsCompanyModalOpen={setIsCompanyModalOpen} setJobForm={setJobForm}
          jobForm={jobForm} setCompanySearch={setCompanySearch}
          fetchData={fetchData} showMsg={showMsg} getConfig={getConfig} API={API}
        />
      )}
` + content.slice(modalEnd);

fs.writeFileSync('src/pages/AdminDashboard.jsx', `import AdminCompanyModal from '../components/admin/AdminCompanyModal';\n` + newDashboardContent);
console.log('Modal extracted');
