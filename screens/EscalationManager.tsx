
import React, { useState } from 'react';
import { EscalationRule, EscalationTrigger, EscalationAction } from '../types';

interface EscalationManagerProps {
  rules: EscalationRule[];
  onAddRule: (rule: EscalationRule) => void;
  onUpdateRule: (rule: EscalationRule) => void;
  onDeleteRule: (id: string) => void;
}

const EscalationManager: React.FC<EscalationManagerProps> = ({ rules, onAddRule, onUpdateRule, onDeleteRule }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [triggers, setTriggers] = useState<EscalationTrigger[]>([]);
  const [actions, setActions] = useState<EscalationAction[]>([]);
  const [showTestOverlay, setShowTestOverlay] = useState(false);
  const [testingRule, setTestingRule] = useState<EscalationRule | null>(null);

  const handleSave = () => {
    if (!ruleName) { alert("Lütfen kural adı girin."); return; }
    if (triggers.length === 0) { alert("En az bir tetikleyici eklemelisiniz."); return; }
    if (actions.length === 0) { alert("En az bir aksiyon eklemelisiniz."); return; }

    const rule: EscalationRule = { id: editingRule?.id || `RULE-${Date.now()}`, name: ruleName, isActive, triggers, actions };
    if (editingRule) onUpdateRule(rule);
    else onAddRule(rule);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => { setEditingRule(null); setRuleName(''); setIsActive(true); setTriggers([]); setActions([]); };

  const runTestSimulation = (rule: EscalationRule) => {
    setTestingRule(rule);
    setShowTestOverlay(true);
    // Simulate email sending after 1.5s
    setTimeout(() => {
       // Logic for success message
    }, 1500);
  };

  const addTag = (trigId: string, tag: string) => {
    setTriggers(prev => prev.map(t => {
      if (t.id === trigId) {
        const currentTags = t.value ? t.value.split(',').filter(x => x) : [];
        if (!currentTags.includes(tag)) {
          return { ...t, value: [...currentTags, tag].join(',') };
        }
      }
      return t;
    }));
  };

  const removeTag = (trigId: string, tag: string) => {
    setTriggers(prev => prev.map(t => {
      if (t.id === trigId) {
        const currentTags = t.value.split(',').filter(ct => ct !== tag && ct);
        return { ...t, value: currentTags.join(',') };
      }
      return t;
    }));
  };

  if (isAdding) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">KURAL YAPILANDIRMASI</h1>
          <div className="flex gap-2">
             <button onClick={() => { setIsAdding(false); resetForm(); }} className="px-4 py-1.5 border border-slate-300 rounded-lg text-[9px] font-black uppercase text-slate-800 hover:bg-slate-50 transition-all">İPTAL</button>
             <button onClick={handleSave} className="px-5 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase shadow-md hover:bg-blue-700 active:scale-95 transition-all">KAYDET</button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
           <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[18px]">settings</span>
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Kural Tanımı</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                 <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Kural Adı</label>
                 <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-blue-600/10 transition-all" value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="Örn: Öfke Tespiti" />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <span className="text-[9px] font-black text-slate-900 uppercase">Aktif</span>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                 </label>
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
           <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">bolt</span>
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Tetikleyiciler</h3>
           </div>
           <div className="space-y-2">
              {triggers.map(trig => (
                <div key={trig.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-end">
                   <div className="flex-1 min-w-[100px] space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TİP</label>
                      <select className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none" value={trig.type} onChange={e => setTriggers(triggers.map(t => t.id === trig.id ? {...t, type: e.target.value as any, value: ''} : t))}>
                         <option value="Confidence Score">Confidence Score</option>
                         <option value="Keyword">Keyword</option>
                         <option value="Intent">Intent</option>
                         <option value="Sentiment">Sentiment</option>
                      </select>
                   </div>
                   <div className="flex-1 min-w-[100px] space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">KOŞUL</label>
                      <select className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none" value={trig.condition} onChange={e => setTriggers(triggers.map(t => t.id === trig.id ? {...t, condition: e.target.value as any} : t))}>
                         {trig.type === 'Confidence Score' ? (
                           <><option value="Is below">&lt;</option><option value="Is above">&gt;</option></>
                         ) : trig.type === 'Sentiment' ? (
                           <option value="Is">Is</option>
                         ) : (
                           <><option value="Contains">İçerir</option><option value="Equals">Eşit</option></>
                         )}
                      </select>
                   </div>
                   <div className="flex-[2] min-w-[150px] space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DEĞER</label>
                      {trig.type === 'Sentiment' ? (
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none" value={trig.value} onChange={e => setTriggers(triggers.map(t => t.id === trig.id ? {...t, value: e.target.value} : t))}>
                          <option value="">Seç...</option>
                          <option value="Positive">Positive</option><option value="Neutral">Neutral</option><option value="Negative">Negative</option><option value="Urgent">Urgent</option>
                        </select>
                      ) : trig.type === 'Confidence Score' ? (
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none" value={trig.value} onChange={e => setTriggers(triggers.map(t => t.id === trig.id ? {...t, value: e.target.value} : t))}>
                          <option value="">Seç...</option>
                          {[0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0].map(val => <option key={val} value={val}>%{Math.round(val * 100)}</option>)}
                        </select>
                      ) : (
                        <div className="space-y-1">
                          <input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none" placeholder="Yaz ve Enter..." onKeyDown={e => e.key === 'Enter' && (e.currentTarget.value.trim() && (addTag(trig.id, e.currentTarget.value.trim()), e.currentTarget.value = ''))} />
                          <div className="flex flex-wrap gap-1">
                            {trig.value && trig.value.split(',').filter(x=>x).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 bg-blue-600 text-white text-[7px] font-black rounded flex items-center gap-1 uppercase">
                                {tag} <span onClick={() => removeTag(trig.id, tag)} className="material-symbols-outlined text-[9px] cursor-pointer">close</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                   </div>
                   <button onClick={() => setTriggers(triggers.filter(t => t.id !== trig.id))} className="p-1.5 text-slate-300 hover:text-red-600 transition-all"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              ))}
              <button onClick={() => setTriggers([...triggers, { id: `trig-${Date.now()}`, type: 'Confidence Score', condition: 'Is below', value: '' }])} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase hover:bg-black transition-all shadow-sm"><span className="material-symbols-outlined text-[14px]">add</span> YENİ TETİKLEYİCİ</button>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
           <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">bolt</span>
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Aksiyonlar</h3>
           </div>
           <div className="space-y-2">
              {actions.map(act => (
                <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                   <div className="flex flex-wrap gap-3 items-end">
                      <div className="flex-1 min-w-[100px] space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AKSİYON</label>
                         <select className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none" value={act.type} onChange={e => setActions(actions.map(a => a.id === act.id ? {...a, type: e.target.value as any} : a))}>
                            <option value="Send Email">E-posta</option><option value="Webhook">Webhook</option><option value="Transfer to Human">Human-in-the-loop</option>
                         </select>
                      </div>
                      <div className="flex-[2] min-w-[150px] space-y-1">
                         <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ALICI / URL</label>
                         <input className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none" value={act.recipients || ''} onChange={e => setActions(actions.map(a => a.id === act.id ? {...a, recipients: e.target.value} : a))} placeholder="support@company.com" />
                      </div>
                      <button onClick={() => setActions(actions.filter(a => a.id !== act.id))} className="p-1.5 text-slate-300 hover:text-red-600"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                   </div>
                   <textarea className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-900 outline-none min-h-[50px] resize-none" value={act.message || ''} onChange={e => setActions(actions.map(a => a.id === act.id ? {...a, message: e.target.value} : a))} placeholder="İçerik / Payload" />
                </div>
              ))}
              <button onClick={() => setActions([...actions, { id: `act-${Date.now()}`, type: 'Send Email', recipients: '', message: '' }])} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase hover:bg-emerald-700 transition-all shadow-sm"><span className="material-symbols-outlined text-[14px]">bolt</span> YENİ AKSİYON</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-4 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Eskalasyon Kuralları</h1>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">Sistem Müdahale Protokolleri</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white font-black px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all text-[9px] uppercase tracking-widest">YENİ KURAL</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-[8px] font-black text-slate-900 uppercase tracking-widest">Kural</th>
              <th className="px-4 py-3 text-[8px] font-black text-slate-900 uppercase tracking-widest">Tetikleyiciler</th>
              <th className="px-4 py-3 text-[8px] font-black text-slate-900 uppercase tracking-widest">İşlem</th>
              <th className="px-4 py-3 text-[8px] font-black text-slate-900 uppercase tracking-widest">Durum</th>
              <th className="px-4 py-3 text-right text-[8px] font-black text-slate-900 uppercase tracking-widest">Yönetim</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map(rule => (
              <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-[11px] font-black text-slate-900">{rule.name}</td>
                <td className="px-4 py-3">
                   <div className="flex flex-wrap gap-1">
                      {rule.triggers.map(t => <span key={t.id} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[7px] font-black rounded uppercase border border-slate-200">{t.type}</span>)}
                   </div>
                </td>
                <td className="px-4 py-3 text-[9px] font-bold text-slate-600">{rule.actions[0]?.type}</td>
                <td className="px-4 py-3">
                   <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border shadow-sm ${rule.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{rule.isActive ? 'AKTİF' : 'PASİF'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                   <div className="flex justify-end gap-1">
                      <button onClick={() => runTestSimulation(rule)} className="size-7 rounded-lg border border-slate-200 text-slate-400 hover:text-amber-500 transition-all flex items-center justify-center" title="Simülasyon Testi"><span className="material-symbols-outlined text-[14px]">play_circle</span></button>
                      <button onClick={() => { setEditingRule(rule); setRuleName(rule.name); setIsActive(rule.isActive); setTriggers(rule.triggers); setActions(rule.actions); setIsAdding(true); }} className="size-7 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                      <button onClick={() => onDeleteRule(rule.id)} className="size-7 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTestOverlay && testingRule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-200 p-8 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-xl font-black text-slate-900 uppercase">Simülasyon Testi</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{testingRule.name}</p>
                 </div>
                 <button onClick={() => setShowTestOverlay(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><span className="material-symbols-outlined text-[28px]">close</span></button>
              </div>
              
              <div className="space-y-6">
                 <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">email</span></div>
                       <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase">ALICI</p>
                          <p className="text-[11px] font-bold text-slate-900">{testingRule.actions[0]?.recipients || 'TANIMSIZ'}</p>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase">SİSTEM MESAJI</p>
                       <p className="text-[10px] font-medium text-slate-700 leading-relaxed italic border-l-2 border-slate-200 pl-3">"{testingRule.actions[0]?.message || 'Otomatik bildirim tetiklendi.'}"</p>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex gap-1.5">
                       <div className="size-1.5 rounded-full bg-emerald-500 animate-bounce"></div>
                       <div className="size-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
                       <div className="size-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest animate-pulse">BİLDİRİM GÖNDERİLİYOR...</p>
                 </div>

                 <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">SIMÜLASYON BAŞARILI: Webhook ve Email protokolleri yanıt verdi.</p>
                 </div>
              </div>

              <button onClick={() => setShowTestOverlay(false)} className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all">TESTİ KAPAT</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default EscalationManager;
