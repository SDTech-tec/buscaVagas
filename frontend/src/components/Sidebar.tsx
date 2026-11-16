import React from 'react';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Briefcase,
  FileText,
  Kanban,
  Building2,
  UserCheck,
  History,
  Sliders,
  TerminalSquare,
  MessageSquare
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'buscar'
  | 'novas'
  | 'catalogo'
  | 'preparacao'
  | 'candidaturas'
  | 'curriculos'
  | 'empresas'
  | 'perfil'
  | 'historico_runs'
  | 'configuracoes'
  | 'logs';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  newJobsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, newJobsCount }) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'buscar', label: 'Pesquisar & Validar', icon: <Search className="w-5 h-5" /> },
    { id: 'novas', label: 'Novas Oportunidades', icon: <Sparkles className="w-5 h-5 text-amber-400" />, badge: newJobsCount },
    { id: 'catalogo', label: 'Catálogo de Vagas', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'preparacao', label: 'Respostas Vencedoras', icon: <MessageSquare className="w-5 h-5 text-blue-400" /> },
    { id: 'candidaturas', label: 'Minhas Candidaturas', icon: <Kanban className="w-5 h-5" /> },
    { id: 'curriculos', label: 'Currículo Inteligente', icon: <FileText className="w-5 h-5" /> },
    { id: 'empresas', label: 'Empresas & Fontes', icon: <Building2 className="w-5 h-5" /> },
    { id: 'perfil', label: 'Perfil Profissional', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'historico_runs', label: 'Histórico de Buscas', icon: <History className="w-5 h-5" /> },
    { id: 'configuracoes', label: 'Pisos & Configurações', icon: <Sliders className="w-5 h-5" /> },
    { id: 'logs', label: 'Logs & Diagnóstico', icon: <TerminalSquare className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="py-4">
        <div className="px-5 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Navegação Principal
        </div>
        <nav className="space-y-1 px-3">
          {menuItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
        <div className="font-semibold text-slate-300">Acesso Pessoal: Pedro Paulo</div>
        <div className="text-[11px] text-slate-400 mt-0.5">Fuso: America/Sao_Paulo</div>
        <div className="text-[11px] text-slate-400">Base: Aracaju/SE</div>
      </div>
    </aside>
  );
};
