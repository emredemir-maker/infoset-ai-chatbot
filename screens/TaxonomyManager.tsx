
import React, { useState, useMemo, useRef } from 'react';
import { TaxonomyCategory, KnowledgeBank, Script } from '../types';
import { analyzeContentWithUAE, generateCategoryContext } from '../services/aiService';

interface TaxonomyManagerProps {
  taxonomy: TaxonomyCategory[];
  knowledgeBanks: KnowledgeBank[];
  scripts: Script[];
  onUpdate: (taxonomy: TaxonomyCategory[]) => void;
  onAddScripts: (scripts: Script[]) => void;
}

const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({ taxonomy, knowledgeBanks, scripts, onUpdate, onAddScripts }) => {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'Kategoriler' | 'Niyetler' | 'Varlıklar'>('Kategoriler');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKBId, setSelectedKBId] = useState<string>('all');
  
  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  
  // States
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('');
  const [newCatKbId, setNewCatKbId] = useState<string>('all');
  const [newCatType, setNewCatType] = useState<'CATEGORY' | 'INTENT'>('CATEGORY');
  const [importText, setImportText] = useState('');

  // Context Generation State
  const [isGeneratingContext, setIsGeneratingContext] = useState(false);

  // Script Addition State
  const [sampleScriptInput, setSampleScriptInput] = useState('');
  const [isAnalyzingScripts, setIsAnalyzingScripts] = useState(false);

  // Groups are root categories (parentId is undefined)
  const groups = useMemo(() => taxonomy.filter(t => !t.parentId), [taxonomy]);
  const activeGroup = useMemo(() => taxonomy.find(t => t.id === activeGroupId), [taxonomy, activeGroupId]);

  // Filtered Taxonomy within the active group
  const filteredTaxonomy = useMemo(() => {
    if (!activeGroupId) return [];
    
    // Get all descendants of activeGroupId
    const getDescendants = (parentId: string): string[] => {
      const children = taxonomy.filter(t => t.parentId === parentId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        ids = [...ids, ...getDescendants(c.id)];
      });
      return ids;
    };

    const groupItems = [activeGroupId, ...getDescendants(activeGroupId)];
    let result = taxonomy.filter(t => groupItems.includes(t.id));

    if (selectedKBId !== 'all') {
      result = result.filter(t => t.kbId === selectedKBId || !t.kbId);
    }
    if (searchTerm) {
      result = result.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return result;
  }, [taxonomy, activeGroupId, selectedKBId, searchTerm]);

  const selectedCategory = taxonomy.find(t => t.id === selectedId);

  // Category'ye ait mevcut scriptler (Hafıza)
  const associatedScripts = useMemo(() => {
    if (!selectedCategory) return [];
    return scripts.filter(s => s.category === selectedCategory.name);
  }, [selectedCategory, scripts]);

  const handleUpdateCategory = (id: string, updates: Partial<TaxonomyCategory>) => {
    onUpdate(taxonomy.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleGenerateContext = async () => {
    if (!selectedCategory) return;
    setIsGeneratingContext(true);
    try {
      const context = await generateCategoryContext(selectedCategory.name, associatedScripts);
      handleUpdateCategory(selectedCategory.id, { promptContext: context });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingContext(false);
    }
  };

  const openAddModal = (parentId?: string) => {
    setNewCatName('');
    setNewCatParentId(parentId || activeGroupId || '');
    setNewCatKbId(selectedKBId);
    setNewCatType('CATEGORY');
    setShowAddModal(true);
  };

  const handleAddCategorySubmit = () => {
    if (!newCatName) return;
    const newId = `cat_${Math.floor(Math.random() * 100000)}`;
    const newCat: TaxonomyCategory = {
      id: newId,
      name: newCatName,
      parentId: newCatParentId || undefined,
      kbId: newCatKbId !== 'all' ? newCatKbId : undefined,
      count: 0,
      type: newCatType,
      forceHierarchy: false,
      fewShotExamples: []
    };
    onUpdate([...taxonomy, newCat]);
    setSelectedId(newId);
    setShowAddModal(false);
    setShowNewGroupModal(false);
  };

  const handleBulkImport = () => {
    try {
      const lines = importText.split('\n').filter(l => l.trim());
      const newItems: TaxonomyCategory[] = lines.map((line, idx) => ({
        id: `bulk_${Date.now()}_${idx}`,
        name: line.trim(),
        parentId: activeGroupId || undefined,
        kbId: selectedKBId !== 'all' ? selectedKBId : undefined,
        count: 0,
        type: 'CATEGORY',
        forceHierarchy: false
      }));
      onUpdate([...taxonomy, ...newItems]);
      setShowImportModal(false);
      setImportText('');
    } catch (e) {
      alert("Hatalı format.");
    }
  };

  const handleAnalyzeAndAddScripts = async () => {
    if (!sampleScriptInput.trim() || !selectedCategory) return;
    setIsAnalyzingScripts(true);
    
    try {
      // Satırlara böl ve kısa satırları temizle
      const lines = sampleScriptInput.split('\n').filter(l => l.trim().length > 5);
      const newScripts: Script[] = [];
      
      for (const line of lines) {
        // UAE motoru ile analiz et (Gemini)
        // Kategori zaten belli olduğu için analizi buna göre optimize ediyoruz
        const analysis = await analyzeContentWithUAE(line, [selectedCategory.name]);
        
        newScripts.push({
          id: `SCR-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          content: line,
          primaryIntent: analysis.intent,
          category: selectedCategory.name, // Otomatik olarak seçili kategoriye bağla
          keywords: analysis.keywords,
          confidence: 0.95,
          status: 'PROCESSED',
          kbId: selectedCategory.kbId || activeGroup?.kbId || 'kb_general'
        });
      }

      onAddScripts(newScripts);
      setSampleScriptInput('');
      alert(`${newScripts.length} adet bilgi parçacığı UAE tarafından analiz edildi ve "${selectedCategory.name}" hafızasına eklendi.`);
    } catch (error) {
      console.error("Script analiz hatası:", error);
      alert("Analiz sırasında bir hata oluştu. Lütfen bağlantınızı kontrol edin.");
    } finally {
      setIsAnalyzingScripts(false);
    }
  };

  const renderTreeItem = (item: TaxonomyCategory, depth: number = 0) => {
    const children = filteredTaxonomy.filter(t => t.parentId === item.id);
    const isSelected = selectedId === item.id;
    if (item.id === activeGroupId && depth === 0) {
        return children.map(child => renderTreeItem(child, 0));
    }

    return (
      <div key={item.id} className="flex flex-col">
        <button
          onClick={() => setSelectedId(item.id)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
            isSelected ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'hover:bg-slate-50 text-slate-600'
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-blue-400">
              {item.type === 'CATEGORY' ? 'folder' : 'label'}
            </span>
            <span className={`text-sm font-semibold truncate ${isSelected ? 'font-black' : ''}`}>{item.name}</span>
          </div>
          <span onClick={(e) => { e.stopPropagation(); openAddModal(item.id); }} className="material-symbols-outlined text-[16px] text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">add</span>
        </button>
        {children.map(child => renderTreeItem(child, depth + 1))}
      </div>
    );
  };

  // --- VIEW 1: GROUPS GRID ---
  if (!activeGroupId) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-200">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Taksonomi Mimarisi</div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kategori Grupları</h1>
            <p className="text-slate-500 text-sm font-medium">Asistanınızın dünyayı nasıl anladığını belirleyen ana uzmanlık alanları.</p>
          </div>
          <button 
            onClick={() => { setNewCatParentId(''); setNewCatName(''); setShowNewGroupModal(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_box</span> Yeni Grup Tanımla
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => { setActiveGroupId(group.id); setSelectedId(''); }}
              className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-soft hover:shadow-2xl hover:border-blue-300 hover:-translate-y-2 transition-all cursor-pointer group flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="size-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-[36px]">hub</span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-slate-300 group-hover:text-blue-400 transition-colors uppercase tracking-widest">{group.id}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight tracking-tight">{group.name}</h3>
                <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">{group.promptContext || 'Bu uzmanlık alanı için henüz detaylı bir prompt tanımı yapılmamış.'}</p>
              </div>
              <div className="pt-8 mt-8 border-t border-slate-50 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-slate-300">folder</span> {taxonomy.filter(t => t.parentId === group.id).length} Dal</span>
                 </div>
                 <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all text-[24px]">arrow_forward</span>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setShowNewGroupModal(true)}
            className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-white transition-all min-h-[260px] group"
          >
             <span className="material-symbols-outlined text-[64px] group-hover:scale-110 transition-transform">add_circle</span>
             <span className="text-xs font-black uppercase tracking-[0.2em]">Yeni Grup Ekle</span>
          </button>
        </div>

        {/* New Group Modal */}
        {showNewGroupModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
             <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl border border-slate-200 p-12 animate-in zoom-in-95 duration-300">
                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Yeni Uzmanlık Grubu</h3>
                <p className="text-slate-500 text-sm mb-10 font-medium italic">Bu asistanınız için yeni bir dikey uzmanlık hiyerarşisi oluşturur.</p>
                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Grup Adı *</label>
                      <input 
                        autoFocus
                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-6 py-5 text-base font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all border-none ring-1 ring-slate-200"
                        placeholder="Örn: Müşteri Hizmetleri"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Knowledge Bank Bağlantısı</label>
                      <select 
                        value={newCatKbId}
                        onChange={(e) => setNewCatKbId(e.target.value)}
                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-6 py-5 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all border-none ring-1 ring-slate-200 cursor-pointer"
                      >
                         <option value="all">Global (Tüm Bankalar)</option>
                         {knowledgeBanks.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
                      </select>
                   </div>
                </div>
                <div className="mt-12 flex justify-end gap-6">
                   <button onClick={() => setShowNewGroupModal(false)} className="px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors uppercase text-xs tracking-widest">İptal</button>
                   <button 
                    onClick={handleAddCategorySubmit}
                    disabled={!newCatName.trim()}
                    className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                   >
                      Grubu Oluştur
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: GROUP DETAIL (TREE) ---
  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <button onClick={() => setActiveGroupId(null)} className="hover:text-blue-600 transition-colors">Taksonomi Grupları</button>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-blue-600">{activeGroup?.name}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pb-6 border-b border-slate-200">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveGroupId(null)} className="size-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <span className="material-symbols-outlined">arrow_back</span>
             </button>
             <h2 className="text-4xl font-black text-slate-900 tracking-tight">{activeGroup?.name} Hiyerarşisi</h2>
          </div>
          <p className="text-slate-500 text-sm font-medium pl-14 leading-relaxed max-w-2xl">Bu uzmanlık alanı altındaki kategori, niyet ve alt dalları yönetin. UAE motoru bu hiyerarşiyi baz alacaktır.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-slate-50 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">upload</span> İçeri Aktar
          </button>
          <button 
            onClick={() => openAddModal()}
            className="flex items-center gap-2 bg-blue-600 text-white font-black px-9 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[24px]">add</span> Yeni Kategori
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-card flex flex-col overflow-hidden min-h-[800px]">
        <div className="flex flex-col md:flex-row justify-between border-b border-slate-100 bg-white shadow-sm">
          <div className="flex overflow-x-auto custom-scrollbar">
            {['Kategoriler', 'Niyetler', 'Varlıklar'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-12 py-7 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
                  activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600 rounded-t-full"></div>}
              </button>
            ))}
          </div>
          <div className="px-8 py-5 flex items-center gap-4 bg-slate-50/30 border-l border-slate-100 shrink-0">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grup Bankası:</span>
             <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-600 shadow-sm">
                {knowledgeBanks.find(k => k.id === activeGroup?.kbId)?.name || 'Global'}
             </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tree View */}
          <div className="w-full md:w-80 border-r border-slate-100 flex flex-col p-8 overflow-y-auto shrink-0 bg-slate-50/20 custom-scrollbar h-[350px] md:h-auto">
            <div className="relative mb-8">
               <span className="absolute inset-y-0 left-3 flex items-center text-slate-300">
                 <span className="material-symbols-outlined text-[18px]">search</span>
               </span>
               <input 
                 className="w-full bg-white border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
                 placeholder="Dallar içinde ara..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            
            <div className="flex flex-col gap-2">
               {renderTreeItem(activeGroup!)}
            </div>

            <button 
              onClick={() => openAddModal()}
              className="mt-10 flex items-center justify-center gap-3 py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-[11px] font-black text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all uppercase tracking-widest bg-white shadow-inner"
            >
               <span className="material-symbols-outlined text-[20px]">add_circle</span> Yeni Alt Dal Ekle
            </button>
          </div>

          {/* Detail View */}
          <div className="flex-1 p-12 lg:p-16 overflow-y-auto bg-white custom-scrollbar">
            {selectedCategory ? (
              <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                      <span className="px-5 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-blue-100 shadow-sm">{selectedCategory.type}</span>
                      <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-tight">ID: {selectedCategory.id}</span>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => { if(window.confirm('Silmek istediğinize emin misiniz?')) { onUpdate(taxonomy.filter(t => t.id !== selectedId)); setSelectedId(''); } }}
                        className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <span className="material-symbols-outlined text-[22px]">delete</span>
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                   <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{selectedCategory.name}</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 pt-3">
                      <span className="material-symbols-outlined text-[18px] text-blue-400">subdirectory_arrow_right</span>
                      Üst Segment: <span className="text-slate-800">{taxonomy.find(t => t.id === selectedCategory.parentId)?.name || 'Ana Dizin'}</span>
                   </p>
                </div>

                <div className="space-y-10 pt-6">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanımlama Adı (Görünen İsim) *</label>
                      <input 
                        className="w-full bg-white border-slate-200 border-2 rounded-2xl px-8 py-5 text-xl font-bold text-slate-950 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-sm"
                        value={selectedCategory.name}
                        onChange={(e) => handleUpdateCategory(selectedCategory.id, { name: e.target.value })}
                      />
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center pr-1 pl-1">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tanım (Prompt Context)</label>
                         <div className="flex items-center gap-3">
                            <button 
                              onClick={handleGenerateContext}
                              disabled={isGeneratingContext || associatedScripts.length === 0}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 uppercase tracking-widest"
                            >
                               {isGeneratingContext ? <div className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-[16px]">auto_awesome</span>}
                               Zeka Tanımı Üret
                            </button>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest shadow-sm">AI Ağırlığı: %85</span>
                         </div>
                      </div>
                      <textarea 
                        className="w-full bg-slate-50/50 border-slate-200 border-2 rounded-[2rem] px-8 py-7 text-base font-semibold text-slate-950 min-h-[160px] leading-relaxed placeholder:text-slate-300 focus:bg-white transition-all shadow-inner focus:border-blue-600"
                        placeholder="Yapay zekanın bu kategoriyi/niyeti ne zaman seçeceğini detaylandırın. Hangi anahtar kelimeler veya konseptler bu alana girer?"
                        value={selectedCategory.promptContext || ''}
                        onChange={(e) => handleUpdateCategory(selectedCategory.id, { promptContext: e.target.value })}
                      />
                   </div>

                   <div className="space-y-8 pt-10 border-t border-slate-100">
                      <div className="flex justify-between items-center px-1">
                         <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <span className="material-symbols-outlined text-[20px] text-purple-600">memory</span>
                               Bilgi Parçacıkları (Training Data)
                            </label>
                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">Bu kategoriye ait örnek script ve hafıza verileri.</p>
                         </div>
                         <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 uppercase tracking-widest shadow-sm">
                            {associatedScripts.length} Aktif Kayıt
                         </span>
                      </div>

                      <div className="space-y-6">
                        <div className="relative group">
                           <textarea 
                             className="w-full bg-slate-50 border-slate-200 border-2 border-dashed rounded-[2.5rem] px-8 py-8 text-sm font-semibold text-slate-900 min-h-[140px] focus:bg-white focus:border-blue-400 transition-all placeholder:text-slate-400 leading-relaxed shadow-inner"
                             placeholder="Bu kategoriyi tanımlayan örnek cümleleri buraya yapıştırın. Her satır UAE motoru tarafından analiz edilip hafızaya eklenecektir..."
                             value={sampleScriptInput}
                             onChange={(e) => setSampleScriptInput(e.target.value)}
                           />
                           {sampleScriptInput.trim() && (
                             <button 
                               onClick={handleAnalyzeAndAddScripts}
                               disabled={isAnalyzingScripts}
                               className="absolute bottom-6 right-6 bg-blue-600 text-white font-black px-8 py-3 rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
                             >
                               {isAnalyzingScripts ? (
                                 <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                               ) : (
                                 <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                               )}
                               Analiz Et ve Hafızaya Al
                             </button>
                           )}
                        </div>

                        {associatedScripts.length > 0 ? (
                          <div className="grid grid-cols-1 gap-4 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                             {associatedScripts.map(script => (
                               <div key={script.id} className="p-6 bg-white border border-slate-100 rounded-3xl text-sm font-semibold text-slate-800 flex justify-between items-start group shadow-soft hover:border-blue-100 hover:bg-blue-50/10 transition-all">
                                  <p className="flex-1 leading-relaxed pr-6 italic">"{script.content}"</p>
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                     <span className="text-[9px] font-mono font-black text-slate-300 group-hover:text-blue-500 uppercase tracking-tighter">{script.id}</span>
                                     <span className="text-[9px] font-black text-emerald-500">%{Math.round(script.confidence * 100)} UAE OK</span>
                                  </div>
                               </div>
                             ))}
                          </div>
                        ) : (
                          <div className="py-16 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center opacity-40">
                             <span className="material-symbols-outlined text-[48px] mb-2 text-slate-300">database_off</span>
                             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Henüz örnek veri eklenmedi</p>
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="bg-slate-50/50 border border-slate-200 rounded-[2.5rem] p-10 flex items-center justify-between shadow-soft hover:shadow-md transition-all">
                      <div className="flex flex-col gap-2">
                         <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none">Alt Kategorilere Zorla (Force Mode)</h4>
                         <p className="text-sm text-slate-500 font-medium max-w-lg leading-relaxed">Aktif edildiğinde UAE motoru genel bir cevap yerine mutlaka tanımlı alt niyetlerden (Intent) birini seçmeye zorlanır.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer scale-110">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={selectedCategory.forceHierarchy}
                          onChange={(e) => handleUpdateCategory(selectedCategory.id, { forceHierarchy: e.target.checked })}
                        />
                        <div className="w-16 h-9 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-7 after:w-7 after:shadow-lg shadow-inner"></div>
                      </label>
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-30">
                 <div className="size-40 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 shadow-inner">
                    <span className="material-symbols-outlined text-[96px] text-slate-200">schema</span>
                 </div>
                 <p className="text-slate-900 font-black text-2xl uppercase tracking-[0.2em] leading-none">Segment Seçin</p>
                 <p className="text-slate-500 font-medium text-base max-w-sm mx-auto mt-4 leading-relaxed italic">Hiyerarşiyi düzenlemek, prompt kriterlerini girmek ve hafızaya örnek veriler eklemek için soldan bir dal seçin.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight">Yeni Alt Tanımlama</h3>
                 <button onClick={() => setShowAddModal(false)} className="size-11 rounded-xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-all">
                   <span className="material-symbols-outlined text-[24px]">close</span>
                 </button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanım Adı *</label>
                    <input 
                      autoFocus
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl px-6 py-5 text-base font-bold text-slate-950 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all border-none ring-1 ring-slate-200 shadow-sm"
                      placeholder="Örn: İade Politikası"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Hiyerarşi Tipi</label>
                    <div className="flex gap-4">
                       {['CATEGORY', 'INTENT'].map(t => (
                         <button 
                          key={t}
                          onClick={() => setNewCatType(t as any)}
                          className={`flex-1 py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${newCatType === t ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-400'}`}
                         >
                           {t === 'CATEGORY' ? 'Kategori' : 'Niyet (Intent)'}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="p-10 border-t border-slate-100 flex justify-end gap-6 bg-slate-50/50">
                 <button onClick={() => setShowAddModal(false)} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase text-[11px] tracking-widest">Vazgeç</button>
                 <button 
                  onClick={handleAddCategorySubmit}
                  disabled={!newCatName.trim()}
                  className="px-14 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-blue-600/40 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
                 >
                    Dalı Oluştur
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white rounded-[4rem] w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-12 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">Toplu İçe Aktar</h3>
                 <button onClick={() => setShowImportModal(false)} className="size-12 rounded-2xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-all">
                   <span className="material-symbols-outlined text-[32px]">close</span>
                 </button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] flex gap-5">
                    <span className="material-symbols-outlined text-blue-600 text-[32px]">info</span>
                    <p className="text-sm font-semibold text-blue-900 leading-relaxed">Bu gruba ({activeGroup?.name}) eklemek istediğiniz kategorileri her satıra bir tane gelecek şekilde yazın. Sistem otomatik olarak segmentleri oluşturacaktır.</p>
                 </div>
                 <textarea 
                   className="w-full bg-slate-50 border-slate-200 border-2 rounded-[2.5rem] px-8 py-8 text-base font-mono font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all min-h-[350px] shadow-inner"
                   placeholder={`Örn:\nİade Talepleri\nÖdeme Sorunları\nTeknik Destek\nÜrün İncelemeleri...`}
                   value={importText}
                   onChange={(e) => setImportText(e.target.value)}
                 />
              </div>
              <div className="p-12 border-t border-slate-100 flex justify-end items-center gap-8 bg-slate-50/20">
                 <button onClick={() => setShowImportModal(false)} className="text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase text-[11px] tracking-widest">İptal</button>
                 <button 
                  onClick={handleBulkImport}
                  disabled={!importText.trim()}
                  className="px-16 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-600/40 transition-all active:scale-95 flex items-center gap-3"
                 >
                    <span className="material-symbols-outlined">auto_fix</span>
                    Hiyerarşiyi Oluştur
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaxonomyManager;
