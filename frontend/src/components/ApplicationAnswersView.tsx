import React, { useState } from 'react';
import { Copy, Check, MessageSquare, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { ApplicationAnswerItem } from '../types';

interface ApplicationAnswersViewProps {
  answers?: ApplicationAnswerItem[];
  companyName: string;
  jobTitle: string;
}

export const ApplicationAnswersView: React.FC<ApplicationAnswersViewProps> = ({
  answers = [],
  companyName,
  jobTitle
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!answers || answers.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        Nenhuma resposta pré-gerada para esta vaga.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start space-x-3 text-blue-950">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">Respostas Personalizadas em Primeira Pessoa</h4>
          <p className="text-xs text-blue-800 mt-1">
            Respostas elaboradas estritamente com base nas experiências reais cadastradas na 1Doc (suporte, integração via APIs, automação com n8n, SQL/PostgreSQL). Nenhuma competência fictícia foi inventada.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {answers.map((ans) => {
          const isCopied = copiedId === ans.id;

          return (
            <div
              key={ans.id}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    {ans.question_type.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      ans.confidence_level === 'Alta'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ans.confidence_level === 'Média'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Confiança: {ans.confidence_level}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {ans.char_count} caracteres
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(ans.id, ans.suggested_answer)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                  }`}
                  title="Copiar resposta para a área de transferência"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copiar Resposta</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                {ans.question_prompt}
              </div>

              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 text-slate-900 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {ans.suggested_answer}
              </div>

              {ans.needs_user_confirmation && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong className="font-semibold">Requer confirmação: </strong>
                    {ans.needs_user_confirmation}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

