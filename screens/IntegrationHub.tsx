
import React from 'react';

const IntegrationHub: React.FC = () => {
  const channels = [
    { id: 'web', name: 'Web Widget', icon: 'chat', status: 'Active', desc: 'Sitenizde asistan barındırın.', color: 'blue' },
    { id: 'api', name: 'REST & SDK', icon: 'api', status: 'Live', desc: 'Uygulama içi entegrasyon.', color: 'purple' },
    { id: 'mobile', name: 'Mobile SDK', icon: 'smartphone', status: 'Config', desc: 'iOS/Android native SDK.', color: 'orange' },
    { id: 'slack', name: 'Slack Bot', icon: 'forum', status: 'Off', desc: 'Ekip içi asistan.', color: 'indigo' },
  ];

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Kanal Entegrasyonları</h1>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">Platformlar Arası İletişim Merkezi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {channels.map((ch) => (
           <div key={ch.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group">
              <div className="flex justify-between items-start">
                 <div className={`p-1.5 bg-${ch.color}-50 text-${ch.color}-600 rounded-lg group-hover:scale-105 transition-transform`}><span className="material-symbols-outlined text-[18px]">{ch.icon}</span></div>
                 <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${ch.status === 'Off' ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{ch.status}</span>
              </div>
              <div>
                 <h3 className="text-xs font-black text-slate-900 leading-tight mb-0.5">{ch.name}</h3>
                 <p className="text-[9px] font-medium text-slate-500 leading-relaxed line-clamp-2">{ch.desc}</p>
              </div>
              <div className="flex gap-1.5 mt-1">
                 <button className="flex-1 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 font-black text-[8px] uppercase rounded-lg hover:bg-slate-100 transition-all">YÖNET</button>
                 <button className={`flex-1 py-1.5 ${ch.id === 'api' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-900'} font-black text-[8px] uppercase rounded-lg shadow-sm active:scale-95`}>{ch.id === 'api' ? 'API KEY' : 'TEST'}</button>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group border border-white/5">
         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10 opacity-30"></div>
         <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
               <div className="size-8 bg-white/10 rounded-lg flex items-center justify-center text-blue-400"><span className="material-symbols-outlined text-[18px]">hub</span></div>
               <div>
                  <h4 className="text-xs font-black tracking-tight leading-none mb-1 uppercase">Sistem Entegrasyon Sağlığı</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Tüm Bağlantılar Aktif (Global Health 100%)</p>
               </div>
            </div>
            <button className="px-4 py-2 bg-white text-slate-900 font-black text-[8px] uppercase rounded-lg hover:bg-slate-100 transition-all shadow-md active:scale-95">LOGLARI GÖRÜNTÜLE</button>
         </div>
      </div>
    </div>
  );
};

export default IntegrationHub;
