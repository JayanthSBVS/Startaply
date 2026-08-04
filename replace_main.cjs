const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const mainStartStr = '<main className="p-4 md:p-8">';
const mainEndStr = '</main>';

const mainStart = content.indexOf(mainStartStr);
const mainEnd = content.indexOf(mainEndStr) + mainEndStr.length;

if (mainStart === -1 || mainEnd === -1) {
  console.log('Could not find <main>');
  process.exit(1);
}

const beforeMain = content.slice(0, mainStart + mainStartStr.length);
const afterMain = content.slice(mainEnd);

const imports = `import AdminDashboardTab from '../components/admin/AdminDashboardTab';
import AdminJobForm from '../components/admin/AdminJobForm';
import AdminManageJobs from '../components/admin/AdminManageJobs';
import AdminApplications from '../components/admin/AdminApplications';
import AdminCompanies from '../components/admin/AdminCompanies';
import AdminJobMela from '../components/admin/AdminJobMela';
import AdminPrepData from '../components/admin/AdminPrepData';
import AdminTestimonials from '../components/admin/AdminTestimonials';
import AdminCollabs from '../components/admin/AdminCollabs';
import AdminFeedback from '../components/admin/AdminFeedback';
import AdminLiveTicker from '../components/admin/AdminLiveTicker';
import AdminHeroBanners from '../components/admin/AdminHeroBanners';
import AdminTeamManagement from '../components/admin/AdminTeamManagement';
import AdminPermissions from '../components/admin/AdminPermissions';
import AdminActivityLogs from '../components/admin/AdminActivityLogs';
import AdminGlobalStats from '../components/admin/AdminGlobalStats';
`;

// we need to inject the imports at the top
let finalContent = imports + '\n' + beforeMain;

const mainContent = `
          {activeTab === 'dashboard' && (
            <AdminDashboardTab 
              dashboardSummary={dashboardSummary} jobs={jobs} applications={applications}
              companies={companies} melas={melas} isManager={isManager} globalStats={globalStats}
              logs={logs} admins={admins} isMobileMenuOpen={isMobileMenuOpen}
            />
          )}

          {activeTab === 'add' && (
            <AdminJobForm 
              jobForm={jobForm} setJobForm={setJobForm} editingJobId={editingJobId}
              companySearch={companySearch} setCompanySearch={setCompanySearch}
              showCompanyList={showCompanyList} setShowCompanyList={setShowCompanyList}
              companies={companies} setIsCompanyModalOpen={setIsCompanyModalOpen}
              handleJobSubmit={handleJobSubmit}
            />
          )}

          {activeTab === 'manage' && (
            <AdminManageJobs 
              jobs={jobs} setJobForm={setJobForm} setEditingJobId={setEditingJobId}
              setActiveTab={setActiveTab} handleJobDelete={handleJobDelete}
            />
          )}

          {activeTab === 'applications' && (
            <AdminApplications 
              applications={applications} confirmAction={confirmAction}
              fetchData={fetchData} showMsg={showMsg} getConfig={getConfig}
            />
          )}

          {activeTab === 'companies' && (
            <AdminCompanies 
              companies={companies} companyForm={companyForm} setCompanyForm={setCompanyForm}
              getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
              confirmAction={confirmAction} handleImageCompression={compressImage} API={API}
            />
          )}

          {activeTab === 'jobmela' && (
            <AdminJobMela 
              melas={melas} melaForm={melaForm} setMelaForm={setMelaForm}
              getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
              confirmAction={confirmAction} handleImageCompression={compressImage} API={API}
            />
          )}

          {activeTab === 'prep' && (
            <AdminPrepData 
              prepData={prepData} prepForm={prepForm} setPrepForm={setPrepForm}
              getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
              confirmAction={confirmAction} API={API}
            />
          )}

          {activeTab === 'testimonials' && (
            <AdminTestimonials 
              testimonials={testimonials} testimonialForm={testimonialForm} setTestimonialForm={setTestimonialForm}
              getConfig={getConfig} fetchData={fetchData} showMsg={showMsg}
              confirmAction={confirmAction} handleImageCompression={compressImage} API={API}
            />
          )}

          {activeTab === 'collabs' && (
            <AdminCollabs 
              data={{ collabRequests }}
              formState={{}}
              handlers={{}}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}

          {activeTab === 'feedback' && (
            <AdminFeedback 
              data={{ feedbacks }}
              formState={{}}
              handlers={{ fetchData, confirmAction }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}

          {activeTab === 'liveticker' && (
            <AdminLiveTicker 
              data={{ liveTickerItems }}
              formState={{ tickerForm, setTickerForm }}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}

          {activeTab === 'herobanners' && (
            <AdminHeroBanners 
              data={{ heroBanners }}
              formState={{}}
              handlers={{ fetchData, confirmAction, showMsg, handleImageCompression: compressImage }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}

          {activeTab === 'logs' && isManager() && (
            <AdminActivityLogs 
              data={{ logs }}
              formState={{}}
              handlers={{}}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}

          {activeTab === 'team' && isManager() && (
            <AdminTeamManagement 
              data={{ admins }}
              formState={{ teamForm, setTeamForm, showTeamModal, setShowTeamModal }}
              handlers={{ fetchData, confirmAction, showMsg }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}

          {activeTab === 'permissions' && isManager() && (
            <AdminPermissions 
              data={{ ROLE_CONFIG, permissions }}
              formState={{ permForm, setPermForm, permSaving, setPermSaving, permSeeded, setPermSeeded }}
              handlers={{ fetchData, showMsg, refreshPermissions }}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}

          {activeTab === 'global_stats' && isManager() && (
            <AdminGlobalStats 
              data={{ globalStats }}
              formState={{}}
              handlers={{}}
              API={API} userProfile={user} getConfig={getConfig} toast={toast} safeGet={null} isManager={isManager}
            />
          )}
`;

finalContent += mainContent + afterMain;
fs.writeFileSync('src/pages/AdminDashboard.jsx', finalContent);
console.log('AdminDashboard.jsx refactored successfully.');
