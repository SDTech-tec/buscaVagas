import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, RefreshCw, Bookmark, Sparkles, AlertOctagon, History } from 'lucide-react';
import { Job } from '../types';
import { api } from '../services/api';
import { JobCard } from '../components/JobCard';

interface JobsListProps {
  initialCategory?: string;
  title: string;
  description: string;
  onViewJob: (job: Job) => void;
  onPrepareAnswers: (job: Job) => void;
  onToggleSave: (id: string) => void;
}

export const JobsList: React.FC<JobsListProps> = ({
  initialCategory = 'qualificadas',
  title,
  description,
  onViewJob,
  onPrepareAnswers,
  onToggleSave
}) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modality, setModality] = useState('');
  const [regime, setRegime] = useState('');

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    loadJobs();
  }, [activeCategory, modality, regime]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getJobs({
        category: activeCategory,
        modality: modality || undefined,
        regime: regime || undefined,
        search: search || undefined
      });
      setJobs(data);
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const categories = [
    { id: 'qualificadas', label: 'Qualificadas' },
    { id: 'novas', label: 'Novas' },
    { id: 'remuneracao_a_confirmar', label: 'Remuneração a Confirmar' },
    { id: 'salvas', label: 'Salvas' },
    { id: 'descartadas', label: 'Descartadas' },
    { id: 'historico', label: 'Histórico Conhecido' },
    { id: 'todas', label: 'Todas' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        <button
          onClick={loadJobs}
          className="self-start md:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Lista</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`py-2.5 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filters Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por cargo, empresa ou tecnologia..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as modalidades</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
            <option value="Presencial">Presencial</option>
          </select>

          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os regimes</option>
            <option value="CLT">CLT</option>
            <option value="PJ">PJ</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Filtrar
          </button>
        </div>
      </form>

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-500 space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Buscando oportunidades oficiais...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">Nenhuma oportunidade encontrada nesta categoria</h4>
          <p className="text-xs text-slate-400">
            Ajuste os filtros ou execute uma nova busca para varrer mais fontes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
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
  );
};

