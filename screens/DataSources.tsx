
import React, { useState, useRef, useMemo } from 'react';
import { KnowledgeBank, Script, TaxonomyCategory } from '../types';
import { processBatchWithUAE } from '../services/aiService';
import * as XLSX from 'xlsx';

// Initialize PDF.js worker
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

interface DataSourcesProps {
  knowledgeBanks: KnowledgeBank[];
  taxonomy: TaxonomyCategory[];
  onScriptsAdded: (scripts: Script[]) => void;
  onTaxonomyAdded: (items: TaxonomyCategory[]) => void;
  activeModel: string;
}

const DataSources: React.FC<DataSourcesProps> = ({ knowledgeBanks, taxonomy, onScriptsAdded, onTaxonomyAdded, activeModel }) => {
  const [activeInput, setActiveInput] = useState<'upload' | 'text' | 'drive' | 'api' | null>(null);
  const [rawText, setRawText] = useState('');
  const [selectedKB, setSelectedKB] = useState('');
  const [targetTaxonomyId, setTargetTaxonomyId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ msg: string; type: 'info' | 'success' | 'error' | 'wait' }[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTaxonomy = useMemo(() => {
    if (!selectedKB) return [];
    return taxonomy.filter(t => !t.parentId);
  }, [selectedKB, taxonomy]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' | 'wait' = 'info') => {
    setLogs(prev => [{ msg, type }, ...prev]);
  };

  const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else current += char;
    }
    result.push(current.trim());
    return result;
  };

  const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
      setProgress(Math.round((i / pdf.numPages) * 30)); // First 30% for extraction
    }
    return fullText;
  };

  const handleIngest = async () => {
    const isUpload = activeInput === 'upload';
    const currentKB = knowledgeBanks.find(k => k.id === selectedKB);
    if (!selectedKB || (isUpload && !uploadedFile) || (!isUpload && !rawText)) {
      alert("Lütfen tüm alanları doldurun ve dosya seçin.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    addLog("UAE Master Engine Başlatıldı...", "info");
    
    try {
      let rowsToProcess: { title: string; content: string; providedCategory?: string }[] = [];
      let finalParentId = targetTaxonomyId || currentKB?.taxonomyCategoryId;

      if (isUpload && uploadedFile) {
        addLog(`Dosya Okunuyor: ${uploadedFile.name}`, "info");
        const fileName = uploadedFile.name.toLowerCase();

        if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
          const fileText = await uploadedFile.text();
          const rawLines = fileText.split(/\r?\n/).filter(l => l.trim().length > 0);
          
          if (rawLines.length === 0) throw new Error("Dosya boş.");

          const headerLine = splitCSVLine(rawLines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, ''));
          const catIdx = headerLine.findIndex(h => h.includes('kategori') || h.includes('category') || h.includes('sınıf'));
          const titleIdx = headerLine.findIndex(h => h.includes('başlık') || h.includes('title'));
          const contentIdx = headerLine.findIndex(h => h.includes('içerik') || h.includes('content'));

          const dataLines = (catIdx !== -1 || titleIdx !== -1 || contentIdx !== -1) ? rawLines.slice(1) : rawLines;
          rowsToProcess = dataLines.map(line => {
            const parts = splitCSVLine(line).map(p => p.replace(/^"|"$/g, ''));
            return { 
              title: titleIdx !== -1 ? parts[titleIdx] : parts[0] || '', 
              content: contentIdx !== -1 ? parts[contentIdx] : parts[1] || parts[0] || '',
              providedCategory: catIdx !== -1 ? parts[catIdx] : undefined
            };
          }).filter(r => r.content.trim().length > 0);
        } 
        else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          const data = await uploadedFile.arrayBuffer();
          const workbook = XLSX.read(data);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          rowsToProcess = jsonData.map(row => ({
            title: row.Başlık || row.Title || row.title || row.baslik || '',
            content: row.İçerik || row.Content || row.content || row.icerik || Object.values(row).join(' '),
            providedCategory: row.Kategori || row.Category || row.category || row.kategori
          })).filter(r => r.content.trim().length > 0);
        }
        else if (fileName.endsWith('.pdf')) {
          const pdfText = await parsePDF(uploadedFile);
          // Split PDF text into manageable chunks (paragraphs)
          const chunks = pdfText.split(/\n\s*\n/).filter(c => c.trim().length > 20);
          rowsToProcess = chunks.map(chunk => ({
            title: chunk.slice(0, 50) + '...',
            content: chunk,
            providedCategory: 'PDF Import'
          }));
        }
        else {
          throw new Error("Desteklenmeyen dosya formatı.");
        }
      } else {
        rowsToProcess = [{ title: 'Manuel Giriş', content: rawText }];
      }

      if (rowsToProcess.length === 0) throw new Error("İşlenecek veri bulunamadı.");
      addLog(`${rowsToProcess.length} birim veri tespit edildi.`, "success");

      const newTaxonomyItems: TaxonomyCategory[] = [];
      if (!finalParentId) {
        const groupName = uploadedFile ? uploadedFile.name.toUpperCase() : "YENİ VERİ GRUBU";
        finalParentId = `ROOT-GRP-${Date.now()}`;
        newTaxonomyItems.push({ id: finalParentId, name: groupName, count: 0, type: 'CATEGORY' });
        addLog(`Grup Oluşturuldu: ${groupName}`, "success");
      }

      const batchSize = 5;
      const allScripts: Script[] = [];
      
      for (let i = 0; i < rowsToProcess.length; i += batchSize) {
        const currentBatch = rowsToProcess.slice(i, i + batchSize);
        addLog(`Analiz Ediliyor: [${i+1}-${Math.min(i+batchSize, rowsToProcess.length)}]`, "wait");
        
        // Gemini API Call (using service)
        const results = await processBatchWithUAE(currentBatch, taxonomy, taxonomy.find(t => t.id === finalParentId!)?.name, activeModel);
        
        results.forEach((analysis, idx) => {
          const catNameFromData = currentBatch[idx].providedCategory || analysis.category || 'Genel';
          const alreadyCreatedInThisSession = newTaxonomyItems.find(t => t.parentId === finalParentId && t.name.toLowerCase() === catNameFromData.toLowerCase());
          
          if (!alreadyCreatedInThisSession) {
            newTaxonomyItems.push({
              id: `BRANCH-${Date.now()}-${idx}`,
              name: catNameFromData,
              parentId: finalParentId,
              count: 1,
              type: 'CATEGORY'
            });
            addLog(`Yeni Kategori Saptandı: ${catNameFromData}`, "info");
          }

          allScripts.push({
            id: `INGEST-${Date.now()}-${i + idx}`,
            content: currentBatch[idx].content,
            primaryIntent: analysis.intent,
            category: catNameFromData,
            keywords: analysis.keywords || [],
            confidence: analysis.confidence || 0.7,
            status: 'PROCESSED',
            kbId: selectedKB
          });
        });

        setProgress(30 + Math.round(((i + batchSize) / rowsToProcess.length) * 70));
        await new Promise(r => setTimeout(r, 400));
      }

      if (newTaxonomyItems.length > 0) onTaxonomyAdded(newTaxonomyItems);
      onScriptsAdded(allScripts);
      addLog(`İşlem Başarıyla Tamamlandı!`, "success");
      setIsProcessing(false);
    } catch (e: any) {
      addLog(`Kritik Hata: ${e.message || 'API Bağlantısı Hatası'}`, "error");
      setIsProcessing(false);
    }
  };

  if (!activeInput) {
    return (
      <div className="p-10 max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Veri Girişi & Eğitim Merkezi</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest opacity-60">Knowledge Bank Ingestion Controller</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 'upload', name: 'Toplu Döküman', icon: 'upload_file', desc: 'PDF, XLSX, CSV, TXT...', color: 'blue' },
            { id: 'text', name: 'Hızlı Metin', icon: 'auto_awesome', desc: 'Manual data entry', color: 'emerald' },
            { id: 'drive', name: 'Cloud Sync', icon: 'cloud_sync', desc: 'Google Drive, S3...', color: 'purple' },
            { id: 'api', name: 'Canlı Akış (API)', icon: 'dynamic_feed', desc: 'Real-time ingestion', color: 'amber' },
          ].map((s) => (
            <button key={s.id} onClick={() => setActiveInput(s.id as any)} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-2xl hover:-translate-y-1 transition-all text-center space-y-4 group">
              <div className={`size-16 rounded-[1.25rem] bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-sm`}>
                <span className="material-symbols-outlined text-[32px]">{s.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] flex bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveInput(null)} className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-sm transition-all"><span className="material-symbols-outlined">arrow_back</span></button>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">INGEST - {activeInput.toUpperCase()}</h1>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
          <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8 flex flex-col gap-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-6 shrink-0">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hedef Banka (Target Bank)</label>
                <select className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all" value={selectedKB} onChange={(e) => setSelectedKB(e.target.value)}>
                  <option value="">Seçim Yapın...</option>
                  {knowledgeBanks.map(kb => <option key={kb.id} value={kb.id}>{kb.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kök Taksonomi (Root Taxonomy)</label>
                <select className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all" value={targetTaxonomyId} onChange={(e) => setTargetTaxonomyId(e.target.value)}>
                  <option value="">Yeni Grup Olarak Başlat</option>
                  {availableTaxonomy.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {activeInput === 'upload' ? (
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()} 
                  className={`h-full border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${uploadedFile ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 bg-slate-50/30 hover:bg-blue-50/30 hover:border-blue-200'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} className="hidden" accept=".csv,.txt,.pdf,.xlsx,.xls" />
                  <div className={`size-20 rounded-full flex items-center justify-center shadow-lg transition-all ${uploadedFile ? 'bg-emerald-600 text-white' : 'bg-white text-slate-300'}`}>
                    <span className="material-symbols-outlined text-[40px]">{uploadedFile ? 'check_circle' : 'cloud_upload'}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-900">{uploadedFile ? uploadedFile.name : 'Dosyayı Sürükleyin veya Seçin'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">DESTEKLENEN: PDF, XLSX, CSV, TXT</p>
                  </div>
                </div>
              ) : (
                <textarea className="w-full h-full bg-slate-50 border-none rounded-[2rem] p-8 text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all resize-none shadow-inner ring-1 ring-slate-100" placeholder="İşlenecek ham veriyi buraya yapıştırın..." value={rawText} onChange={(e) => setRawText(e.target.value)} />
              )}
            </div>

            <div className="shrink-0 flex justify-end">
              <button 
                onClick={handleIngest} 
                disabled={isProcessing || !selectedKB || (activeInput === 'upload' && !uploadedFile)} 
                className="bg-blue-600 text-white font-black py-5 px-16 rounded-2xl shadow-2xl hover:bg-blue-700 transition-all disabled:opacity-30 uppercase text-[12px] tracking-widest active:scale-95"
              >
                {isProcessing ? 'İŞLENİYOR...' : 'VERİYİ İŞLEMEK İÇİN ÇALIŞTIR'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 rounded-[2rem] p-6 flex flex-col overflow-hidden shadow-2xl relative border border-white/5">
            <div className="flex justify-between items-center mb-6 shrink-0 px-2">
              <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em]">UAE CONSOLE LOGS</h3>
              {isProcessing && <div className="flex gap-1"><div className="size-1.5 bg-blue-500 rounded-full animate-ping"></div></div>}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar px-2 pr-4 font-mono">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <span className="material-symbols-outlined text-[80px] text-white">psychology_alt</span>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest mt-4">Waiting for task...</p>
                </div>
              ) : logs.map((log, i) => (
                <div key={i} className="text-[11px] leading-relaxed animate-in fade-in slide-in-from-right-4 duration-300 group border-b border-white/5 pb-2">
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] font-black ${log.type === 'success' ? 'text-emerald-400' : log.type === 'error' ? 'text-red-400' : log.type === 'wait' ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`}>
                      {new Date().toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} 
                    </span>
                    <span className={`text-slate-300 uppercase tracking-tighter ${log.type === 'error' ? 'font-black' : 'font-medium'}`}>
                      {log.msg}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {isProcessing && (
              <div className="pt-6 shrink-0 px-2">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress: {progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSources;
