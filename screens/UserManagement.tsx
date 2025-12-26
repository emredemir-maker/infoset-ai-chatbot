
import React from 'react';
import { User, Account, Department } from '../types';

interface UserManagementProps {
  lang: 'tr' | 'en';
  users: User[];
  accounts: Account[];
  departments: Department[];
  onAddUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ lang, users, departments }) => {
  const t = {
    tr: {
      title: 'Kullanıcı & Rol Yönetimi',
      sub: 'Kurumsal kullanıcıları yönetin, roller atayın ve departman erişimlerini düzenleyin.',
      newBtn: 'YENİ KULLANICI EKLE',
      colUser: 'KULLANICI',
      colRole: 'ROL',
      colDepts: 'DEPARTMANLAR',
      colStatus: 'DURUM',
      colLastActive: 'SON AKTİF',
      colActions: 'İŞLEMLER'
    },
    en: {
      title: 'User & Role Management',
      sub: 'Manage enterprise users, assign roles and organize department access.',
      newBtn: 'ADD NEW USER',
      colUser: 'USER',
      colRole: 'ROLE',
      colDepts: 'DEPARTMENTS',
      colStatus: 'STATUS',
      colLastActive: 'LAST ACTIVE',
      colActions: 'ACTIONS'
    }
  }[lang];

  const mockUsers: User[] = [
    { id: '1', accountId: 'AC-88219', departmentIds: [], name: 'Sarah Jenkins', email: 'sarah.j@company.com', role: 'Global Admin', status: 'Active', lastActive: '2 dk önce' },
    { id: '2', accountId: 'AC-88219', departmentIds: ['DEP-001'], name: 'Michael Chen', email: 'm.chen@company.com', role: 'Dept Admin', status: 'Active', lastActive: '1 saat önce' },
    { id: '3', accountId: 'AC-88219', departmentIds: ['DEP-001'], name: 'Emily Davis', email: 'e.davis@company.com', role: 'User', status: 'Offline', lastActive: '2 gün önce' },
  ];

  const displayUsers = users.length > 0 ? users : mockUsers;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{t.title}</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.sub}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span> {lang === 'tr' ? 'CSV DIŞA AKTAR' : 'EXPORT CSV'}
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span> {t.newBtn}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Total Users', val: '142', icon: 'group', color: 'blue' },
           { label: 'Global Admins', val: '3', icon: 'admin_panel_settings', color: 'purple' },
           { label: 'Active Depts', val: '8', icon: 'domain', color: 'orange' },
           { label: 'Active Sessions', val: '89', icon: 'verified_user', color: 'emerald' }
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
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/30 gap-4">
           <div className="relative flex-1 group">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold w-full max-w-md focus:ring-4 focus:ring-blue-600/5 outline-none transition-all shadow-sm" placeholder="İsim, e-posta veya ID ile ara..." />
           </div>
           <div className="flex items-center gap-3">
              <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600/5 transition-all shadow-sm cursor-pointer">
                 <option>Tüm Departmanlar</option>
              </select>
              <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600/5 transition-all shadow-sm cursor-pointer">
                 <option>Tüm Roller</option>
              </select>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colUser}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colRole}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colDepts}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colStatus}</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.colLastActive}</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-[11px] text-slate-600 uppercase">{user.name.slice(0, 2)}</div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[12px] font-black text-slate-900">{user.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                      user.role === 'Global Admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                      user.role === 'Dept Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {user.role === 'Global Admin' ? (
                        <span className="text-[10px] font-bold text-slate-400 italic">Tüm Organizasyon</span>
                      ) : (
                        user.departmentIds.map(id => (
                           <span key={id} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[8px] font-black rounded border border-slate-100 uppercase">{departments.find(d => d.id === id)?.name || id}</span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      <span className="text-[11px] font-bold text-slate-700">{user.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[11px] font-medium text-slate-400 italic">{user.lastActive}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

export default UserManagement;
