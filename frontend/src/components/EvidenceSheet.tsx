import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Globe, Clock, Hash, AlertTriangle, ExternalLink } from 'lucide-react';
import { JobEvidence } from '../types';

interface EvidenceSheetProps {
  evidence?: JobEvidence;
  officialUrl: string;
}

export const EvidenceSheet: React.FC<EvidenceSheetProps> = ({ evidence, officialUrl }) => {
  if (!evidence) {
    return (
      <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        Ficha de evidências não localizada para esta oportunidade.
      </div>
    );
  }

  return (
    <div className="space-y-5 text-sm">
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start space-x-3 text-emerald-900">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-base text-emerald-950">Validação Oficial em Primeiro Nível Confirmada</h4>
          <p className="text-xs text-emerald-800 mt-1">
            Esta vaga foi consultada e validada diretamente no domínio corporativo oficial da empresa contratante ou em seu sistema oficial de recrutamento homologado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-400">Domínio Corporativo / ATS</div>
          <div className="flex items-center space-x-2 font-mono font-medium text-slate-800">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>{evidence.domain}</span>
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold">Sistema ATS:</span> {evidence.ats_system.toUpperCase()}
          </div>
          <div className="text-xs text-slate-500">
            {evidence.ats_evidence_text}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-400">Status da Verificação HTTP</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
              HTTP {evidence.http_status} OK
            </span>
            <span className="text-xs text-slate-500 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {new Date(evidence.checked_at).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-700 pt-1">
            {evidence.is_active_official ? (
              <span className="flex items-center text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Vaga Ativa e Aberta
              </span>
            ) : (
              <span className="flex items-center text-red-700 font-semibold">
                <XCircle className="w-4 h-4 mr-1 text-red-600" /> Candidaturas Encerradas
              </span>
            )}
            <span>•</span>
            {evidence.apply_button_found ? (
              <span className="flex items-center text-blue-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-1 text-blue-600" /> Botão de Candidatura Funcional
              </span>
            ) : (
              <span className="flex items-center text-amber-700 font-semibold">
                <AlertTriangle className="w-4 h-4 mr-1 text-amber-600" /> Botão não identificado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-xs font-semibold uppercase text-slate-400 mb-1.5">Resumo da Evidência Coletada</div>
        <p className="text-slate-800 text-sm leading-relaxed">{evidence.evidence_summary}</p>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="truncate mr-4">
          <div className="text-xs font-semibold uppercase text-slate-400">URL Oficial Específica da Vaga</div>
          <a
            href={evidence.url_checked}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-blue-700 hover:underline truncate block mt-0.5"
          >
            {evidence.url_checked}
          </a>
        </div>
        <a
          href={evidence.url_checked}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          <span>Acessar</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>
      </div>
    </div>
  );
};

