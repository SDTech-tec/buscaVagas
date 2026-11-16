import React, { useState, useEffect } from 'react';
import { Building2, Plus, Globe, ExternalLink, ShieldCheck, Trash2, RefreshCw } from 'lucide-react';
import { Company } from '../types';
import { api } from '../services/api';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: '',
    domain: '',
    website_url: '',
    career_url: '',
    ats_type: 'gupy',
    ats_slug: '',
    ats_evidence: '',
    notes: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCompany(newCompany);
      setShowAddModal(false);
      setNewCompany({
        name: '',
        domain: '',
        website_url: '',
        career_url: '',
        ats_type: 'gupy',
        ats_slug: '',
        ats_evidence: '',
        notes: ''
      });
      loadCompanies();
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover esta empresa do monitoramento?')) {
      await api.deleteCompany(id);
      loadCompanies();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Empresas & Portais Oficiais Monitorados</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de empresas contratantes com comprovação oficial de vínculo entre o domínio corporativo e o ATS.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Empresa</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Carregando diretório de empresas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {comp.domain}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                  </div>

                  <span className="inline-flex items-center text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {comp.ats_type.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  {comp.career_url && (
                    <a
                      href={comp.career_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1 truncate"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{comp.career_url}</span>
                    </a>
                  )}

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-700 font-semibold">Vínculo Comprovado: </strong>
                    {comp.ats_evidence || 'Portal oficial verificado.'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Última checagem:{' '}
                  {comp.last_checked_at
                    ? new Date(comp.last_checked_at).toLocaleDateString('pt-BR')
                    : 'Pendente'}
                </span>

                <button
                  onClick={() => handleDelete(comp.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remover empresa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Empresa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Cadastrar Empresa & Portal de Carreiras</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Ex: Stone Pagamentos"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domínio Institucional</label>
                  <input
                    type="text"
                    required
                    value={newCompany.domain}
                    onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                    placeholder="Ex: stone.co"
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sistema ATS</label>
                  <select
                    value={newCompany.ats_type}
                    onChange={(e) => setNewCompany({ ...newCompany, ats_type: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="gupy">Gupy</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="lever">Lever</option>
                    <option value="ashby">Ashby</option>
                    <option value="direct">Crawler Direto de Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug do ATS ou Token do Board</label>
                <input
                  type="text"
                  value={newCompany.ats_slug || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, ats_slug: e.target.value })}
                  placeholder="Ex: stone (para stone.gupy.io) ou gitlab (para greenhouse)"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Oficial de Carreiras</label>
                <input
                  type="url"
                  value={newCompany.career_url || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, career_url: e.target.value })}
                  placeholder="Ex: https://stone.gupy.io/"
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Evidência de Vínculo Oficial</label>
                <textarea
                  rows={2}
                  value={newCompany.ats_evidence || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, ats_evidence: e.target.value })}
                  placeholder="Ex: Subdomínio corporativo verificado e linkado a partir do rodapé institucional."
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
              >
                Salvar Empresa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

