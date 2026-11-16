import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, Sparkles, CheckCircle2, User, Briefcase, GraduationCap, Code } from 'lucide-react';
import { api } from '../services/api';
import { CandidateProfile } from '../types';

export const Resumes: React.FC = () => {
  const [resumes, setResumes] = useState<any[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('cv_geral');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resList, prof] = await Promise.all([
        api.getResumes(),
        api.getProfile()
      ]);
      setResumes(resList);
      setProfile(prof);
    } catch (err) {
      console.error('Erro ao carregar currículos:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Carregando gerenciador de currículos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Currículos Inteligentes Direcionados</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Versões especializadas destacando experiências reais na 1Doc sem inventar nenhuma informação.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Salvar em PDF</span>
        </button>
      </div>

      {/* Select Targeted Area Pills */}
      <div className="flex flex-wrap gap-2">
        {resumes.map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedResumeId(r.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedResumeId === r.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {r.targeted_area}
          </button>
        ))}
      </div>

      {/* Preview Formatted CV */}
      {currentResume && profile && (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto space-y-6 text-slate-900 font-sans print:border-none print:shadow-none print:p-0">
          {/* CV Header */}
          <div className="border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-black tracking-tight text-navy-950 uppercase">
              {profile.name}
            </h1>
            <div className="text-blue-700 font-bold text-sm mt-1">
              {currentResume.content?.headline || 'Profissional de Tecnologia da Informação'}
            </div>
            <div className="text-xs text-slate-500 flex flex-wrap gap-4 mt-2 font-medium">
              <span>{profile.location}</span>
              <span>•</span>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                LinkedIn
              </a>
              <span>•</span>
              <span>Disponibilidade para Viagens: SIM</span>
              <span>•</span>
              <span>Modalidade Preferencial: Remoto</span>
            </div>
          </div>

          {/* Objetivo Direcionado */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Objetivo Profissional
            </h3>
            <p className="text-xs leading-relaxed text-slate-800">
              {currentResume.content?.objective}
            </p>
          </div>

          {/* Habilidades em Destaque nesta versão */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Competências Técnicas em Destaque
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {currentResume.content?.highlight_skills?.map((s: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span className="font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experiência Profissional Comprovada */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Trajetória Profissional
            </h3>
            {profile.experience.map((exp: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{exp.company}</h4>
                  <span className="text-xs font-medium text-slate-500">{exp.period}</span>
                </div>

                <div className="space-y-3 pl-3 border-l-2 border-slate-200">
                  {exp.roles.map((r: any, rIdx: number) => (
                    <div key={rIdx} className="space-y-1">
                      <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
                        <span>{r.title}</span>
                        {r.period_approx && <span className="text-[11px] font-normal text-slate-500">{r.period_approx}</span>}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {r.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Formação Acadêmica */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Formação Acadêmica
            </h3>
            <div className="space-y-2 text-xs">
              {profile.education.map((edu: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{edu.degree}</span>
                  <span className="text-slate-500">{edu.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

