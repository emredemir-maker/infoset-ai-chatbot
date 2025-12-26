
import React, { useState } from 'react';
import { Script } from '../types';

interface ScriptLibraryProps {
  scripts: Script[];
  onUpdateScript: (script: Script) => void;
  onDeleteScript: (id: string) => void;
}

const ScriptLibrary: React.FC<ScriptLibraryProps> = ({ scripts, onUpdateScript, onDeleteScript }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  
  const filteredScripts = scripts.filter(s => 
    s.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.primaryIntent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleGolden = (script: Script) => {
    onUpdateScript({
      ...script,
      isGolden: !script.isGolden,
      confidence: !script.isGolden ? 1.0 : script.confidence
    });
  };

  const handleSaveEdit = () => {
    if (editingScript) {
      onUpdateScript(editingScript);
      setEditingScript(null);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bu bilgi parçacığını kütüphaneden kalıcı olarak silmek istediğinize emin misiniz?')) {
      onDeleteScript(id);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <span>Knowledge Base</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-blue-600">Script Library</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Script Kütüphanesi</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">UAE tarafından işlenmiş ve onaylanmış bilgi parçacıkları.</p>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold w-64 text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10"
            placeholder="Scriptlerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 pb-20">
        {filteredScripts.length > 0 ? filteredScripts.map((script) => (
          <div key={script.id} className={`bg-white rounded-2xl border p-6 shadow-sm hover:border-blue-300 transition-all group flex flex-col md:flex-row gap-8 relative overflow-hidden ${script.isGolden ? 'border-amber-200 ring-2 ring-amber-100/50' : 'border-slate-200'}`}>
            <div className="md:w-1/4 shrink-0 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono font-black text-slate-300 uppercase">{script.id}</span>
                <div className="flex gap-2">
                  {script.isGolden && (
                    <span className="px-2 py-1 rounded-lg text-[8px] font-black bg-amber-50 text-amber-600 uppercase border border-amber-100 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px] fill">star</span> ALTIN
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-blue-50 text-blue-600 uppercase border border-blue-100">{script.category}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Niyet (Intent)</p>
                <p className="text-xs font-black text-slate-900 leading-tight">{script.primaryIntent}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Güven Skoru</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${script.isGolden ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${script.confidence * 100}%` }}></div>
                  </div>
                  <span className={`text-[10px] font-black ${script.isGolden ? 'text-amber-600' : 'text-emerald-600'}`}>%{Math.round(script.confidence * 100)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {script.keywords.slice(0, 4).map(k => (
                  <span key={k} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded border border-slate-200 uppercase tracking-tighter">#{k}</span>
                ))}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className={`p-4 rounded-xl border min-h-[100px] ${script.isGolden ? 'bg-amber-50/30 border-amber-50' : 'bg-slate-50/50 border-slate-100'}`}>
                <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{script.content}</p>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleToggleGolden(script)}
                  className={`size-8 rounded-lg border flex items-center justify-center transition-all shadow-sm ${script.isGolden ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'}`}
                  title="Altın Veri Yap"
                >
                  <span className={`material-symbols-outlined text-[18px] ${script.isGolden ? 'fill' : ''}`}>star</span>
                </button>
                <button 
                  onClick={() => setEditingScript(script)} 
                  className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                  title="Düzenle"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(script.id)} 
                  className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 transition-all shadow-sm"
                  title="Sil"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center opacity-30">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">code_blocks</span>
            <p className="text-xs font-black uppercase tracking-widest">Kütüphane Boş</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Script Düzenle</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">İşlenmiş bilgiyi kütüphanede güncelleyin</p>
                 </div>
                 <button onClick={() => setEditingScript(null)} className="size-10 rounded-xl hover:bg-slate-100 text-slate-400 flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-[24px]">close</span>
                 </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Niyet (Intent)</label>
                       <input 
                         className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                         value={editingScript.primaryIntent}
                         onChange={(e) => setEditingScript({...editingScript, primaryIntent: e.target.value})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                       <input 
                         className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                         value={editingScript.category}
                         onChange={(e) => setEditingScript({...editingScript, category: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">İçerik / Bilgi</label>
                    <textarea 
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-5 py-4 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all min-h-[150px] resize-none leading-relaxed"
                      value={editingScript.content}
                      onChange={(e) => setEditingScript({...editingScript, content: e.target.value})}
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Etiketler (Keywords - Virgülle ayırın)</label>
                    <input 
                      className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                      value={editingScript.keywords.join(', ')}
                      onChange={(e) => setEditingScript({...editingScript, keywords: e.target.value.split(',').map(k => k.trim())})}
                    />
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/30">
                 <button onClick={() => setEditingScript(null)} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-900 transition-colors uppercase text-[10px] tracking-widest">Vazgeç</button>
                 <button 
                  onClick={handleSaveEdit}
                  className="px-10 py-2.5 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 uppercase text-[10px] tracking-widest"
                 >
                    Değişiklikleri Kaydet
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScriptLibrary;
