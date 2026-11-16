import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  FileText,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Job } from '../types';
import { EvidenceSheet } from './EvidenceSheet';
import { CompatibilityView } from './CompatibilityView';
import { ApplicationAnswersView } from './ApplicationAnswersView';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onUpdateStatus?: (status: string) => void;
  defaultTab?: 'overview' | 'evidence' | 'compatibility' | 'answers';
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onToggleSave,
  onUpdateStatus,
  defaultTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'compatibility' | 'answers'>(defaultTab);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {job.company_name}
              </span>
              <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                {job.ats_type.toUpperCase()} Oficial Confirmado
              </span>
              <span className="text-xs text-slate-400">
                • ID: {job.ats_job_id || job.id.slice(0, 8)}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 leading-snug">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.location_city ? `${job.location_city}, ${job.location_state}` : 'Brasil'}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-800">{job.modality}</span>
              <span>•</span>
              <span className="font-semibold text-slate-800">{job.regime}</span>
              <span>•</span>
              <span className="flex items-center font-semibold text-emerald-700">
                <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                {job.salary_notes || job.salary_raw || 'Não divulgado'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onToggleSave(job.id)}
              className={`p-2.5 rounded-xl border transition-colors ${
                job.is_saved
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title="Salvar nos favoritos"
            >
              <Bookmark className={`w-5 h-5 ${job.is_saved ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Descrição & Requisitos</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ficha de Evidências Oficiais</span>
          </button>

          <button
            onClick={() => setActiveTab('compatibility')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'compatibility'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Análise de Compatibilidade</span>
          </button>

          <button
            onClick={() => setActiveTab('answers')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'answers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Respostas da Candidatura</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6 text-sm text-slate-800">
              {job.responsibilities_raw && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Responsabilidades e Atribuições
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed text-xs">
                    {job.responsibilities_raw}
                  </div>
                </div>
              )}

              {job.requirements_raw && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Requisitos e Qualificações
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed text-xs">
                    {job.requirements_raw}
                  </div>
                </div>
              )}

              {job.description_full && !job.responsibilities_raw && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Descrição Completa da Oportunidade
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed text-xs">
                    {job.description_full}
                  </div>
                </div>
              )}

              {job.benefits_raw && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Benefícios Informados
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    {job.benefits_raw}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <EvidenceSheet evidence={job.evidence} officialUrl={job.official_url} />
          )}

          {activeTab === 'compatibility' && (
            <CompatibilityView compatibility={job.compatibility} />
          )}

          {activeTab === 'answers' && (
            <ApplicationAnswersView
              answers={job.application_answers}
              companyName={job.company_name}
              jobTitle={job.title}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Última validação: {new Date(job.last_verified_at).toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href={job.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-900/20 transition-all active:scale-95"
            >
              <span>Acessar Candidatura Oficial</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

