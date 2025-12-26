
import React, { useState, useEffect, useRef } from 'react';
import { Bot, KnowledgeBank, Script, AgentLog } from '../types';
import { GoogleGenAI } from "@google/genai";
import { simulateAgenticFlow } from '../services/aiService';

interface AgentPlaygroundProps {
  bots: Bot[];
  knowledgeBanks: KnowledgeBank[];
  scripts: Script[];
  onUpdateBot: (bot: Bot) => void;
  onAddLog?: (log: AgentLog) => void;
  onAddScripts?: (scripts: Script[]) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    intent?: string;
    sourceId?: string;
    action?: string;
    sentiment?: AgentLog['sentiment'];
    log?: AgentLog;
  };
}

const AgentPlayground: React.FC<AgentPlaygroundProps> = ({ bots, knowledgeBanks, scripts, onUpdateBot, onAddLog, onAddScripts }) => {
  const [selectedBotId, setSelectedBotId] = useState<string | null>(bots.length > 0 ? bots[0].id : null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
  // Correction UI states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [correctionValue, setCorrectionValue] = useState('');

  const selectedBot = bots.find(b => b.id === selectedBotId);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedBot) {
      setMessages([{ id: 'init', role: 'assistant', content: selectedBot.welcomeMessage }]);
    }
  }, [selectedBotId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedBot) return;

    const userMsg: ChatMessage = { 
      id: `USER-${Date.now()}`, 
      role: 'user', 
      content: inputValue 
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const botScripts = scripts.filter(s => selectedBot.kbIds.includes(s.kbId));
      const log = await simulateAgenticFlow(inputValue, botScripts, selectedBot);
      
      // Sync sentiment to the previous user message
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, metadata: { ...m.metadata, sentiment: log.sentiment } } : m));

      const assistantMsg: ChatMessage = { 
        id: log.id,
        role: 'assistant', 
        content: log.aiResponse,
        metadata: { 
          intent: log.intent, 
          sourceId: log.sourceScriptId,
          action: log.status === 'REFLECTED' ? 'BİLDİRİM TETİKLENDİ' : undefined,
          log: log
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (onAddLog) onAddLog(log);
    } catch (e) {
      setMessages(prev => [...prev, { id: `ERR-${Date.now()}`, role: 'assistant', content: "Üzgünüm, şu an yanıt veremiyorum." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCorrectResponse = (msgId: string, currentContent: string) => {
    setEditingMessageId(msgId);
    setCorrectionValue(currentContent);
  };

  const saveCorrection = (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg || !msg.metadata?.log || !onAddScripts) return;

    const log = msg.metadata.log;
    const newScript: Script = {
      id: `SCR-PLAY-${Date.now()}`,
      content: correctionValue,
      primaryIntent: log.intent,
      category: log.category,
      keywords: [log.intent, ...log.userInput.split(' ').filter(w => w.length > 3)],
      confidence: 1.0,
      status: 'PROCESSED',
      kbId: selectedBot?.kbIds[0] || 'kb_general',
      isGolden: true
    };

    onAddScripts([newScript]);
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: correctionValue, metadata: { ...m.metadata, action: 'DÜZELTİLDİ & HAFIZAYA ALINDI' } } : m));
    setEditingMessageId(null);
    alert("Düzeltme kaydedildi ve botun hafızasına (Altın Veri) eklendi.");
  };

  const getSentimentIcon = (sentiment?: AgentLog['sentiment']) => {
    switch (sentiment) {
      case 'Positive': return <span className="material-symbols-outlined text-emerald-500 text-[14px] fill">sentiment_very_satisfied</span>;
      case 'Negative': return <span className="material-symbols-outlined text-red-500 text-[14px] fill">sentiment_very_dissatisfied</span>;
      case 'Urgent': return <span className="material-symbols-outlined text-amber-500 text-[14px] animate-pulse">priority_high</span>;
      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden animate-in fade-in duration-500">
      {/* Bot Sidebar */}
      <div className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bot Fleet</h3>
          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded">{bots.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {bots.length > 0 ? bots.map(bot => (
            <button 
              key={bot.id}
              onClick={() => setSelectedBotId(bot.id)}
              className={`w-full p-3 rounded-xl text-left transition-all border flex items-center gap-3 ${
                selectedBotId === bot.id ? 'bg-slate-900 border-slate-900 shadow-lg text-white' : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                selectedBotId === bot.id ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <span className="material-symbols-outlined text-[18px] fill">smart_toy</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black truncate">{bot.name}</p>
                <p className={`text-[7px] font-black uppercase tracking-tighter truncate opacity-60`}>{bot.role}</p>
              </div>
            </button>
          )) : (
             <div className="p-10 text-center opacity-20">
                <span className="material-symbols-outlined text-[32px]">precision_manufacturing</span>
                <p className="text-[9px] font-black uppercase mt-2">Bot Yok</p>
             </div>
          )}
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        {selectedBot ? (
          <>
            {/* Header */}
            <div className="px-6 py-3 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined text-[20px] fill">smart_toy</span>
                 </div>
                 <div>
                    <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{selectedBot.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase">{selectedBot.tone}</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{selectedBot.kbIds.length} KB Linked</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 gap-1">
                   <div className="px-2 py-1 text-[8px] font-black text-slate-400 uppercase">Temp: {selectedBot.temperature}</div>
                   <div className="px-2 py-1 text-[8px] font-black text-slate-400 uppercase">Limit: {selectedBot.maxResponseLength}</div>
                 </div>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
                  <div className={`size-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm ${
                    msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-blue-600'
                  }`}>
                    <span className="material-symbols-outlined text-[18px] fill">
                      {msg.role === 'user' ? 'person' : 'smart_toy'}
                    </span>
                  </div>
                  
                  <div className={`max-w-[70%] space-y-1.5 ${msg.role === 'user' ? 'items-end' : ''}`}>
                    <div className="relative">
                      {editingMessageId === msg.id ? (
                        <div className="bg-white p-3 rounded-2xl border-2 border-blue-400 shadow-xl space-y-3 w-[400px]">
                           <textarea 
                             className="w-full bg-slate-50 border-none rounded-lg p-2 text-[11px] font-bold text-slate-900 focus:ring-0 outline-none min-h-[80px]"
                             value={correctionValue}
                             onChange={(e) => setCorrectionValue(e.target.value)}
                           />
                           <div className="flex justify-end gap-2">
                             <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 text-[9px] font-black uppercase text-slate-400">İptal</button>
                             <button onClick={() => saveCorrection(msg.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Kaydet & Eğit</button>
                           </div>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-sm border ${
                          msg.role === 'user' ? 'bg-slate-900 text-white border-slate-900 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      )}
                      
                      {msg.role === 'user' && msg.metadata?.sentiment && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2">
                          {getSentimentIcon(msg.metadata.sentiment)}
                        </div>
                      )}
                    </div>

                    {msg.metadata && !editingMessageId && (
                       <div className="flex flex-wrap gap-2 items-center">
                          {msg.metadata.intent && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[7px] font-black rounded uppercase border border-blue-100">
                               Intent: {msg.metadata.intent}
                            </span>
                          )}
                          {msg.metadata.action && (
                             <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[7px] font-black rounded uppercase border border-amber-200 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">notifications_active</span> {msg.metadata.action}
                             </span>
                          )}
                          {msg.role === 'assistant' && msg.id !== 'init' && (
                             <button 
                               onClick={() => handleCorrectResponse(msg.id, msg.content)}
                               className="px-2 py-0.5 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                             >
                               <span className="material-symbols-outlined text-[12px]">edit_square</span>
                               <span className="text-[7px] font-black uppercase tracking-widest">Düzenle & Eğit</span>
                             </button>
                          )}
                       </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4 animate-pulse">
                  <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-[18px] fill">smart_toy</span>
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-2 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <div className="size-1 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="size-1 bg-slate-300 rounded-full animate-bounce delay-100"></div>
                    <div className="size-1 bg-slate-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-200">
              <div className="max-w-4xl mx-auto relative">
                <input 
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl pl-6 pr-14 py-4 text-xs font-bold text-slate-900 focus:bg-white outline-none focus:ring-4 focus:ring-blue-600/5 transition-all shadow-inner"
                  placeholder={`${selectedBot.name} ile konuşmaya başla...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-3 top-2 size-10 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center gap-6 opacity-30 grayscale">
            <div className="size-32 rounded-3xl bg-white border-4 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <span className="material-symbols-outlined text-[64px]">sports_esports</span>
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.2em]">Playground Hazır</h3>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Test etmek için soldan bir bot seçin veya Bot Factory'den yeni bir tane üretin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPlayground;
