import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  ShieldCheck,
  Sparkles,
  AlertOctagon,
  Clock,
  Kanban,
  CheckCircle2,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { DashboardMetrics, Job } from '../types';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
  onViewJob: (job: Job) => void;
  onPrepareAnswers: (job: Job) => void;
  onToggleSave: (id: string) => void;
  onTriggerSearch: () => void;
  isSearching: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateTab,
  onViewJob,
  onPrepareAnswers,
  onToggleSave,
  onTriggerSearch,
  isSearching
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, j] = await Promise.all([
        api.getDashboard(),
        api.getJobs({ category: 'qualificadas' })
      ]);
      setMetrics(m);
      setRecentJobs(j.slice(0, 4));
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 space-x-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
        <span className="font-medium">Carregando painel de monitoramento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Scheduler info */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-blue-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Validador Ativo • Fuso America/Sao_Paulo</span>
          </div>
          <h2 className="text-2xl font-extrabold mt-1 tracking-tight">
            Olá, Pedro Paulo!
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Seu recrutador digital pesquisa e audita continuamente portais oficiais de carreira e sistemas homologados (Gupy, Greenhouse, Lever, Ashby).
          </p>
        </div>

        <div className="bg-navy-950/60 border border-navy-700/60 p-4 rounded-xl text-xs space-y-1.5 shrink-0 min-w-[280px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-blue-400" /> Próxima busca diária:</span>
            <span className="font-bold text-white">{metrics?.proxima_pesquisa}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Última execução:</span>
            <span className="text-slate-200">
              {metrics?.ultima_pesquisa ? new Date(metrics.ultima_pesquisa.data).toLocaleString('pt-BR') : 'Aguardando 1ª varredura'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais (Conforme Seção 17 do Requisito) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Empresas Monitoradas</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics?.empresas_consultadas || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Domínios oficiais cadastrados</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Vagas Validadas</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{metrics?.vagas_validadas || 0}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Abertas e com candidatura oficial</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Novas Oportunidades</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{metrics?.vagas_novas || 0}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Ainda não visualizadas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Em Andamento</span>
            <Kanban className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{metrics?.candidaturas_em_andamento || 0}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Candidaturas no funil</div>
        </div>
      </div>

      {/* Grid Secundária de Conformidade & Auditoria */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500">Total Encontradas</div>
          <div className="text-lg font-bold text-slate-800 mt-0.5">{metrics?.vagas_encontradas || 0}</div>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
          <div className="text-xs text-amber-800 font-semibold">Remuneração a Confirmar</div>
          <div className="text-lg font-bold text-amber-900 mt-0.5">{metrics?.vagas_remuneracao_a_confirmar || 0}</div>
        </div>

        <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-200">
          <div className="text-xs text-red-800 font-semibold">Descartadas (Piso/Modalidade)</div>
          <div className="text-lg font-bold text-red-900 mt-0.5">{metrics?.vagas_descartadas || 0}</div>
        </div>

        <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-600 font-semibold">Histórico Conhecido</div>
          <div className="text-lg font-bold text-slate-700 mt-0.5">{metrics?.vagas_historico || 0}</div>
        </div>
      </div>

      {/* Oportunidades em Destaque */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Oportunidades em Destaque</h3>
            <p className="text-xs text-slate-500">Vagas abertas e validadas com maior aderência ao seu perfil</p>
          </div>
          <button
            onClick={() => onNavigateTab('catalogo')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Ver todas ({metrics?.vagas_encontradas || 0})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700">Nenhuma vaga qualificada na lista rápida</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Clique em "Buscar Vagas Agora" para iniciar uma varredura nas páginas oficiais de carreiras das empresas monitoradas.
            </p>
            <button
              onClick={onTriggerSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm"
            >
              Iniciar Varredura em Fontes Oficiais
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={onViewJob}
                onToggleSave={onToggleSave}
                onPrepareAnswers={onPrepareAnswers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

