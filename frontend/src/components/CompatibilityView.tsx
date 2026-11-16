import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Info, ThumbsUp, ShieldAlert } from 'lucide-react';
import { JobCompatibility } from '../types';

interface CompatibilityViewProps {
  compatibility?: JobCompatibility;
}

export const CompatibilityView: React.FC<CompatibilityViewProps> = ({ compatibility }) => {
  if (!compatibility) {
    return (
      <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        Análise de compatibilidade não gerada.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Banner de Nível */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        compatibility.level === 'Alta'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : compatibility.level === 'Média'
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : 'bg-slate-100 border-slate-300 text-slate-900'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
            compatibility.level === 'Alta'
              ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md'
              : compatibility.level === 'Média'
              ? 'bg-amber-500 text-white shadow-amber-200 shadow-md'
              : 'bg-slate-600 text-white'
          }`}>
            {compatibility.score}%
          </div>
          <div>
            <h4 className="text-base font-bold">Compatibilidade {compatibility.level}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{compatibility.recommendation}</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
          Perfil: Pedro Paulo (1Doc)
        </span>
      </div>

      {/* Pontos de Correspondência / Requisitos Atendidos */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5" />
          Pontos Fortes de Correspondência Comprovada
        </h4>
        <div className="space-y-1.5">
          {compatibility.matching_points.map((p, idx) => (
            <div key={idx} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-emerald-900 flex items-start space-x-2 text-xs">
              <span className="font-bold text-emerald-600 shrink-0">✓</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requisitos Não Comprovados / Gaps (Regra de Ouro: NÃO INVENTAR) */}
      {compatibility.mandatory_unproven && compatibility.mandatory_unproven.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2 flex items-center">
            <XCircle className="w-4 h-4 text-red-600 mr-1.5" />
            Requisitos da Vaga Não Constantes no Perfil (Não Inventar)
          </h4>
          <div className="space-y-1.5">
            {compatibility.mandatory_unproven.map((u, idx) => (
              <div key={idx} className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-red-900 flex items-start space-x-2 text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{u}</span>
                  <div className="text-[11px] text-red-700 mt-0.5">
                    O candidato não possui essa competência cadastrada. Não alegar experiência prévia na candidatura.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diferenciais Ausentes */}
      {compatibility.missing_desirables && compatibility.missing_desirables.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5" />
            Diferenciais / Desejáveis Ausentes (Não eliminatórios)
          </h4>
          <div className="space-y-1">
            {compatibility.missing_desirables.map((d, idx) => (
              <div key={idx} className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-900 text-xs">
                • {d}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pontos de Atenção */}
      {compatibility.attention_points && compatibility.attention_points.length > 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
            <Info className="w-4 h-4 text-slate-500 mr-1.5" />
            Pontos de Atenção para a Entrevista
          </div>
          <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1">
            {compatibility.attention_points.map((a, idx) => (
              <li key={idx}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

