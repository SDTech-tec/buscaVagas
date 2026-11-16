import React, { useState } from 'react';
import {
  Search,
  Globe,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { api } from '../services/api';
import { VerificationResult, RawJob } from '../types';

export const SearchJobs: React.FC<{
  onTriggerSearch: () => void;
  isSearching: boolean;
}> = ({ onTriggerSearch, isSearching }) => {
  const [urlToCheck, setUrlToCheck] = useState('');
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [checkResult, setCheckResult] = useState<{ rawJob: RawJob; verification: VerificationResult } | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const handleCheckUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlToCheck.trim()) return;

    try {
      setIsCheckingUrl(true);
      setCheckError(null);
      setCheckResult(null);
      const res = await api.checkUrl(urlToCheck.trim());
      setCheckResult(res);
    } catch (err: any) {
      setCheckError(err.message || 'Erro ao auditar URL');
    } finally {
      setIsCheckingUrl(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pesquisar & Validar Fontes Oficiais</h2>
        <p className="text-xs text-slate-500 mt-1">
          Dispare varreduras contínuas nas empresas cadastradas ou realize a auditoria pontual em tempo real de qualquer URL oficial.
        </p>
      </div>

      {/* Box 1: Disparo de Varredura em Fontes Oficiais */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>Varredura Completa de Fontes Oficiais</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Executar Pesquisa Automatizada em Todas as Empresas Monitoradas
          </h3>
          <p className="text-xs text-slate-500 max-w-xl">
            A aplicação consultará diretamente os portais oficiais (Gupy, Greenhouse, Lever, Ashby e crawlers diretos), aplicará as regras de deduplicação, pisos salariais e análise de perfil.
          </p>
        </div>

        <button
          onClick={onTriggerSearch}
          disabled={isSearching}
          className={`shrink-0 flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
            isSearching
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-blue-600/30'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
          <span>{isSearching ? 'Varredura em Execução...' : 'Disparar Varredura Completa'}</span>
        </button>
      </div>

      {/* Box 2: Auditoria e Validação Direta de URL Específica */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Auditoria Pontual de URL em Primeiro Nível</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Validar Imediatamente uma Página Específica de Vaga
          </h3>
          <p className="text-xs text-slate-500">
            Cole a URL oficial encontrada na internet para que o sistema consulte diretamente a página, extraia os dados e certifique se a vaga está aberta e oficial.
          </p>
        </div>

        <form onSubmit={handleCheckUrl} className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="url"
              required
              value={urlToCheck}
              onChange={(e) => setUrlToCheck(e.target.value)}
              placeholder="Exemplo: https://stone.gupy.io/jobs/123456 ou https://boards.greenhouse.io/..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={isCheckingUrl}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
              isCheckingUrl ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isCheckingUrl ? 'Consultando...' : 'Validar Vaga'}
          </button>
        </form>

        {checkError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{checkError}</span>
          </div>
        )}

        {/* Resultado da Auditoria Pontual */}
        {checkResult && (
          <div className="mt-4 p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  {checkResult.rawJob.companyName} • Sistema {checkResult.rawJob.atsType.toUpperCase()}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{checkResult.rawJob.title}</h4>
              </div>

              <div className="flex items-center space-x-2">
                {checkResult.verification.isOpen ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Vaga Aberta & Oficial
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full font-bold bg-red-100 text-red-800">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Encerrada / Indisponível
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Modalidade</span>
                <span className="font-semibold text-slate-800">{checkResult.rawJob.modality || 'A confirmar'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Regime</span>
                <span className="font-semibold text-slate-800">{checkResult.rawJob.regime || 'CLT'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Remuneração</span>
                <span className="font-semibold text-slate-800">{checkResult.rawJob.salaryRaw || 'Não divulgado'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Botão Candidatura</span>
                <span className="font-semibold text-slate-800">
                  {checkResult.verification.applyButtonFound ? 'Identificado' : 'Não encontrado'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Evidência Registrada</span>
              <p className="text-slate-700 leading-relaxed">{checkResult.verification.evidenceSummary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

