import React from 'react';
import { 
  Trash2, Mail, Info, Clock, CheckCircle, Ticket
} from 'lucide-react';
import axios from 'axios';

const AdminSupportTickets = React.memo(({ 
  data, formState, handlers, API, userProfile, getConfig, toast, safeGet, isManager
}) => {
  const { supportTickets } = data || {};
  const { fetchData, confirmAction, showMsg } = handlers || {};
  
  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(supportTickets || []).map(ticket => (
            <div key={ticket.id} className="bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 p-8 rounded-[2.5rem] relative group hover:border-emerald-500/50 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                  <Ticket size={24} />
                </div>
                <button onClick={() => confirmAction('Resolve & Delete Ticket?', async () => { 
                  try {
                    await axios.delete(`${API}/support/${ticket.id}`, getConfig()); 
                    fetchData(); 
                    showMsg('Ticket Resolved & Removed'); 
                  } catch (err) {
                    toast.error('Failed to remove ticket');
                  }
                })} className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 opacity-0 group-hover:opacity-100 transition-all" title="Resolve & Delete">
                  <CheckCircle size={18} />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mb-1">{ticket.name || 'Anonymous User'}</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
                  <Mail size={12} className="text-emerald-400" /> {ticket.email}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  {ticket.issue}
                </p>
              </div>
              
              <div className="pt-6 border-t border-slate-800/50 flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <Clock size={12} /> {new Date(parseInt(ticket.createdAt || Date.now())).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(!supportTickets || supportTickets.length === 0) && (
            <div className="col-span-full py-32 text-center bg-slate-900/10 rounded-[3rem] border border-dashed border-slate-800/50">
              <Ticket size={48} className="mx-auto text-slate-800 mb-6" />
              <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No Active Support Tickets</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default AdminSupportTickets;
