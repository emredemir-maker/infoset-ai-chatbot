
import React from 'react';
import { Department, Account, Bot, KnowledgeBank } from '../types';

interface DepartmentManagementProps {
  lang: 'tr' | 'en';
  departments: Department[];
  accounts: Account[];
  bots: Bot[];
  knowledgeBanks: KnowledgeBank[];
  onAddDept: (dept: Department) => void;
}

const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ lang, departments, accounts }) => {
  const t = {
    tr: {
      title: 'Departman Yönetimi',
      sub: 'Departman yapılarını yönetin ve AI kaynaklarını senkronize edin.',
      newBtn: 'YENİ DEPARTMAN',
      colName: 'DEPARTMAN ADI',
      colAdmin: 'YÖNETİCİ',
      colUsers: 'KULLANICI',
      colResources: 'AI KAYNAKLARI',
      colStatus: 'DURUM',
      colActions: 'YÖNET'
    },
    en: {
      title: 'Department Management',
      sub: 'Manage department structures and sync AI resources.',
      newBtn: 'NEW DEPARTMENT',
      colName: 'DEPARTMENT NAME',
      colAdmin: 'ADMIN',
      colUsers: 'USERS',
      colResources: 'AI RESOURCES',
      colStatus: 'STATUS',
      colActions: 'MANAGE'
    }
  }[lang];

  const mockDepts: Department[] = [
    { id: 'DEP-001', accountId: 'AC-88219', name: 'Engineering', adminName: 'Alex Morgan', adminEmail: 'alex.m@acme.com', userCount: 42, status: 'Active', linkedResources: { chatbots: ['DevBot-v2'], knowledgeBases: ['TechDocs'] } },
    { id: 'DEP-004', accountId: 'AC-88219', name: 'Human Resources', adminName: 'Sarah Jenkins', adminEmail: 'sarah.j@acme.com', userCount: 15, status: 'Active', linkedResources: { chatbots: ['HR-Helper'], knowledgeBases: ['Policies-2024'] } },
  ];

  const displayDepts = departments.length > 0 ? departments : mockDepts;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{t.title}</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.sub}</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm cursor-pointer min-w-[200px]">
            <option>Acme Corp (HQ)</option>
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span> {t.newBtn}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Depts', val: '12', icon: 'domain', color: 'blue' },
           { label: 'Active Users', val: '148', icon: 'group', color: 'purple' },
           { label: 'Active Chatbots', val: '24', icon: 'smart_toy', color: 'orange' },
           { label: 'Knowledge Bases', val: '8', icon: 'library_books', color: 'teal' }
         ].map((stat, i) => (
           <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <div className={`p-1.5 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}><span className="material-symbols-outlined text-[16px]">{stat.icon}</span></div>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
           </div>
         ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
           <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold w-64 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all" placeholder="Departmanlarda ara..." />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colName}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colAdmin}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t.colUsers}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colResources}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colStatus}</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayDepts.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 leading-tight">
                    <span className="text-[12px] font-black text-slate-900 block">{dept.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {dept.id}</span>
                  </td>
                  <td className="p-4 leading-tight">
                    <span className="text-[11px] font-bold text-slate-800 block">{dept.adminName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{dept.adminEmail}</span>
                  </td>
                  <td className="p-4 text-center text-[12px] font-black text-slate-900">{dept.userCount}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {dept.linkedResources.chatbots.map(b => (
                        <span key={b} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded-lg border border-blue-100 uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">smart_toy</span> {b}</span>
                      ))}
                      {dept.linkedResources.knowledgeBases.map(kb => (
                        <span key={kb} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[8px] font-black rounded-lg border border-teal-100 uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">database</span> {kb}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      dept.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {dept.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="size-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;
