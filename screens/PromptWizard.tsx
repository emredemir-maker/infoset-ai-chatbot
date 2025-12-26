
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PromptWizard: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
       <div className="size-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
          <span className="material-symbols-outlined text-[40px]">auto_fix</span>
       </div>
       <h1 className="text-2xl font-black text-slate-900">Prompt Sihirbazı Taşındı</h1>
       <p className="text-slate-500 max-w-md">Artık botlarınızı test ederken aynı anda prompt optimize edebilmeniz için Prompt Sihirbazı "Agent Playground" ekranına entegre edildi.</p>
       <button 
        onClick={() => navigate('/playground')}
        className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase text-xs tracking-widest"
       >
         Playground'a Git
       </button>
    </div>
  );
};

export default PromptWizard;
