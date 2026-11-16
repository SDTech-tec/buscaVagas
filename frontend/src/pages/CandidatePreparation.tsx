import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Building2,
  Briefcase,
  HelpCircle,
  AlertCircle,
  Send,
  Zap,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';

export const CandidatePreparation: React.FC<{
  onViewJobById?: (id: string) => void;
}> = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Assistente Interativo de Perguntas Livres
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswerResult, setCustomAnswerResult] = useState<any | null>(null);
  const [generatingCustom, setGeneratingCustom] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs({ category: 'qualificadas' });
      setJobs(data);
      if (data.length > 0) {
        setSelectedJobId(data[0].id);
        loadJobAnswers(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao listar vagas:', err);
    }
  };

  const loadJobAnswers = async (jobId: string) => {
    try {
      setLoading(true);
      const fullJob = await api.getJobById(jobId);
      setAnswers(fullJob.application_answers || []);
    } catch (err) {
      console.error('Erro ao carregar respostas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    loadJobAnswers(id);
    setCustomAnswerResult(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const currentJob = jobs.find(j => j.id === selectedJobId);
    try {
      setGeneratingCustom(true);
      const res = await api.generateCustomAnswer(
        customQuestion.trim(),
        currentJob?.company_name || 'Empresa',
        currentJob?.title || 'Vaga'
      );
      setCustomAnswerResult(res);
    } catch (err) {
      console.error('Erro ao gerar resposta:', err);
    } finally {
      setGeneratingCustom(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Motor de Alta Conversão em Processos Seletivos</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Preparação Inteligente de Candidatura & Respostas Vencedoras
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Gere respostas estratégicas em 1ª pessoa para as perguntas mais frequentes de recrutamento, fundamentadas estritamente nas suas realizações práticas na 1Doc (suporte avançado, APIs REST, fluxos no n8n e SQL/PostgreSQL).
        </p>
      </div>

      {/* Selector de Vaga Contextual */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Personalizar Respostas para a Oportunidade:
        </label>
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={selectedJobId}
            onChange={(e) => handleSelectJob(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.company_name} — {j.title} ({j.modality} • {j.regime})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assistente Interativo de Perguntas Livres (Q&A Solver) */}
      <div className="bg-gradient-to-tr from-slate-900 to-navy-900 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-700/60">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold tracking-tight text-white">
            Assistente Interativo de Formulários de Candidatura
          </h3>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
            NOVO
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Copie qualquer pergunta específica do formulário da Gupy, Greenhouse, LinkedIn ou entrevista e receba a melhor resposta persuasiva para que você seja selecionado.
        </p>

        <form onSubmit={handleGenerateCustom} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ex: Como você soluciona um incidente crítico com cliente quando o prazo está estourado?"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={generatingCustom}
              className={`px-6 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center space-x-1.5 ${
                generatingCustom ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{generatingCustom ? 'Criando Resposta...' : 'Gerar Resposta'}</span>
            </button>
          </div>
        </form>

        {/* Exibição da Resposta Customizada Gerada */}
        {customAnswerResult && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-amber-400">
                Resposta Sugerida em 1ª Pessoa ({customAnswerResult.charCount} caracteres)
              </span>
              <button
                onClick={() => handleCopy('custom_gen', customAnswerResult.suggestedAnswer)}
                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  copiedId === 'custom_gen' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {copiedId === 'custom_gen' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                <span>{copiedId === 'custom_gen' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {customAnswerResult.suggestedAnswer}
            </div>
            {customAnswerResult.needsUserConfirmation && (
              <div className="text-[11px] text-amber-300 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{customAnswerResult.needsUserConfirmation}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bateria Completa das 12+ Perguntas Mais Frequentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Perguntas Mais Frequentes & Respostas Prontas para a Vaga</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {answers.length} respostas mapeadas
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 space-x-2 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Formatando respostas personalizadas para {selectedJob?.company_name}...</span>
          </div>
        ) : answers.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
            Nenhuma resposta gerada ainda para esta oportunidade.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {answers.map((ans, idx) => {
              const isCopied = copiedId === ans.id;

              return (
                <div
                  key={ans.id || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {ans.question_type?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Confiança: {ans.confidence_level}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {ans.char_count} caracteres
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {ans.question_prompt}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleCopy(ans.id || String(idx), ans.suggested_answer)}
                      className={`shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                    {ans.suggested_answer}
                  </div>

                  {ans.needs_user_confirmation && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong className="font-semibold">Atenção antes de submeter: </strong>
                        {ans.needs_user_confirmation}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

