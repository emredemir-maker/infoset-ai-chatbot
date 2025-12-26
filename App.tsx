import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SetupWizard from './screens/SetupWizard';
import Dashboard from './screens/Dashboard';
import KnowledgeBanks from './screens/KnowledgeBanks';
import DataSources from './screens/DataSources';
import ScriptLibrary from './screens/ScriptLibrary';
import TaxonomyManager from './screens/TaxonomyManager';
import AgentLogs from './screens/AgentLogs';
import BotFactory from './screens/BotFactory';
import EscalationManager from './screens/EscalationManager';
import IntegrationHub from './screens/IntegrationHub';
import SystemSettings from './screens/SystemSettings';
import { KnowledgeBank, Script, AgentLog, TaxonomyCategory, Bot, EscalationRule } from './types';

// Logoyu dahil ediyoruz (Logoyu ana dizine logo.png adıyla koyduğundan emin ol)
import chatbotLogo from './logo.png';

const App: React.FC = () => {
  const [lang, setLang] = useState<'tr' | 'en'>(() => {
    return (localStorage.getItem('infoset_lang') as 'tr' | 'en') || 'tr';
  });

  // KURULUMU OTOMATİK TAMAMLANMIŞ SAYIYORUZ (Bypass)
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(true);

  // SENİN BELİRLEDİĞİN MODELİ VARSAYILAN YAPIYORUZ
  const [activeModel, setActiveModel] = useState<string>(() => {
    return localStorage.getItem('nexus_active_model') || 'gemini-3-flash';
  });

  const [temperature, setTemperature] = useState<number>(() => {
    const saved = localStorage.getItem('nexus_temp');
    return saved ? parseFloat(saved) : 0.7;
  });

  const [topP, setTopP] = useState<number>(() => {
    const saved = localStorage.getItem('nexus_topp');
    return saved ? parseFloat(saved) : 0.95;
  });

  const [knowledgeBanks, setKnowledgeBanks] = useState<KnowledgeBank[]>(() => {
    const saved = localStorage.getItem('nexus_knowledge_banks');
    return saved ? JSON.parse(saved) : [];
  });

  const [scripts, setScripts] = useState<Script[]>(() => {
    const saved = localStorage.getItem('nexus_scripts');
    return saved ? JSON.parse(saved) : [];
  });

  const [agentLogs, setAgentLogs] = useState<AgentLog[]>(() => {
    const saved = localStorage.getItem('nexus_agent_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [bots, setBots] = useState<Bot[]>(() => {
    const saved = localStorage.getItem('nexus_bots');
    return saved ? JSON.parse(saved) : [];
  });

  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>(() => {
    const saved = localStorage.getItem('nexus_escalation_rules');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [taxonomy, setTaxonomy] = useState<TaxonomyCategory[]>(() => {
    const saved = localStorage.getItem('nexus_taxonomy');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('infoset_lang', lang);
    localStorage.setItem('nexus_setup_complete', 'true'); // Her zaman true kaydet
    localStorage.setItem('nexus_active_model', activeModel);
    localStorage.setItem('nexus_temp', temperature.toString());
    localStorage.setItem('nexus_topp', topP.toString());
    localStorage.setItem('nexus_knowledge_banks', JSON.stringify(knowledgeBanks));
    localStorage.setItem('nexus_scripts', JSON.stringify(scripts));
    localStorage.setItem('nexus_agent_logs', JSON.stringify(agentLogs));
    localStorage.setItem('nexus_taxonomy', JSON.stringify(taxonomy));
    localStorage.setItem('nexus_bots', JSON.stringify(bots));
    localStorage.setItem('nexus_escalation_rules', JSON.stringify(escalationRules));
  }, [lang, isSetupComplete, activeModel, temperature, topP, knowledgeBanks, scripts, agentLogs, taxonomy, bots, escalationRules]);

  const addKnowledgeBank = (newKB: KnowledgeBank) => setKnowledgeBanks((prev) => [newKB, ...prev]);
  const updateKnowledgeBank = (updatedKB: KnowledgeBank) => setKnowledgeBanks(prev => prev.map(kb => kb.id === updatedKB.id ? updatedKB : kb));
  const deleteKnowledgeBank = (id: string) => setKnowledgeBanks(prev => prev.filter(kb => kb.id !== id));
  
  const addScripts = (newScripts: Script[]) => setScripts((prev) => [...newScripts, ...prev]);
  const updateScript = (updatedScript: Script) => setScripts(prev => prev.map(s => s.id === updatedScript.id ? updatedScript : s));
  const deleteScript = (id: string) => setScripts(prev => prev.filter(s => s.id !== id));
  const addAgentLog = (log: AgentLog) => setAgentLogs((prev) => [log, ...prev]);
  const updateAgentLog = (updatedLog: AgentLog) => setAgentLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  
  const addBot = (bot: Bot) => setBots(prev => [bot, ...prev]);
  const updateBot = (updatedBot: Bot) => setBots(prev => prev.map(b => b.id === updatedBot.id ? updatedBot : b));

  const addEscalationRule = (rule: EscalationRule) => setEscalationRules(prev => [rule, ...prev]);
  const updateEscalationRule = (rule: EscalationRule) => setEscalationRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  const deleteEscalationRule = (id: string) => setEscalationRules(prev => prev.filter(r => r.id !== id));

  const addTaxonomyItems = (newItems: TaxonomyCategory[]) => {
    setTaxonomy(prev => {
      const existingNames = new Set(prev.map(t => t.name.toLowerCase()));
      const filteredNew = newItems.filter(item => !existingNames.has(item.name.toLowerCase()));
      return [...prev, ...filteredNew];
    });
  };

  return (
    <HashRouter>
      <Routes>
          <Route path="/" element={<Layout lang={lang} onLangChange={setLang} onReset={() => { localStorage.clear(); window.location.reload(); }} />}>
            <Route index element={<Dashboard lang={lang} activeModel={activeModel} onModelChange={setActiveModel} knowledgeBanks={knowledgeBanks} scripts={scripts} agentLogs={agentLogs} />} />
            <Route path="bot-factory" element={<BotFactory lang={lang} activeModel={activeModel} knowledgeBanks={knowledgeBanks} bots={bots} scripts={scripts} escalationRules={escalationRules} onAddBot={addBot} onUpdateBot={updateBot} onAddLog={addAgentLog} onAddScripts={addScripts} />} />
            <Route path="knowledge-banks" element={<KnowledgeBanks lang={lang} knowledgeBanks={knowledgeBanks} onAddKB={addKnowledgeBank} onUpdateKB={updateKnowledgeBank} onDeleteKB={deleteKnowledgeBank} taxonomy={taxonomy} scripts={scripts} />} />
            <Route path="data-sources" element={<DataSources lang={lang} activeModel={activeModel} knowledgeBanks={knowledgeBanks} taxonomy={taxonomy} onScriptsAdded={addScripts} onTaxonomyAdded={addTaxonomyItems} />} />
            <Route path="script-library" element={<ScriptLibrary lang={lang} scripts={scripts} onUpdateScript={updateScript} onDeleteScript={deleteScript} />} />
            <Route path="taxonomy" element={<TaxonomyManager lang={lang} activeModel={activeModel} taxonomy={taxonomy} knowledgeBanks={knowledgeBanks} scripts={scripts} onUpdate={setTaxonomy} onAddScripts={addScripts} />} />
            <Route path="agent-logs" element={<AgentLogs lang={lang} activeModel={activeModel} logs={agentLogs} scripts={scripts} taxonomy={taxonomy} knowledgeBanks={knowledgeBanks} onAddLog={addAgentLog} onUpdateLog={updateAgentLog} onAddScripts={addScripts} />} />
            <Route path="escalation-rules" element={<EscalationManager lang={lang} rules={escalationRules} onAddRule={addEscalationRule} onUpdateRule={updateEscalationRule} onDeleteRule={deleteEscalationRule} />} />
            <Route path="integrations" element={<IntegrationHub lang={lang} />} />
            <Route path="system-settings" element={
              <SystemSettings 
                lang={lang}
                activeModel={activeModel} 
                onModelChange={setActiveModel}
                temperature={temperature}
                onTemperatureChange={setTemperature}
                topP={topP}
                onTopPChange={setTopP}
              />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;