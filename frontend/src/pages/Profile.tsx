import React, { useState, useEffect } from 'react';
import { UserCheck, Save, Plus, Trash2, ShieldAlert, CheckCircle2, Linkedin, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { CandidateProfile } from '../types';
import { api } from '../services/api';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      await api.updateProfile(profile);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="p-12 text-center text-xs text-slate-500">Carregando perfil do candidato...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Perfil Profissional do Candidato</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dados utilizados pelo motor de compatibilidade e gerador de respostas de candidatura.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Perfil atualizado com sucesso no banco de dados!</span>
        </div>
      )}

      {/* Regra de Ouro Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-950 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Diretriz de Transparência Rigorosa: </strong>
          A aplicação nunca afirmará tecnologias, certificações, idiomas ou experiências que não estejam explicitamente cadastradas aqui. Todas as respostas em 1ª pessoa utilizam apenas fatos comprovados do perfil.
        </div>
      </div>

      {/* Dados Pessoais */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2">
          Dados Pessoais & Localização
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Localização Base (Residência)</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">URL do LinkedIn</label>
            <input
              type="url"
              value={profile.linkedin_url || ''}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">E-mail de Contato</label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1 text-xs">Resumo Profissional</label>
          <textarea
            rows={3}
            value={profile.summary || ''}
            onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
            className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium"
          ></textarea>
        </div>
      </div>

      {/* Experiências Profissionais na 1Doc */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2 flex items-center justify-between">
          <span>Experiência Profissional (1Doc)</span>
          <span className="text-xs font-normal text-slate-500">março de 2022 a abril de 2026</span>
        </h3>

        <div className="space-y-4 text-xs">
          {profile.experience.map((exp, expIdx) => (
            <div key={expIdx} className="space-y-3">
              {exp.roles.map((role: any, roleIdx: number) => (
                <div key={roleIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                    <span>{role.title}</span>
                    {role.period_approx && <span className="text-xs text-slate-500 font-normal">{role.period_approx}</span>}
                  </div>
                  <textarea
                    rows={3}
                    value={role.description}
                    onChange={(e) => {
                      const updated = { ...profile };
                      updated.experience[expIdx].roles[roleIdx].description = e.target.value;
                      setProfile(updated);
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed text-slate-800 bg-white"
                  ></textarea>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Formação Acadêmica */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2">
          Formação Acadêmica
        </h3>

        <div className="space-y-3 text-xs">
          {profile.education.map((edu, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{edu.degree}</span>
                <span className="text-slate-500 text-[11px]">{edu.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conhecimentos e Tecnologias Cadastradas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs border-b pb-2">
          Conhecimentos & Tecnologias Comprovadas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 block">Suporte & Atendimento</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.skills.suporte_atendimento?.map((s, idx) => (
                <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 block">Integração & Automação</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.skills.integracao_automacao?.map((s, idx) => (
                <span key={idx} className="px-2 py-1 bg-white border border-blue-200 text-blue-800 rounded font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 block">Banco de Dados & Dados</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.skills.banco_dados?.map((s, idx) => (
                <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-700 block">Infraestrutura & Redes</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.skills.infraestrutura_redes?.map((s, idx) => (
                <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

