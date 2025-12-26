
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KnowledgeBank, Script, AgentLog } from '../types';

interface DashboardProps {
  lang: 'tr' | 'en';
  activeModel: string;
  onModelChange: (model: string) => void;
  knowledgeBanks: KnowledgeBank[];
  scripts: Script[];
  agentLogs: AgentLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ lang, activeModel, onModelChange, knowledgeBanks, scripts, agentLogs }) => {
  const navigate = useNavigate();
  const [whatIfView, setWhatIfView] = useState<'Cost' | 'Performance'>('Cost');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = {
    tr: {
      title: 'KONTROL PANELİ',
      sub: 'Sistem Durumu',
      activeModelLabel: 'AKTİF MODEL',
      cost: 'Oturum Maliyeti',
      kb: 'Bilgi Bankaları',
      activeKb: 'Aktif Banka',
      success: 'Başarı Oranı',
      latency: 'Ort. Gecikme',
      performance: 'Performans',
      execTime: 'Süre (ms)',
      last7: 'SON 7 GÜN',
      projection: 'MODEL PROJEKSİYONU',
      stratActions: 'HIZLI İŞLEMLER',
      newKb: 'YENİ BANKA',
      dataEntry: 'VERİ GİRİŞİ',
      botProd: 'BOT ÜRET',
      consist: 'GÜVENLİK',
      sysHealth: 'SİSTEM SAĞLIĞI',
      status: 'DURUM',
      stable: 'STABİL',
      critical: 'KRİTİK VAKALAR',
      urgentCase: 'ACİL',
      review: 'İNCELE',
      clean: 'VERİ AKIŞI TEMİZ',
      baseline: 'Referans',
      verified: 'Onaylı'
    },
    en: {
      title: 'DASHBOARD',
      sub: 'System Overview',
      activeModelLabel: 'ACTIVE MODEL',
      cost: 'Session Cost',
      kb: 'Knowledge Banks',
      activeKb: 'Active Banks',
      success: 'Success Rate',
      latency: 'Avg. Latency',
      performance: 'Performance',
      execTime: 'Time (ms)',
      last7: 'LAST 7 DAYS',
      projection: 'MODEL PROJECTION',
      stratActions: 'QUICK ACTIONS',
      newKb: 'NEW BANK',
      dataEntry: 'DATA ENTRY',
      botProd: 'CREATE BOT',
      consist: 'SECURITY',
      sysHealth: 'SYSTEM HEALTH',
      status: 'STATUS',
      stable: 'STABLE',
      critical: 'CRITICAL CASES',
      urgentCase: 'URGENT',
      review: 'REVIEW',
      clean: 'CLEAN FLOW',
      baseline: 'Baseline',
      verified: 'Verified'
    }
  }[lang];

  const modelMetadata: Record<string, { name: string; costPerMillion: number; qualityScore: number; speedScore: number; color: string }> = {
    'gemini-3-flash-preview': { name: 'GEMINI 3 FLASH', costPerMillion: 0.075, qualityScore: 70, speedScore: 95, color: '#1677ff' },
    'gemini-3-pro-preview': { name: 'GEMINI 3 PRO', costPerMillion: 3.50, qualityScore: 95, speedScore: 60, color: '#722ed1' },
    'gemini-flash-lite-latest': { name: 'GEMINI FLASH LITE', costPerMillion: 0.015, qualityScore: 50, speedScore: 100, color: '#52c41a' },
  };

  const activeModelMeta = modelMetadata[activeModel] || modelMetadata['gemini-3-flash-preview'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    const promptTokens = agentLogs.reduce((acc, log) => acc + (log.tokenUsage?.prompt || 0), 0);
    const completionTokens = agentLogs.reduce((acc, log) => acc + (log.tokenUsage?.completion || 0), 0);
    const totalTokens = promptTokens + completionTokens;
    const currentCost = (totalTokens / 1000000) * activeModelMeta.costPerMillion; 
    const verifiedLogs = agentLogs.filter(l => l.status === 'VERIFIED').length;
    const successRate = agentLogs.length > 0 ? (verifiedLogs / agentLogs.length * 100).toFixed(0) : "100";
    const avgLatency = agentLogs.length > 0 ? Math.round(agentLogs.reduce((acc, l) => acc + (l.durationMs || 0), 0) / agentLogs.length) : 0;
    return { currentCost, successRate, avgLatency };
  }, [agentLogs, activeModelMeta]);

  const criticalLogs = agentLogs.filter(log => log.status === 'LOW_CONFIDENCE' || log.sentiment === 'Urgent').slice(0, 5);

  const getModelProjection = (targetModel: string) => {
    const targetMeta = modelMetadata[targetModel];
    if (!targetMeta) return { cost: 0, factor: 0 };
    const projectedCost = (agentLogs.length * 1000 / 1000000) * targetMeta.costPerMillion * 30; 
    const factor = ((targetMeta.costPerMillion - activeModelMeta.costPerMillion) / activeModelMeta.costPerMillion) * 100;
    return { cost: projectedCost, factor };
  };

  const chartPoints = useMemo(() => {
    if (agentLogs.length < 2) return "M0,60 L400,60";
    const points = agentLogs.slice(-7).map((log, i) => {
      const x = (i / 6) * 400;
      const y = 80 - (Math.min(log.durationMs || 500, 2000) / 2000) * 60;
      return `${x},${y}`;
    });
    return `M${points.join(' L')}`;
  }, [agentLogs]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t.title}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.sub}</p>
        </div>
        
        <div className="relative" ref={dropdownRef}>
           <button onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-blue-600 transition-all min-w-[200px]">
              <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><span className="material-symbols-outlined text-[18px] fill">settings_input_component</span></div>
              <div className="flex flex-col items-start text-left leading-none">
                 <span className="text-[8px] font-black text-slate-400 uppercase mb-1">{t.activeModelLabel}</span>
                 <div className="flex items-center gap-1"><span className="text-[11px] font-black text-slate-900 uppercase">{activeModelMeta.name}</span><span className="material-symbols-outlined text-[14px]">expand_more</span></div>
              </div>
           </button>
           {isModelDropdownOpen && (
             <div className="absolute right-0 top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-1.5 space-y-1">
                   {Object.entries(modelMetadata).map(([key, meta]) => (
                     <button key={key} onClick={() => { onModelChange(key); setIsModelDropdownOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${activeModel === key ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                       <div className="flex items-center gap-3"><div className="size-2 rounded-full" style={{ backgroundColor: meta.color }}></div><span className="text-[10px] font-black uppercase">{meta.name}</span></div>
                       {activeModel === key && <span className="material-symbols-outlined text-[14px]">check</span>}
                     </button>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: t.cost, val: `$${stats.currentCost.toFixed(4)}`, unit: 'USD', icon: 'payments', color: 'blue' },
             { label: t.kb, val: knowledgeBanks.length, unit: t.activeKb, icon: 'layers', color: 'purple' },
             { label: t.success, val: `%${stats.successRate}`, unit: t.verified, icon: 'verified_user', color: 'emerald' },
             { label: t.latency, val: `${stats.avgLatency}ms`, unit: 'Latency', icon: 'speed', color: 'amber' }
           ].map((kpi, idx) => (
             <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className={`size-10 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center shrink-0`}><span className={`material-symbols-outlined text-[20px] text-${kpi.color}-500`}>{kpi.icon}</span></div>
                <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                   <div className="flex items-baseline gap-1.5 leading-none mt-1"><span className="text-lg font-black text-slate-900 tracking-tight">{kpi.val}</span><span className="text-[8px] font-bold text-slate-400 uppercase">{kpi.unit}</span></div>
                </div>
             </div>
           ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col min-h-[300px]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-blue-600 text-[18px]">insights</span> {t.performance}</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 uppercase"><span className="size-2 rounded-full bg-blue-600"></span> {t.execTime}</div>
                 <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{t.last7}</span>
              </div>
           </div>
           <div className="flex-1 relative">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                 <path d={`${chartPoints} L400,100 L0,100 Z`} fill="rgba(37,99,235,0.03)"></path>
                 <path d={chartPoints} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeJoin="round"></path>
              </svg>
              <div className="absolute bottom-0 w-full flex justify-between text-[9px] font-bold text-slate-300 uppercase">
                 <span>{lang === 'tr' ? 'PZT' : 'MON'}</span>
                 <span>{lang === 'tr' ? 'SAL' : 'TUE'}</span>
                 <span>{lang === 'tr' ? 'ÇAR' : 'WED'}</span>
                 <span>{lang === 'tr' ? 'PER' : 'THU'}</span>
                 <span>{lang === 'tr' ? 'CUM' : 'FRI'}</span>
                 <span>{lang === 'tr' ? 'CMT' : 'SAT'}</span>
                 <span>{lang === 'tr' ? 'PAZ' : 'SUN'}</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t.projection}</h3>
              <div className="flex bg-slate-100 rounded-lg p-0.5 text-[8px] font-black uppercase">
                 <button onClick={() => setWhatIfView('Cost')} className={`px-3 py-1 rounded transition-all ${whatIfView === 'Cost' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Cost</button>
                 <button onClick={() => setWhatIfView('Performance')} className={`px-3 py-1 rounded transition-all ${whatIfView === 'Performance' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>IQ</button>
              </div>
           </div>
           <div className="flex-1 space-y-3">
              {Object.entries(modelMetadata).map(([key, meta]) => {
                 const proj = getModelProjection(key);
                 const isCurrent = key === activeModel;
                 return (
                   <div key={key} className={`border p-3 rounded-xl flex items-center justify-between ${isCurrent ? 'bg-blue-50 border-blue-100' : 'border-slate-50'}`}>
                      <div className="leading-tight">
                         <p className="text-[8px] font-black text-slate-400 uppercase">{meta.name}</p>
                         <div className="text-[11px] font-black text-slate-900">{whatIfView === 'Cost' ? `$${proj.cost.toFixed(1)}/mo` : `%${meta.qualityScore} Quality`}</div>
                      </div>
                      <div className="text-right">
                         {isCurrent ? <span className="text-[7px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase">{t.baseline}</span> : <span className={`text-[9px] font-black uppercase ${proj.factor > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{proj.factor > 0 ? '+' : ''}{Math.round(proj.factor)}%</span>}
                      </div>
                   </div>
                 );
              })}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
           <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">emergency</span> {t.critical}</h3>
              <span className="text-[9px] font-black text-slate-400 uppercase">{criticalLogs.length} {t.urgentCase}</span>
           </div>
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left">
                 <tbody className="divide-y divide-slate-50">
                    {criticalLogs.map(log => (
                       <tr key={log.id} onClick={() => navigate(`/agent-logs?logId=${log.id}`)} className="hover:bg-red-50/10 transition-all cursor-pointer">
                          <td className="px-4 py-3">
                             <div className="text-[10px] font-black text-slate-900 uppercase truncate">CASE-{log.id.slice(-6)}</div>
                             <div className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{log.intent}</div>
                          </td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-2">
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${log.confidence * 100}%` }}></div></div>
                                <span className="text-[9px] font-black text-red-600">%{Math.round(log.confidence * 100)}</span>
                             </div>
                          </td>
                          <td className="px-4 py-3 text-right"><span className="text-[9px] font-black text-blue-600 uppercase hover:underline">{t.review}</span></td>
                       </tr>
                    ))}
                    {criticalLogs.length === 0 && (
                       <tr><td colSpan={3} className="py-20 text-center text-[10px] font-black text-slate-200 uppercase tracking-widest">{t.clean}</td></tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-center gap-3">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">{t.stratActions}</h3>
           <button onClick={() => navigate('/knowledge-banks')} className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95 group leading-none"><span className="material-symbols-outlined text-[20px] fill">layers</span><span className="text-[10px] font-black uppercase">{t.newKb}</span></button>
           <button onClick={() => navigate('/data-sources')} className="w-full flex items-center gap-3 p-3 bg-slate-50 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all leading-none"><span className="material-symbols-outlined text-[20px]">add_circle</span><span className="text-[10px] font-black uppercase">{t.dataEntry}</span></button>
           <button onClick={() => navigate('/bot-factory')} className="w-full flex items-center gap-3 p-3 bg-slate-50 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all leading-none"><span className="material-symbols-outlined text-[20px]">precision_manufacturing</span><span className="text-[10px] font-black uppercase">{t.botProd}</span></button>
        </div>

        <div className="lg:col-span-3 bg-[#111318] rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-lg border border-white/5">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
           <div className="relative z-10">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">{t.consist}</p>
              <h4 className="text-sm font-black uppercase tracking-tight leading-none">{t.sysHealth}</h4>
           </div>
           <div className="space-y-3 relative z-10 mt-6">
              <div className="flex items-center justify-between text-[10px] font-bold"><span className="text-white/40 uppercase">{t.status}</span><span className="text-emerald-400 uppercase tracking-widest">{t.stable}</span></div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: '96%' }}></div></div>
           </div>
        </div>
      </div>

      <footer className="mt-8 shrink-0 flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em] border-t border-slate-100 pt-6">
        <span>INFÖSET AI v5.0</span>
        <span>{lang === 'tr' ? 'SİSTEM AKTİF' : 'CORE ACTIVE'} • {activeModelMeta.name}</span>
      </footer>
    </div>
  );
};

export default Dashboard;
