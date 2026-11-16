import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Plus,
  ExternalLink,
  Calendar,
  MessageSquare,
  DollarSign,
  FileText,
  Clock,
  MoreVertical,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { JobApplication, Job } from '../types';
import { api } from '../services/api';

const KANBAN_COLUMNS = [
  { id: 'Interessante', title: 'Interessante', color: 'bg-slate-100 text-slate-700' },
  { id: 'A revisar', title: 'A Revisar', color: 'bg-amber-100 text-amber-800' },
  { id: 'Aprovada pelo candidato', title: 'Aprovada', color: 'bg-blue-100 text-blue-800' },
  { id: 'Candidatura realizada pelo candidato', title: 'Candidatura Realizada', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'Entrevista agendada', title: 'Entrevista Agendada', color: 'bg-purple-100 text-purple-800' },
  { id: 'Em processo seletivo', title: 'Em Processo', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'Contratado', title: 'Contratado!', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'Reprovada', title: 'Reprovada', color: 'bg-red-100 text-red-800' },
  { id: 'Encerrada', title: 'Encerrada', color: 'bg-slate-200 text-slate-600' },
  { id: 'Desistência', title: 'Desistência', color: 'bg-slate-200 text-slate-600' }
];

export const ApplicationsKanban: React.FC<{
  onViewJobById: (id: string) => void;
}> = ({ onViewJobById }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Erro ao carregar candidaturas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (app: JobApplication, newStatus: string) => {
    try {
      await api.saveApplication({
        job_id: app.job_id,
        status: newStatus
      });
      loadApplications();
    } catch (err) {
      console.error('Erro ao mover status:', err);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      await api.saveApplication(editingApp);
      setEditingApp(null);
      loadApplications();
    } catch (err) {
      console.error('Erro ao salvar candidatura:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Acompanhamento das Candidaturas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie cada oportunidade pelo funil seletivo de 10 estados com anotações de entrevistas e pretensão informada.
          </p>
        </div>

        <button
          onClick={loadApplications}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Funil</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-500 space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-xs">Carregando funil de candidaturas...</span>
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-6">
          {KANBAN_COLUMNS.map((col) => {
            const items = applications.filter((a) => a.status === col.id);

            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-2xl">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.color}`}>
                      {items.length}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800">{col.title}</h4>
                  </div>
                </div>

                {/* Cards List */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {items.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Nenhuma vaga
                    </div>
                  ) : (
                    items.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-400 transition-all cursor-pointer"
                        onClick={() => setEditingApp(app)}
                      >
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          {app.company_name}
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {app.job_title}
                        </h5>

                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 pt-1">
                          {app.modality && (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                              {app.modality}
                            </span>
                          )}
                          {app.regime && (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                              {app.regime}
                            </span>
                          )}
                        </div>

                        {app.salary_claim && (
                          <div className="text-[11px] text-emerald-700 font-semibold flex items-center pt-0.5">
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            Pretensão: {app.salary_claim}
                          </div>
                        )}

                        {app.interview_at && (
                          <div className="text-[11px] text-purple-700 font-semibold flex items-center pt-0.5">
                            <Calendar className="w-3 h-3 mr-1" />
                            Entrevista: {new Date(app.interview_at).toLocaleDateString('pt-BR')}
                          </div>
                        )}

                        {/* Move Status Quick Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <select
                            value={app.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(app, e.target.value)}
                            className="text-[10px] p-1 border border-slate-200 rounded bg-slate-50 text-slate-700 focus:outline-none"
                          >
                            {KANBAN_COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                Mover para {c.title}
                              </option>
                            ))}
                          </select>

                          {app.official_url && (
                            <a
                              href={app.official_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Abrir página oficial"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveModal}
            className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {editingApp.company_name}
                </span>
                <h3 className="text-base font-bold text-slate-900">{editingApp.job_title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status da Candidatura</label>
                <select
                  value={editingApp.status}
                  onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  {KANBAN_COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pretensão Salarial Informada</label>
                  <input
                    type="text"
                    value={editingApp.salary_claim || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, salary_claim: e.target.value })}
                    placeholder="Ex: R$ 4.500,00 CLT"
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data da Entrevista</label>
                  <input
                    type="date"
                    value={editingApp.interview_at?.split('T')[0] || ''}
                    onChange={(e) => setEditingApp({ ...editingApp, interview_at: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Versão de Currículo Enviada</label>
                <select
                  value={editingApp.resume_version_used || 'Geral'}
                  onChange={(e) => setEditingApp({ ...editingApp, resume_version_used: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Geral">Currículo Geral — TI</option>
                  <option value="Suporte">Direcionado — Suporte Técnico</option>
                  <option value="Integração">Direcionado — Integração de Sistemas</option>
                  <option value="Automação">Direcionado — Automação & n8n</option>
                  <option value="Implantação">Direcionado — Implantação de Sistemas</option>
                  <option value="Dados">Direcionado — Migração de Dados</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Próxima Etapa / Ações</label>
                <input
                  type="text"
                  value={editingApp.next_step || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, next_step: e.target.value })}
                  placeholder="Ex: Entrevista com gestor técnico na quinta-feira"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Anotações do Candidato</label>
                <textarea
                  rows={3}
                  value={editingApp.notes || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, notes: e.target.value })}
                  placeholder="Pontos abordados na conversa, perguntas feitas pelo recrutador..."
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onViewJobById(editingApp.job_id);
                  setEditingApp(null);
                }}
                className="text-blue-600 font-bold hover:underline"
              >
                Ver Detalhes da Vaga
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

