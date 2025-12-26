
import React from 'react';
import { Account } from '../types';

interface AccountManagementProps {
  lang: 'tr' | 'en';
  accounts: Account[];
  onAddAccount: (acc: Account) => void;
}

const AccountManagement: React.FC<AccountManagementProps> = ({ lang, accounts }) => {
  const t = {
    tr: {
      title: 'Hesap Yönetimi',
      sub: 'Üst düzey tenant hesaplarını ve kurumsal yapılandırmaları yönetin.',
      newBtn: 'YENİ HESAP OLUŞTUR',
      total: 'Toplam Hesap',
      active: 'Aktif',
      trial: 'Deneme',
      pending: 'Bekleyen',
      colName: 'HESAP ADI',
      colId: 'HESAP ID',
      colContact: 'BİRİNCİL İLETİŞİM',
      colStatus: 'DURUM',
      colActions: 'İŞLEMLER'
    },
    en: {
      title: 'Account Management',
      sub: 'Manage top-level tenant accounts and enterprise configurations.',
      newBtn: 'CREATE NEW ACCOUNT',
      total: 'Total Accounts',
      active: 'Active',
      trial: 'Trial',
      pending: 'Pending',
      colName: 'ACCOUNT NAME',
      colId: 'ACCOUNT ID',
      colContact: 'PRIMARY CONTACT',
      colStatus: 'STATUS',
      colActions: 'ACTIONS'
    }
  }[lang];

  const mockAccounts: Account[] = [
    { id: 'AC-88219', name: 'Acme Corp AI', plan: 'Enterprise', status: 'Active', primaryContact: 'Sarah Johnson', contactEmail: 'admin@acme.com', deptCount: 4, createdAt: 'Oct 24, 2023' },
    { id: 'AC-99402', name: 'Neural Tech Inc.', plan: 'Standard', status: 'Trial', primaryContact: 'David Chen', contactEmail: 'd.chen@neural.io', deptCount: 1, createdAt: 'Nov 02, 2023' },
    { id: 'AC-11204', name: 'Global Systems', plan: 'Enterprise', status: 'Suspended', primaryContact: 'Marcus Wei', contactEmail: 'm.wei@globalsys.com', deptCount: 8, createdAt: 'Jun 15, 2023' },
  ];

  const displayAccounts = accounts.length > 0 ? accounts : mockAccounts;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{t.title}</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.sub}</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span> {t.newBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: t.total, val: '1,248', icon: 'domain', color: 'blue' },
           { label: t.active, val: '1,100', icon: 'check_circle', color: 'emerald' },
           { label: t.trial, val: '140', icon: 'experiment', color: 'amber' },
           { label: t.pending, val: '8', icon: 'pending', color: 'rose' }
         ].map((stat, i) => (
           <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                 <div className={`p-1.5 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}><span className="material-symbols-outlined text-[18px]">{stat.icon}</span></div>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
           </div>
         ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
           <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold w-64 focus:ring-2 focus:ring-blue-600/5 outline-none transition-all" placeholder="Ara..." />
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><span className="material-symbols-outlined">filter_list</span></button>
              <button className="p-2 text-slate-400 hover:text-slate-900 transition-all"><span className="material-symbols-outlined">download</span></button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colName}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colId}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colContact}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colStatus}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[11px] border border-blue-100">{acc.name.slice(0, 2).toUpperCase()}</div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[12px] font-black text-slate-900">{acc.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{acc.plan} Plan</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[10px] text-slate-500">{acc.id}</td>
                  <td className="p-4 leading-tight">
                    <span className="text-[11px] font-bold text-slate-800 block">{acc.primaryContact}</span>
                    <span className="text-[10px] text-blue-600 font-medium">{acc.contactEmail}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      acc.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                      acc.status === 'Trial' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="size-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">account_tree</span></button>
                      <button className="size-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                      <button className="size-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
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

export default AccountManagement;
