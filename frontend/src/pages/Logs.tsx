import React, { useState, useEffect } from 'react';
import { TerminalSquare, RefreshCw, Clock, ShieldCheck, CheckCircle2, AlertOctagon, History } from 'lucide-react';
import { api } from '../services/api';

export const Logs: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, l] = await Promise.all([
        api.getSearchRuns(),
        api.getLogs()
      ]);
      setRuns(r);
      setLogs(l);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Histórico de Buscas & Logs de Auditoria</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de auditoria de cada varredura realizada e diagnósticos das conexões HTTP.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Histórico de Execuções de Pesquisa */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2 flex items-center space-x-2">
          <History className="w-4 h-4 text-blue-600" />
          <span>Varreduras Automatizadas e Manuais Recentes</span>
        </h3>

        {runs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">Nenhuma varredura registrada ainda.</div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <div
                key={run.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                      Gatilho: {run.trigger_type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        run.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : run.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {run.status.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-slate-400 text-[11px] flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(run.started_at).toLocaleString('pt-BR')}
                  </span>
                </div>

                <p className="text-slate-700 font-medium leading-relaxed">{run.summary}</p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1 text-[11px] text-slate-600">
                  <span className="p-1.5 bg-white rounded border border-slate-200 text-center">
                    Empresas: <strong>{run.companies_checked}</strong>
                  </span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 text-center">
                    Encontradas: <strong>{run.jobs_found}</strong>
                  </span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 text-center">
                    Validadas: <strong>{run.jobs_validated}</strong>
                  </span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 text-center text-amber-700">
                    A Confirmar: <strong>{run.jobs_salary_to_confirm}</strong>
                  </span>
                  <span className="p-1.5 bg-white rounded border border-slate-200 text-center text-red-700">
                    Descartadas: <strong>{run.jobs_discarded}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logs do Sistema */}
      <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl shadow-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-slate-400">
            <TerminalSquare className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Console de Auditoria & Eventos</span>
          </div>
          <span className="text-[10px] text-slate-500">Node.js Express + SQLite WAL</span>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="text-[11px] leading-relaxed flex items-start space-x-2">
              <span className="text-slate-500 shrink-0">
                [{new Date(log.created_at).toLocaleTimeString('pt-BR')}]
              </span>
              <span className={`font-bold shrink-0 ${
                log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                [{log.source}]
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-600">Nenhum evento registrado no console.</div>
          )}
        </div>
      </div>
    </div>
  );
};

