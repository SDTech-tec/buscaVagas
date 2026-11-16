import React from 'react';
import { ShieldCheck, RefreshCw, User } from 'lucide-react';

interface HeaderProps {
  onTriggerSearch: () => void;
  isSearching: boolean;
  onNavigateProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onTriggerSearch, isSearching, onNavigateProfile }) => {
  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 px-6 py-3.5 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-inner font-bold text-xl text-white">
          VC
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">Vaga Certa</h1>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-medium flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" /> Acesso Direto • Pedro Paulo
            </span>
          </div>
          <p className="text-xs text-slate-300">Recrutador Digital Pessoal & Validação Direta nas Empresas</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onTriggerSearch}
          disabled={isSearching}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            isSearching
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
          <span>{isSearching ? 'Buscando Fontes...' : 'Buscar Vagas Agora'}</span>
        </button>

        <div className="h-7 w-px bg-slate-700"></div>

        <button
          onClick={onNavigateProfile}
          className="flex items-center space-x-3 pl-2 hover:opacity-90 transition-opacity text-left cursor-pointer"
          title="Ver Meu Perfil Profissional"
        >
          <div className="w-9 h-9 rounded-full bg-blue-700 border border-blue-500 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-100">Pedro Paulo</div>
            <div className="text-emerald-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
              Perfil Ativo • Aracaju/SE
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
