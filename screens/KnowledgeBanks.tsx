
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KnowledgeBank, KBStatus, TaxonomyCategory, Script } from '../types';

interface KnowledgeBanksProps {
  lang: 'tr' | 'en';
  knowledgeBanks: KnowledgeBank[];
  onAddKB: (kb: KnowledgeBank) => void;
  onUpdateKB: (kb: KnowledgeBank) => void;
  onDeleteKB: (id: string) => void;
  taxonomy: TaxonomyCategory[];
  scripts: Script[];
}

const KnowledgeBanks: React.FC<KnowledgeBanksProps> = ({ lang, knowledgeBanks, onAddKB, onUpdateKB, onDeleteKB, taxonomy, scripts }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingKB, setEditingKB] = useState<KnowledgeBank | null>(null);
  const [newKBName, setNewKBName] = useState('');
  const [newKBDesc, setNewKBDesc] = useState('');
  const [newKBTags, setNewKBTags] = useState('');
  const [selectedTaxonomyId, setSelectedTaxonomyId] = useState('');

  const t = {
    tr: {
      title: 'BİLGİ BANKALARI',
      sub: 'VERİLERİNİZİ KATEGORİZE ETMEK İÇİN AKILLI KONTEYNERLAR OLUŞTURUN.',
      newBtn: 'Yeni Banka Oluştur',
      colName: 'Banka Adı',
      colStatus: 'Durum',
      colType: 'Türü',
      colActions: 'Hızlı İşlemler',
      empty: 'Henüz Tanımlı Bilgi Bankası Yok',
      modalNew: 'Yeni Bilgi Bankası',
      modalEdit: 'Banka Yapılandırması',
      modalSub: 'Sistem parametrelerini belirleyin.',
      labelName: 'Banka Adı',
      labelTax: 'Taksonomi Grubu',
      labelDesc: 'Açıklama & Notlar',
      save: 'BANKAYI KAYDET',
      cancel: 'İptal',
      global: 'Global / Atanmamış'
    },
    en: {
      title: 'KNOWLEDGE BANKS',
      sub: 'CREATE SMART CONTAINERS TO CATEGORIZE YOUR DATASETS.',
      newBtn: 'Create New Bank',
      colName: 'Bank Name',
      colStatus: 'Status',
      colType: 'Type',
      colActions: 'Quick Actions',
      empty: 'No Knowledge Banks Defined Yet',
      modalNew: 'New Knowledge Bank',
      modalEdit: 'Bank Configuration',
      modalSub: 'Define system parameters.',
      labelName: 'Bank Name',
      labelTax: 'Taxonomy Group',
      labelDesc: 'Description & Notes',
      save: 'SAVE BANK',
      cancel: 'Cancel',
      global: 'Global / Unassigned'
    }
  }[lang];

  const taxonomyGroups = useMemo(() => taxonomy.filter(t => !t.parentId), [taxonomy]);

  const handleOpenEdit = (kb: KnowledgeBank) => {
    setEditingKB(kb); setNewKBName(kb.name); setNewKBDesc(kb.description); setNewKBTags(kb.tags.join(', '));
    setSelectedTaxonomyId(kb.taxonomyCategoryId || ''); setShowModal(true);
  };

  const handleSaveKB = () => {
    if (!newKBName) return;
    const tagsArray = newKBTags ? newKBTags.split(',').map(t => t.trim()) : ['Genel'];
    if (editingKB) {
      onUpdateKB({ ...editingKB, name: newKBName, description: newKBDesc, tags: tagsArray, taxonomyCategoryId: selectedTaxonomyId || undefined });
    } else {
      onAddKB({ id: `KB-${Math.floor(Math.random() * 9000) + 1000}`, name: newKBName, description: newKBDesc || '...', status: KBStatus.READY, documentCount: 0, agentCount: 0, lastUpdated: 'Now', thumbnail: '', tags: tagsArray, taxonomyCategoryId: selectedTaxonomyId || undefined });
    }
    setShowModal(false); setNewKBName(''); setNewKBDesc('');
  };

  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{t.title}</h1>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 opacity-80">{t.sub}</p>
        </div>
        <button onClick={() => { setEditingKB(null); setNewKBName(''); setNewKBDesc(''); setShowModal(true); }} className="bg-blue-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 text-xs tracking-widest uppercase">
          <span className="material-symbols-outlined text-[24px]">add</span> {t.newBtn}
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.colName}</th>
              <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">{t.colStatus}</th>
              <th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.colType}</th>
              <th className="px-10 py-7 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {knowledgeBanks.length > 0 ? knowledgeBanks.map((kb) => (
              <tr key={kb.id} className="group hover:bg-blue-50/20 transition-all cursor-pointer">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-6">
                    <div className="size-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-all shadow-sm">
                      <span className="material-symbols-outlined text-[28px]">database</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-black text-slate-950 uppercase tracking-tight">{kb.name}</span>
                      <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{kb.documentCount} Kayıt • ID: {kb.id}</span>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 text-center">
                  <span className="px-5 py-1.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest shadow-sm">
                    {kb.status}
                  </span>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="material-symbols-outlined text-[22px] text-blue-500/50">hub</span>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                      {taxonomyGroups.find(t => t.id === kb.taxonomyCategoryId)?.name || t.global}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end gap-3"><button onClick={() => handleOpenEdit(kb)} className="size-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"><span className="material-symbols-outlined text-[22px]">edit</span></button><button onClick={() => onDeleteKB(kb.id)} className="size-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"><span className="material-symbols-outlined text-[22px]">delete</span></button></div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-40 text-center opacity-20"><span className="material-symbols-outlined text-[80px] text-slate-200 mb-6">database_off</span><p className="text-[14px] font-black uppercase tracking-[0.4em]">{t.empty}</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl p-12 border border-slate-200 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-10">
                <div><h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">{editingKB ? t.modalEdit : t.modalNew}</h3><p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t.modalSub}</p></div>
                <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-slate-950 transition-colors"><span className="material-symbols-outlined text-[32px]">close</span></button>
              </div>
              <div className="space-y-8">
                 <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">{t.labelName}</label><input className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-base font-bold text-slate-950 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" value={newKBName} onChange={(e) => setNewKBName(e.target.value)} /></div>
                 <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">{t.labelTax}</label><select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4.5 text-base font-bold text-slate-950 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all outline-none" value={selectedTaxonomyId} onChange={(e) => setSelectedTaxonomyId(e.target.value)}><option value="">{t.global}</option>{taxonomyGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                 <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">{t.labelDesc}</label><textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-base font-medium text-slate-950 focus:bg-white focus:ring-4 focus:ring-blue-600/10 transition-all min-h-[160px] outline-none resize-none leading-relaxed shadow-inner" value={newKBDesc} onChange={(e) => setNewKBDesc(e.target.value)} /></div>
              </div>
              <div className="mt-12 flex justify-end gap-6">
                 <button onClick={() => setShowModal(false)} className="px-8 py-4 text-[12px] font-black text-slate-400 hover:text-slate-950 uppercase tracking-widest transition-colors">{t.cancel}</button>
                 <button onClick={handleSaveKB} className="px-14 py-4.5 bg-blue-600 text-white text-[12px] font-black rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-700 uppercase tracking-[0.2em] transition-all active:scale-95">{t.save}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBanks;
