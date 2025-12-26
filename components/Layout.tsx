
import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

interface LayoutProps {
  lang: 'tr' | 'en';
  onLangChange: (lang: 'tr' | 'en') => void;
  onReset: () => void;
}

const Layout: React.FC<LayoutProps> = ({ lang, onLangChange, onReset }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const t = {
    tr: {
      dashboard: 'Kontrol Paneli',
      accounts: 'Hesap Yönetimi',
      departments: 'Departmanlar',
      users: 'Kullanıcılar',
      botFactory: 'Bot Fabrikası',
      knowledgeBanks: 'Bilgi Bankaları',
      dataEntry: 'Veri Girişi',
      scriptLibrary: 'Script Kütüphanesi',
      taxonomy: 'Taksonomi (UAE)',
      analysis: 'Analiz & Test',
      escalation: 'Eskalasyon',
      integrations: 'Entegrasyonlar',
      settings: 'Sistem Ayarları',
      resetSystem: 'Sistemi Sıfırla',
      searchPlaceholder: 'Ara...',
      enterprisePlan: 'Kurumsal Yönetici',
      platformSub: 'AI Enterprise Hub'
    },
    en: {
      dashboard: 'Dashboard',
      accounts: 'Accounts',
      departments: 'Departments',
      users: 'User Management',
      botFactory: 'Bot Factory',
      knowledgeBanks: 'Knowledge Banks',
      dataEntry: 'Data Entry',
      scriptLibrary: 'Script Library',
      taxonomy: 'Taxonomy (UAE)',
      analysis: 'Analysis & Test',
      escalation: 'Escalation',
      integrations: 'Integrations',
      settings: 'System Settings',
      resetSystem: 'Reset System',
      searchPlaceholder: 'Search...',
      enterprisePlan: 'Global Admin',
      platformSub: 'AI Enterprise Hub'
    }
  }[lang];

  const menuItems = [
    { path: '/', label: t.dashboard, icon: 'dashboard' },
    { path: '/accounts', label: t.accounts, icon: 'admin_panel_settings' },
    { path: '/departments', label: t.departments, icon: 'account_tree' },
    { path: '/users', label: t.users, icon: 'group' },
    { path: '/bot-factory', label: t.botFactory, icon: 'precision_manufacturing' },
    { path: '/knowledge-banks', label: t.knowledgeBanks, icon: 'database' },
    { path: '/data-sources', label: t.dataEntry, icon: 'folder_shared' },
    { path: '/taxonomy', label: t.taxonomy, icon: 'hub' },
    { path: '/agent-logs', label: t.analysis, icon: 'assignment' },
    { path: '/escalation-rules', label: t.escalation, icon: 'warning' },
    { path: '/system-settings', label: t.settings, icon: 'settings' },
  ];

  const logoUrl = "https://storage.googleapis.com/static.infoset.app/logo/infoset-logo-chatbot.png";

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden text-slate-800 font-sans text-sm">
      <aside className={`${isCollapsed ? 'w-16' : 'w-60'} flex flex-col border-r border-slate-200 bg-white shrink-0 z-20 transition-all duration-300 relative shadow-sm`}>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 size-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm z-30 transition-transform"
        >
          <span className="material-symbols-outlined text-[14px]">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>

        <div className="p-4 border-b border-slate-50 h-16 flex items-center overflow-hidden shrink-0">
          <div className="flex items-center gap-2">
            <img 
              src={logoUrl} 
              className="h-7 w-auto object-contain" 
              alt="Logo" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <h1 className="text-slate-900 text-xs font-black leading-none truncate uppercase tracking-tight">Infoset AI</h1>
                <p className="text-slate-400 text-[7px] font-bold uppercase tracking-widest mt-0.5">{t.platformSub}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                  (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path))
                    ? 'bg-blue-600 text-white shadow-sm font-bold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {!isCollapsed && <span className="text-[12px] font-semibold truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-100 mt-auto">
          <div onClick={onReset} className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-all cursor-pointer group">
            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 text-[9px] font-black group-hover:bg-red-500 group-hover:text-white shrink-0">AU</div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-none">
                <p className="text-slate-900 text-[11px] font-black truncate group-hover:text-red-600">Global Admin</p>
                <p className="text-slate-400 text-[8px] truncate font-bold uppercase mt-1">{t.resetSystem}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between border-b border-slate-200 px-6 bg-white shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input className="block w-64 p-1.5 pl-9 text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none" placeholder={t.searchPlaceholder} type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
               <button onClick={() => onLangChange('tr')} className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${lang === 'tr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>TR</button>
               <button onClick={() => onLangChange('en')} className={`px-2.5 py-1 rounded text-[10px] font-black transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>EN</button>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
               <div className="flex flex-col items-end leading-none">
                  <p className="text-[11px] font-black text-slate-900">James Admin</p>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5">{t.enterprisePlan}</p>
               </div>
               <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
