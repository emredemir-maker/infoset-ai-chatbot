
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgentLog, Script, TaxonomyCategory, KnowledgeBank } from '../types';
import { simulateAgenticFlow, generateTestVariations } from '../services/aiService';

interface AgentLogsProps {
  lang: 'tr' | 'en';
  logs: AgentLog[];
  scripts: Script[];
  taxonomy: TaxonomyCategory[];
  knowledgeBanks: KnowledgeBank[];
  onAddLog: (log: AgentLog) => void;
  onUpdateLog: (log: AgentLog) => void;
  onAddScripts: (scripts: Script[]) => void;
  activeModel: string;
}

const AgentLogs: React.FC<AgentLogsProps> = ({ lang, logs, scripts, taxonomy, knowledgeBanks, onAddLog, onUpdateLog, onAddScripts, activeModel }) => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedLog, setSelectedLog] = useState<AgentLog | null>(null);
  const [testInput, setTestInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'response' | 'reasoning' | 'meta'>('response');
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');

  const t = {
    tr: {
      title: 'ANALİZ & TEST KAYITLARI',
      sub: 'Detaylı vaka analizi',
      quickSearch: 'Test sorgusu...',
      run: 'ÇALIŞTIR',
      caseDetail: 'Vaka',
      level: 'Seviye',
      confidence: 'Güven',
      qA: 'Soru & Yanıt',
      actions: 'Aksiyon',
      testRun: 'Kayıt No',
      back: 'Geri',
      export: 'EXPORT',
      retest: 'YENİLE',
      details: 'ÖZET',
      status: 'DURUM',
      kbRef: 'BİLGİ KAYNAĞI',
      autoDetect: 'Otomatik',
      testDate: 'TARİH',
      duration: 'SÜRE',
      userType: 'KULLANICI',
      matchedDoc: 'KULLANILAN BİLGİ',
      tab1: 'SORU & YANIT',
      tab2: 'MUHAKEME',
      tab3: 'META',
      userQuestion: 'MÜŞTERİ',
      botResponse: 'BOT',
      fixResponse: 'DÜZELT',
      cancel: 'İPTAL',
      reasoningTitle: 'AI MANTIĞI',
      approveReasoning: 'ONAYLA',
      approvedReasoning: 'ONAYLANDI',
      approve: 'ONAYLA',
      intentLabel: 'NİYET',
      categoryLabel: 'KATEGORİ',
      sentimentLabel: 'DUYGU',
      tokensLabel: 'TOKEN',
      standard: 'Standart',
      success: 'BAŞARILI',
      lowConf: 'DÜŞÜK GÜVEN'
    },
    en: {
      title: 'ANALYSIS & LOGS',
      sub: 'Detailed case analysis',
      quickSearch: 'Query...',
      run: 'RUN',
      caseDetail: 'Case',
      level: 'Level',
      confidence: 'Confidence',
      qA: 'Q & A',
      actions: 'Action',
      testRun: 'Log No',
      back: 'Back',
      export: 'EXPORT',
      retest: 'RE-RUN',
      details: 'SUMMARY',
      status: 'STATUS',
      kbRef: 'KNOWLEDGE SOURCE',
      autoDetect: 'Auto',
      testDate: 'DATE',
      duration: 'DUR',
      userType: 'USER',
      matchedDoc: 'SOURCE KNOWLEDGE',
      tab1: 'Q & A',
      tab2: 'REASONING',
      tab3: 'META',
      userQuestion: 'CUSTOMER',
      botResponse: 'BOT',
      fixResponse: 'FIX',
      cancel: 'CANCEL',
      reasoningTitle: 'REASONING LOGIC',
      approveReasoning: 'APPROVE',
      approvedReasoning: 'APPROVED',
      approve: 'APPROVE',
      intentLabel: 'INTENT',
      categoryLabel: 'CATEGORY',
      sentimentLabel: 'SENTIMENT',
      tokensLabel: 'TOKENS',
      standard: 'Standard',
      success: 'SUCCESS',
      lowConf: 'LOW CONFIDENCE'
    }
  }[lang];

  useEffect(() => {
    const logId = searchParams.get('logId');
    if (logId) {
      const log = logs.find(l => l.id === logId);
      if (log) handleOpenDetail(log);
    }
  }, [searchParams, logs]);

  const handleSimulateQuick = async () => {
    const inputToUse = selectedLog ? selectedLog.userInput : testInput;
    if (!inputToUse.trim()) return;
    setIsSimulating(true);
    try {
      const start = Date.now();
      const log = await simulateAgenticFlow(inputToUse, scripts, undefined, activeModel, lang);
      log.durationMs = Date.now() - start;
      onAddLog(log); setSelectedLog(log); setTestInput('');
    } catch (e) { console.error(e); } finally { setIsSimulating(false); }
  };

  const handleOpenDetail = (log: AgentLog) => {
    setSelectedLog(log); setEditedResponse(log.aiResponse); setIsEditingResponse(false); setViewMode('detail');
  };

  const linkedScript = useMemo(() => {
    if (!selectedLog?.sourceScriptId) return null;
    return scripts.find(s => s.id === selectedLog.sourceScriptId);
  }, [selectedLog, scripts]);

  if (viewMode === 'detail' && selectedLog) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300 font-sans text-[12px]">
        <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
           <button onClick={() => setViewMode('list')} className="hover:text-blue-600">{t.back}</button>
           <span className="material-symbols-outlined text-[12px]">chevron_right</span>
           <span className="text-slate-900">{t.details} #{selectedLog.id.slice(-6)}</span>
        </div>

        <div className="flex justify-between items-center">
           <h1 className="text-lg font-black text-slate-900 tracking-tight">{t.testRun} #{selectedLog.id.slice(-6)}</h1>
           <div className="flex gap-2">
              <button className="px-5 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-900 hover:bg-slate-50 uppercase">{t.export}</button>
              <button onClick={handleSimulateQuick} disabled={isSimulating} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black shadow-md hover:bg-blue-700 uppercase flex items-center gap-2">
                {isSimulating ? <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px]">refresh</span>}
                {t.retest}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           <div className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                 <h3 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-50 pb-3">{t.details}</h3>
                 <div className="space-y-5">
                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">ID</p><p className="font-black text-slate-900">#{selectedLog.id.slice(-8)}</p></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-2">{t.status}</p><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${selectedLog.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{selectedLog.status === 'VERIFIED' ? t.success : t.lowConf}</span></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-2">{t.confidence}</p><div className="flex items-center gap-3"><div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden"><div className={`h-full ${selectedLog.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${selectedLog.confidence * 100}%` }}></div></div><span className="font-black text-slate-900">%{Math.round(selectedLog.confidence * 100)}</span></div></div>
                    <div><p className="text-[9px] font-black text-slate-400 uppercase mb-2">{t.kbRef}</p><div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900 uppercase truncate">{selectedLog.referenceKbId ? knowledgeBanks.find(k => k.id === selectedLog.referenceKbId)?.name : t.autoDetect}</div></div>
                    {linkedScript && (<div className="p-4 bg-blue-50 rounded-xl border border-blue-100 leading-tight"><p className="text-[8px] font-black text-blue-400 uppercase mb-1">{t.matchedDoc}</p><p className="font-semibold text-blue-900 italic line-clamp-3">"{linkedScript.content}"</p></div>)}
                    <div className="grid grid-cols-2 gap-4"><div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t.testDate}</p><p className="font-bold text-slate-700">{selectedLog.timestamp}</p></div><div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">{t.duration}</p><p className="font-bold text-slate-700">{selectedLog.durationMs || 450}ms</p></div></div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[550px] overflow-hidden">
              <div className="flex border-b border-slate-100 bg-slate-50/20">
                 {[{ id: 'response', label: t.tab1 }, { id: 'reasoning', label: t.tab2 }, { id: 'meta', label: t.tab3 }].map(tab => (
                   <button key={tab.id} onClick={() => setActiveDetailTab(tab.id as any)} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest relative transition-all ${activeDetailTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                      {tab.label}{activeDetailTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
                   </button>
                 ))}
              </div>
              
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                 {activeDetailTab === 'response' && (
                   <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                      <div className="space-y-3"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{t.userQuestion}</h4><div className="bg-slate-50 border border-slate-100 rounded-xl p-6 font-semibold text-slate-800 leading-relaxed italic">"{selectedLog.userInput}"</div></div>
                      <div className="space-y-3"><div className="flex justify-between items-center px-2"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.botResponse}</h4><button onClick={() => setIsEditingResponse(!isEditingResponse)} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline"><span className="material-symbols-outlined text-[14px]">{isEditingResponse ? 'close' : 'edit_square'}</span>{isEditingResponse ? t.cancel : t.fixResponse}</button></div>{isEditingResponse ? (<textarea className="w-full bg-white border-2 border-blue-500 rounded-xl p-6 font-bold text-slate-900 leading-relaxed outline-none min-h-[150px]" value={editedResponse} onChange={e => setEditedResponse(e.target.value)} />) : (<div className="bg-white border border-slate-100 rounded-xl p-6 font-bold text-slate-900 leading-relaxed">{selectedLog.aiResponse}</div>)}</div>
                   </div>
                 )}
                 {activeDetailTab === 'reasoning' && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-6 shadow-lg relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-5"><span className="material-symbols-outlined text-[120px]">psychology</span></div><div className="flex items-center gap-3 text-blue-400 relative z-10"><span className="material-symbols-outlined text-[24px]">radar</span><h4 className="text-[11px] font-black uppercase tracking-widest">{t.reasoningTitle}</h4></div><p className="text-base font-medium leading-relaxed opacity-90 relative z-10">{selectedLog.reasoning || "Data sets analyzed."}</p><div className="pt-6 border-t border-white/5 flex justify-between items-end relative z-10"><div><p className="text-[9px] font-black text-white/30 uppercase mb-2">{t.intentLabel}</p><p className="font-black uppercase text-white">{selectedLog.intent}</p></div><button className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 transition-all ${selectedLog.status === 'VERIFIED' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}`}><span className="material-symbols-outlined text-[16px]">verified</span>{selectedLog.status === 'VERIFIED' ? t.approvedReasoning : t.approveReasoning}</button></div></div>
                   </div>
                 )}
                 {activeDetailTab === 'meta' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                       {[{ label: t.intentLabel, val: selectedLog.intent }, { label: t.categoryLabel, val: selectedLog.category }, { label: t.sentimentLabel, val: selectedLog.sentiment || 'Neutral' }, { label: t.tokensLabel, val: selectedLog.tokenUsage?.total || 0 }, { label: 'AI MODEL', val: activeModel.toUpperCase() }].map((m, i) => (<div key={i} className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col justify-center"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">{m.label}</p><p className="font-black text-slate-900 truncate">{m.val}</p></div>))}
                    </div>
                 )}
              </div>

              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                 <button className="px-8 py-3 bg-white border border-slate-200 text-slate-900 font-black rounded-lg text-[10px] uppercase hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">{t.approve}</button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 font-sans text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t.title}</h1><p className="text-slate-400 font-bold mt-0.5 text-[10px] tracking-widest">{t.sub}</p></div>
        <div className="relative group"><input className="w-[350px] bg-white border border-slate-200 rounded-xl px-10 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-sm" placeholder={t.quickSearch} value={testInput} onChange={e => setTestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSimulateQuick()} /><span className="material-symbols-outlined absolute left-3 top-2 text-slate-300 text-[20px]">search</span></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">{t.caseDetail}</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">{t.level}</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">{t.confidence}</th>
              <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">{t.qA}</th>
              <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map(log => (
              <tr key={log.id} onClick={() => handleOpenDetail(log)} className="hover:bg-blue-50/10 transition-all cursor-pointer">
                <td className="px-6 py-3"><div className="flex items-center gap-4"><div className={`size-8 rounded-lg flex items-center justify-center ${log.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}><span className="material-symbols-outlined text-[18px]">{log.status === 'VERIFIED' ? 'check_circle' : 'warning'}</span></div><div className="flex flex-col leading-none"><span className="text-[11px] font-black text-slate-900 uppercase">LOG-{log.id.slice(-6)}</span><span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{log.timestamp}</span></div></div></td>
                <td className="px-6 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${log.userLevel === 'Beginner' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{log.userLevel || t.standard}</span></td>
                <td className="px-6 py-3"><div className="flex items-center gap-3"><div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${log.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${log.confidence * 100}%` }}></div></div><span className="text-[10px] font-black text-slate-900">%{Math.round(log.confidence * 100)}</span></div></td>
                <td className="px-6 py-3 max-w-[300px]"><p className="text-[10px] font-bold text-slate-900 truncate">Q: {log.userInput}</p><p className="text-[10px] font-medium text-slate-500 truncate leading-none mt-1">A: {log.aiResponse}</p></td>
                <td className="px-6 py-3 text-right"><button className="size-8 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">visibility</span></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentLogs;
