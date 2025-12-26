
import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeBank, Bot, Script, AgentLog, EscalationRule } from '../types';
import { simulateAgenticFlow } from '../services/aiService';

interface BotFactoryProps {
  lang: 'tr' | 'en';
  knowledgeBanks: KnowledgeBank[];
  bots: Bot[];
  scripts: Script[];
  escalationRules: EscalationRule[];
  onAddBot: (bot: Bot) => void;
  onUpdateBot: (bot: Bot) => void;
  onAddLog: (log: AgentLog) => void;
  onAddScripts: (scripts: Script[]) => void;
  activeModel: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const AVATAR_OPTIONS = [
  { icon: 'smart_toy', label: 'Genel AI' },
  { icon: 'psychology', label: 'Bilişsel' },
  { icon: 'support_agent', label: 'Asistan' },
  { icon: 'currency_bitcoin', label: 'Finans' },
  { icon: 'shopping_cart', label: 'E-Ticaret' },
  { icon: 'construction', label: 'Endüstri' },
  { icon: 'flight', label: 'Turizm' },
  { icon: 'school', label: 'Eğitim' },
  { icon: 'gavel', label: 'Hukuk' },
  { icon: 'language', label: 'Global' }
];

const BotFactory: React.FC<BotFactoryProps> = ({ lang, knowledgeBanks, bots, scripts, escalationRules, onAddBot, onUpdateBot, onAddLog, onAddScripts, activeModel }) => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('identity');
  
  const [botName, setBotName] = useState('');
  const [botRole, setBotRole] = useState('Müşteri Hizmetleri');
  const [welcomeMsg, setWelcomeMsg] = useState('Merhaba!');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [avatar, setAvatar] = useState('smart_toy');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [promptStyle, setPromptStyle] = useState<'Direct' | 'Polite' | 'Inquisitive' | 'Concise'>('Direct');
  const [botLangMode, setBotLangMode] = useState<'auto' | 'tr' | 'en'>('auto');
  const [selectedKBIds, setSelectedKBIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    tr: {
      title: 'BOT FABRİKASI',
      newBot: 'YENİ BOT',
      manage: 'YÖNET',
      config: 'BOT AYARLARI',
      acc1: 'KİMLİK',
      acc2: 'DAVRANIŞ',
      logoLabel: 'LOGO',
      botName: 'BOT ADI *',
      botRole: 'ROL',
      sysPrompt: 'SYSTEM PROMPT',
      tempLabel: 'YARATICILIK',
      styleLabel: 'TARZ',
      langLabel: 'DİL',
      save: 'KAYDET',
      playground: 'TEST ALANI',
      fleet: 'FİLO',
      linkedKb: 'BAĞLI BANKALAR',
      generatePrompt: 'PROMPT OLUŞTUR',
      typing: 'Yazıyor...',
      autoLang: 'Müşteri Dili (Auto)',
      trLang: 'Türkçe',
      enLang: 'İngilizce'
    },
    en: {
      title: 'BOT FACTORY',
      newBot: 'NEW BOT',
      manage: 'MANAGE',
      config: 'BOT CONFIG',
      acc1: 'IDENTITY',
      acc2: 'BEHAVIOR',
      logoLabel: 'LOGO',
      botName: 'BOT NAME *',
      botRole: 'ROLE',
      sysPrompt: 'SYSTEM PROMPT',
      tempLabel: 'CREATIVITY',
      styleLabel: 'STYLE',
      langLabel: 'LANGUAGE',
      save: 'SAVE',
      playground: 'PLAYGROUND',
      fleet: 'FLEET',
      linkedKb: 'LINKED BANKS',
      generatePrompt: 'GEN PROMPT',
      typing: 'Typing...',
      autoLang: 'Auto Detect',
      trLang: 'Turkish Only',
      enLang: 'English Only'
    }
  }[lang];

  useEffect(() => {
    if (selectedBotId) {
      const selectedBot = bots.find(b => b.id === selectedBotId);
      if (selectedBot) {
        setBotName(selectedBot.name); setBotRole(selectedBot.role);
        setWelcomeMsg(selectedBot.welcomeMessage); setSystemPrompt(selectedBot.systemPrompt || '');
        if (selectedBot.avatar?.startsWith('data:image')) { setCustomAvatar(selectedBot.avatar); setAvatar('custom'); } 
        else { setAvatar(selectedBot.avatar || 'smart_toy'); setCustomAvatar(null); }
        setTemperature(selectedBot.temperature); setPromptStyle(selectedBot.promptStyle || 'Direct');
        setSelectedKBIds(selectedBot.kbIds);
        setMessages([{ id: 'init', role: 'assistant', content: selectedBot.welcomeMessage }]);
      }
    }
  }, [selectedBotId, bots]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, { id: `USER-${Date.now()}`, role: 'user', content: inputValue }]);
    setInputValue(''); setIsTyping(true);
    try {
      const botScripts = scripts.filter(s => selectedKBIds.includes(s.kbId));
      const log = await simulateAgenticFlow(inputValue, botScripts, undefined, activeModel, lang);
      setMessages(prev => [...prev, { id: log.id, role: 'assistant', content: log.aiResponse }]);
      onAddLog(log);
    } catch (e) { setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Error." }]); } finally { setIsTyping(false); }
  };

  const handleSaveBot = () => {
    if (!botName) return;
    const botData: Bot = {
      id: selectedBotId || `BOT-${Date.now()}`,
      name: botName, role: botRole,
      avatar: avatar === 'custom' ? customAvatar! : avatar,
      kbIds: selectedKBIds, temperature, welcomeMessage: welcomeMsg, systemPrompt,
      status: 'ACTIVE', maxResponseLength: 500, tone: 'Professional',
      promptStyle, notificationRules: [], maxOffTopicQuestions: 3
    };
    if (selectedBotId) onUpdateBot(botData); else onAddBot(botData);
    setIsEditing(false); setSelectedBotId(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setCustomAvatar(reader.result as string); setAvatar('custom'); };
      reader.readAsDataURL(file);
    }
  };

  if (!isEditing && !selectedBotId) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-6 animate-in fade-in duration-500 font-sans text-xs">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t.title}</h1>
          <button onClick={() => { setSelectedBotId(null); setIsEditing(true); setBotName(''); setSystemPrompt(''); setAvatar('smart_toy'); setCustomAvatar(null); setSelectedKBIds([]); }} className="bg-blue-600 text-white font-black px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">add</span> {t.newBot}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <div key={bot.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-300 transition-all group">
              <div className="flex justify-between items-start mb-6">
                 <div className="size-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100 overflow-hidden">
                   {bot.avatar?.startsWith('data:image') ? <img src={bot.avatar} className="w-full h-full object-cover" alt="L" /> : <span className="material-symbols-outlined text-[24px] fill">{bot.avatar || 'smart_toy'}</span>}
                 </div>
                 <span className="text-[9px] font-black text-slate-300 uppercase">ID: {bot.id.slice(-4)}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1 leading-none">{bot.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-6 tracking-widest">{bot.role}</p>
              <button onClick={() => { setSelectedBotId(bot.id); setIsEditing(true); }} className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">{t.manage}</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex bg-[#f8fafc] overflow-hidden animate-in fade-in duration-500 font-sans text-xs">
      <div className="w-[360px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
           <button onClick={() => { setSelectedBotId(null); setIsEditing(false); }} className="size-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-all"><span className="material-symbols-outlined text-[20px]">arrow_back</span></button>
           <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">{t.config}</h2>
        </div>
        
        <div className="space-y-4">
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => setOpenAccordion('identity')} className="w-full p-4 flex justify-between items-center bg-slate-50/50 text-slate-950 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">{t.acc1} <span className="material-symbols-outlined text-[16px]">{openAccordion === 'identity' ? 'expand_less' : 'expand_more'}</span></button>
              {openAccordion === 'identity' && (
                <div className="p-5 space-y-5 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.logoLabel}</label>
                    <div className="grid grid-cols-5 gap-2 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                       <button onClick={() => fileInputRef.current?.click()} className="size-10 rounded-lg border-2 border-dashed border-slate-100 text-slate-300 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">upload</span><input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" /></button>
                       {customAvatar && <button onClick={() => setAvatar('custom')} className={`size-10 rounded-lg border overflow-hidden ${avatar === 'custom' ? 'border-blue-600' : 'border-slate-100'}`}><img src={customAvatar} className="w-full h-full object-cover" alt="L" /></button>}
                       {AVATAR_OPTIONS.map(o => <button key={o.icon} onClick={() => { setAvatar(o.icon); setCustomAvatar(null); }} className={`size-10 rounded-lg border flex items-center justify-center ${avatar === o.icon ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}><span className="material-symbols-outlined text-[20px] fill">{o.icon}</span></button>)}
                    </div>
                  </div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.botName}</label><input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/5 transition-all" value={botName} onChange={e => setBotName(e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.botRole}</label><input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/5 transition-all" value={botRole} onChange={e => setBotRole(e.target.value)} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.sysPrompt}</label><textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-3 text-[10px] font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/5 transition-all min-h-[120px] leading-relaxed resize-none" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} /></div>
                </div>
              )}
           </div>
           
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => setOpenAccordion('behavior')} className="w-full p-4 flex justify-between items-center bg-slate-50/50 text-slate-950 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">{t.acc2} <span className="material-symbols-outlined text-[16px]">{openAccordion === 'behavior' ? 'expand_less' : 'expand_more'}</span></button>
              {openAccordion === 'behavior' && (
                <div className="p-5 space-y-6 animate-in slide-in-from-top-2">
                   <div className="space-y-4"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.tempLabel} ({temperature})</label><input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600" /></div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.langLabel}</label>
                      <div className="flex flex-col gap-1.5">
                         {[{id:'auto', label: t.autoLang}, {id:'tr', label: t.trLang}, {id:'en', label: t.enLang}].map(opt => (
                           <button key={opt.id} onClick={() => setBotLangMode(opt.id as any)} className={`px-4 py-2 text-left rounded-lg border text-[10px] font-black uppercase transition-all ${botLangMode === opt.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>{opt.label}</button>
                         ))}
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
        <button onClick={handleSaveBot} className="w-full mt-auto bg-blue-600 text-white font-black py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all uppercase text-[11px] tracking-widest">{t.save}</button>
      </div>

      <div className="flex-1 m-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
         <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t.playground}</h3>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded border border-emerald-100 uppercase">{t.fleet}: {bots.length}</span>
         </div>
         <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-4 shrink-0">
            <div className="flex flex-col gap-2">
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.linkedKb}</span>
               <div className="flex flex-wrap gap-2">
                {knowledgeBanks.length ? knowledgeBanks.map(kb => (
                  <button key={kb.id} onClick={() => setSelectedKBIds(p => p.includes(kb.id) ? p.filter(id => id !== kb.id) : [...p, kb.id])} className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selectedKBIds.includes(kb.id) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-800'}`}><span className="material-symbols-outlined text-[16px]">{selectedKBIds.includes(kb.id) ? 'check_circle' : 'database'}</span> {kb.name}</button>
                )) : <div className="text-[10px] font-bold text-slate-300 italic">No Banks</div>}
               </div>
            </div>
            <button onClick={() => {}} disabled={isGenerating} className="w-full bg-white border border-slate-200 hover:border-blue-600 py-3 rounded-xl flex items-center justify-center gap-2 transition-all group shadow-sm"><span className={`material-symbols-outlined text-blue-600 text-[18px] ${isGenerating ? 'animate-spin' : ''}`}>sparkles</span><span className="text-[10px] font-black text-slate-900 uppercase">{isGenerating ? '...' : t.generatePrompt}</span></button>
         </div>
         <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in`}>
                 <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border overflow-hidden ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border-slate-200 text-blue-600'}`}>{msg.role === 'user' ? <span className="material-symbols-outlined text-[18px] fill">person</span> : (customAvatar ? <img src={customAvatar} className="w-full h-full object-cover" alt="B" /> : <span className="material-symbols-outlined text-[18px] fill">{avatar}</span>)}</div>
                 <div className={`p-4 rounded-xl text-[11px] font-semibold shadow-sm border max-w-[80%] leading-relaxed ${msg.role === 'user' ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>{msg.content}</div>
              </div>
            ))}
            {isTyping && <div className="px-4 py-2 text-[10px] text-slate-400 font-black uppercase animate-pulse">{t.typing}</div>}
            <div ref={chatEndRef} />
         </div>
         <div className="p-5 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto relative group">
               <input className="w-full bg-slate-50 border-none rounded-xl pl-6 pr-24 py-4 text-xs font-bold text-slate-900 focus:bg-white outline-none ring-1 ring-slate-100 focus:ring-blue-600/10 transition-all" placeholder="..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
               <button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} className="absolute right-2.5 top-2.5 size-9 bg-blue-600 text-white rounded-lg shadow-md flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"><span className="material-symbols-outlined text-[20px]">send</span></button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BotFactory;
