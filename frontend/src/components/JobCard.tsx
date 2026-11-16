import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
  onToggleSave: (id: string) => void;
  onPrepareAnswers: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onViewDetails,
  onToggleSave,
  onPrepareAnswers
}) => {
  const getCompatibilityBadge = (level: string, score: number) => {
    if (level === 'Alta') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Compatibilidade Alta ({score}%)
        </span>
      );
    }
    if (level === 'Média') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Compatibilidade Média ({score}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        Compatibilidade Baixa ({score}%)
      </span>
    );
  };

  const getModalityBadge = (modality: string) => {
    if (modality === 'Remoto') {
      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Remoto</span>;
    }
    if (modality === 'Híbrido') {
      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Híbrido</span>;
    }
    if (modality === 'Presencial') {
      return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">Presencial</span>;
    }
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">A confirmar</span>;
  };

  const isDiscarded = job.status.startsWith('descartada_');
  const isSalaryToConfirm = job.status === 'remuneracao_a_confirmar';

  return (
    <div className={`bg-white rounded-xl border transition-all hover:shadow-md p-5 flex flex-col justify-between ${
      isDiscarded ? 'border-red-200 bg-red-50/20' : 'border-slate-200 shadow-sm'
    }`}>
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {job.company_name}
              </span>
              <span className="inline-flex items-center text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                {job.ats_type.toUpperCase()} Oficial
              </span>
              {job.is_new === 1 && job.status !== 'historico_conhecida' && !isDiscarded && (
                <span className="text-[11px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  NOVA
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1 line-clamp-2 hover:text-blue-700 cursor-pointer" onClick={() => onViewDetails(job)}>
              {job.title}
            </h3>
          </div>

          <button
            onClick={() => onToggleSave(job.id)}
            className={`p-2 rounded-lg border transition-colors ${
              job.is_saved
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={job.is_saved ? 'Vaga salva nos favoritos' : 'Salvar oportunidade'}
          >
            <Bookmark className={`w-4 h-4 ${job.is_saved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Location & Details Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location_city ? `${job.location_city}, ${job.location_state || 'BR'}` : 'Brasil'}</span>
          </div>
          <span>•</span>
          {getModalityBadge(job.modality)}
          <span>•</span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {job.regime}
          </span>
        </div>

        {/* Remuneração */}
        <div className="mt-3.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-medium">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">Remuneração:</span>
            <span className={`font-semibold ${isSalaryToConfirm ? 'text-amber-700' : isDiscarded ? 'text-red-700' : 'text-slate-900'}`}>
              {job.salary_notes || job.salary_raw || 'Não divulgado'}
            </span>
          </div>
          {isSalaryToConfirm && (
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-100/70 px-2 py-0.5 rounded">
              A confirmar
            </span>
          )}
        </div>

        {/* Discard Reason Alert if any */}
        {isDiscarded && job.discard_reason && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Descartada: </span>
              {job.discard_reason}
            </div>
          </div>
        )}

        {/* Compatibility badge */}
        {!isDiscarded && (
          <div className="mt-3.5 flex items-center justify-between">
            {getCompatibilityBadge(job.compatibility_level, job.compatibility_score)}
            <span className="text-[11px] text-slate-400">
              Validada em {new Date(job.last_verified_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <a
          href={job.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          <span>Página Oficial</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>

        <div className="flex items-center space-x-2">
          {!isDiscarded && (
            <button
              onClick={() => onPrepareAnswers(job)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              Respostas
            </button>
          )}

          <button
            onClick={() => onViewDetails(job)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <span>Ver Detalhes</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

