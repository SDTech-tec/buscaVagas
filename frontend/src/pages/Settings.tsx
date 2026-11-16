import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, Download, Clock, ShieldCheck, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<{ key: string; value: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.saveSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string, def = '') => settings.find(s => s.key === key)?.value || def;

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Carregando configurações...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pisos Salariais & Configurações do Sistema</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Definição de regras financeiras estritas, agendamento de pesquisas e parâmetros de auditoria.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      {/* Box Pisos Salariais */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Pisos Mínimos Obrigatórios de Remuneração
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800">Trabalho Remoto</h4>
            <div>
              <label className="block text-slate-600 mb-1">CLT Mínimo Mensal (R$)</label>
              <input
                type="number"
                value={getValue('floor_remote_clt', '2800')}
                onChange={(e) => handleChange('floor_remote_clt', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">PJ Mínimo Mensal (R$)</label>
              <input
                type="number"
                value={getValue('floor_remote_pj', '5600')}
                onChange={(e) => handleChange('floor_remote_pj', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-800 bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800">Trabalho Híbrido</h4>
            <div>
              <label className="block text-slate-600 mb-1">CLT Mínimo Mensal (R$)</label>
              <input
                type="number"
                value={getValue('floor_hybrid_clt', '2800')}
                onChange={(e) => handleChange('floor_hybrid_clt', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-800 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1">PJ Mínimo Mensal (R$)</label>
              <input
                type="number"
                value={getValue('floor_hybrid_pj', '5600')}
                onChange={(e) => handleChange('floor_hybrid_pj', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-800 bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-purple-950">Trabalho Presencial (preferencialmente Aracaju/SE)</h4>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                Sem remuneração = Descarte Obrigatório
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1">CLT Mínimo Mensal (R$)</label>
                <input
                  type="number"
                  value={getValue('floor_onsite_clt', '3500')}
                  onChange={(e) => handleChange('floor_onsite_clt', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-purple-200 font-bold text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">PJ Mínimo Mensal (R$)</label>
                <input
                  type="number"
                  value={getValue('floor_onsite_pj', '7000')}
                  onChange={(e) => handleChange('floor_onsite_pj', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-purple-200 font-bold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Box Agendador Automático */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b pb-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Agendamento de Busca Diária Automática
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Horário da Busca Diária</label>
            <input
              type="time"
              value={getValue('schedule_time', '08:00')}
              onChange={(e) => handleChange('schedule_time', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Fuso Horário</label>
            <input
              type="text"
              disabled
              value={getValue('timezone', 'America/Sao_Paulo')}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Busca Diária Automática</label>
            <select
              value={getValue('schedule_enabled', 'true')}
              onChange={(e) => handleChange('schedule_enabled', e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-bold"
            >
              <option value="true">Habilitada (Execução diária em backend)</option>
              <option value="false">Desabilitada (Somente manual)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exportação de Histórico */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Exportar Histórico de Oportunidades</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Faça download de todas as vagas, auditorias e status registrados no formato JSON.
          </p>
        </div>

        <a
          href="/api/export/jobs.json"
          download
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <Download className="w-4 h-4" />
          <span>Exportar JSON</span>
        </a>
      </div>
    </form>
  );
};

