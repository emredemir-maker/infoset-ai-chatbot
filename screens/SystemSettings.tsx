
import React, { useState, useEffect, useMemo } from 'react';
import { AIProvider } from '../types';

interface SystemSettingsProps {
  activeModel: string;
  onModelChange: (model: string) => void;
  temperature: number;
  onTemperatureChange: (val: number) => void;
  topP: number;
  onTopPChange: (val: number) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ 
  activeModel, onModelChange, 
  temperature, onTemperatureChange, 
  topP, onTopPChange
}) => {
  const [hasKey, setHasKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const availableModels = [
    { id: 'gemini-3-flash-preview', name: 'gemini-3-flash-preview (Önerilen)', desc: 'Yüksek hız ve düşük maliyet için optimize edilmiş Gemini sürümü.' },
    { id: 'gemini-3-pro-preview', name: 'gemini-3-pro-preview', desc: 'Karmaşık görevler ve akıl yürütme için gelişmiş kapasite.' },
    { id: 'gemini-flash-lite-latest', name: 'gemini-flash-lite-latest', desc: 'Hızlı yanıtlar için hafifletilmiş, yüksek verimli model.' }
  ];

  const quotaMap: Record<string, { used: number, total: number, plan: string, project: string }> = {
    'gemini-3-flash-preview': { used: 14600, total: 100000, plan: 'Standard Plan', project: 'Enterprise - Alpha Takımı' },
    'gemini-3-pro-preview': { used: 85400, total: 100000, plan: 'Premium Plan', project: 'Executive - Delta Ops' },
    'gemini-flash-lite-latest': { used: 2100, total: 500000, plan: 'Lite Tier', project: 'Lab - Beta Test' }
  };

  const currentQuota = useMemo(() => quotaMap[activeModel] || quotaMap['gemini-3-flash-preview'], [activeModel]);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    }
  };

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleTestApi = () => {
    setIsTesting(true);
    setTimeout(() => setIsTesting(false), 1200);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-8">
        <h1 className="text-[28px] font-black text-slate-900 tracking-tight uppercase">Sistem Ayarları</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60">Model Yapılandırması ve Global Parametreler</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Model & Keys */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px] fill">settings_input_component</span>
               </div>
               <h3 className="text-lg font-black text-slate-900 tracking-tight">Ana Model Yapılandırması</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Aktif Yapay Zeka Modeli</label>
                <div className="relative group">
                  <select 
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all appearance-none pr-12 cursor-pointer shadow-sm"
                    value={activeModel}
                    onChange={(e) => onModelChange(e.target.value)}
                  >
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400 group-hover:text-blue-600">
                    <span className="material-symbols-outlined text-[24px]">expand_more</span>
                  </div>
                </div>
                <p className="text-[12px] text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 border-dashed">
                  {availableModels.find(m => m.id === activeModel)?.desc}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-2xl flex items-center justify-center shadow-sm border ${hasKey ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                    <span className="material-symbols-outlined text-[24px] fill">{hasKey ? 'verified_user' : 'vpn_key'}</span>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Bağlantı Durumu</div>
                    <div className="text-[14px] font-black text-slate-900">{hasKey ? 'Yönetici Projesi Bağlı' : 'Anahtar Bekleniyor'}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleTestApi} disabled={!hasKey || isTesting} className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-blue-600 hover:border-blue-600 transition-all flex items-center gap-3 shadow-sm disabled:opacity-30">
                    <span className={`material-symbols-outlined text-[18px] ${isTesting ? 'animate-spin' : ''}`}>wifi_tethering</span>
                    Gecikme Testi
                  </button>
                  <button onClick={handleSelectKey} className="h-11 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                    Proje Değiştir
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px] fill">tune</span>
               </div>
               <h3 className="text-lg font-black text-slate-900 tracking-tight">Gelişmiş Zeka Parametreleri</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Yaratıcılık (Temperature)</span>
                  <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{temperature}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={temperature} 
                  onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                  <span>Daha Tutarlı / Teknik</span>
                  <span>Daha Yaratıcı / Esnek</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Çeşitlilik (Top P)</span>
                  <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{topP}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={topP} 
                  onChange={(e) => onTopPChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                  <span>Dar Odaklı Yanıt</span>
                  <span>Geniş Kapsamlı Yanıt</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quota & Plan */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl p-8 space-y-8 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-50"></div>
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[400px]">
              <div className="space-y-2">
                 <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[32px] text-blue-400 fill">analytics</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Enterprise Resource Hub</p>
                 <h2 className="text-3xl font-black tracking-tighter">{currentQuota.project}</h2>
                 <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg border border-emerald-500/30 mt-2 tracking-widest">
                    {currentQuota.plan}
                 </span>
              </div>

              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Kullanılan Kota</span>
                    <span className="text-blue-400">%{Math.round((currentQuota.used / currentQuota.total) * 100)}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${(currentQuota.used / currentQuota.total) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-black tracking-tight">
                    <span className="text-white/60">{currentQuota.used.toLocaleString()}</span>
                    <span className="text-white/20">/ {(currentQuota.total / 1000).toFixed(0)}k Token</span>
                  </div>
                </div>

                <button onClick={() => alert("Quota extension requires executive approval.")} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95">
                  Kota Başvurusu Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
