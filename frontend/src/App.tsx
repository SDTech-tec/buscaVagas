import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { SearchJobs } from './pages/SearchJobs';
import { JobsList } from './pages/JobsList';
import { CandidatePreparation } from './pages/CandidatePreparation';
import { ApplicationsKanban } from './pages/ApplicationsKanban';
import { Resumes } from './pages/Resumes';
import { Companies } from './pages/Companies';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Logs } from './pages/Logs';
import { JobDetailsModal } from './components/JobDetailsModal';
import { Job } from './types';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'evidence' | 'compatibility' | 'answers'>('overview');
  const [isSearching, setIsSearching] = useState(false);
  const [newJobsCount, setNewJobsCount] = useState(0);

  useEffect(() => {
    loadNewJobsCount();
  }, []);

  const loadNewJobsCount = async () => {
    try {
      const data = await api.getDashboard();
      setNewJobsCount(data.vagas_novas || 0);
    } catch (err) {
      console.error('Erro ao buscar contagem de novas vagas:', err);
    }
  };

  const handleTriggerSearch = async () => {
    try {
      setIsSearching(true);
      await api.triggerSearch();
      setTimeout(async () => {
        await loadNewJobsCount();
        setIsSearching(false);
      }, 5000);
    } catch (err) {
      console.error('Erro ao disparar busca:', err);
      setIsSearching(false);
    }
  };

  const handleViewJob = async (job: Job) => {
    try {
      const fullJob = await api.getJobById(job.id);
      setSelectedJob(fullJob);
      setModalInitialTab('overview');
    } catch {
      setSelectedJob(job);
      setModalInitialTab('overview');
    }
  };

  const handlePrepareAnswers = async (job: Job) => {
    try {
      const fullJob = await api.getJobById(job.id);
      setSelectedJob(fullJob);
      setModalInitialTab('answers');
    } catch {
      setSelectedJob(job);
      setModalInitialTab('answers');
    }
  };

  const handleToggleSave = async (id: string) => {
    try {
      await api.toggleSaveJob(id);
      if (selectedJob && selectedJob.id === id) {
        setSelectedJob({ ...selectedJob, is_saved: selectedJob.is_saved ? 0 : 1 });
      }
    } catch (err) {
      console.error('Erro ao salvar vaga:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        onTriggerSearch={handleTriggerSearch}
        isSearching={isSearching}
        onNavigateProfile={() => setCurrentTab('perfil')}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          newJobsCount={newJobsCount}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)]">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={setCurrentTab}
              onViewJob={handleViewJob}
              onPrepareAnswers={handlePrepareAnswers}
              onToggleSave={handleToggleSave}
              onTriggerSearch={handleTriggerSearch}
              isSearching={isSearching}
            />
          )}

          {currentTab === 'buscar' && (
            <SearchJobs
              onTriggerSearch={handleTriggerSearch}
              isSearching={isSearching}
            />
          )}

          {currentTab === 'novas' && (
            <JobsList
              initialCategory="novas"
              title="Novas Oportunidades Oficiais"
              description="Vagas recém-descobertas e validadas diretamente nos portais oficiais das empresas contratantes."
              onViewJob={handleViewJob}
              onPrepareAnswers={handlePrepareAnswers}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentTab === 'catalogo' && (
            <JobsList
              initialCategory="qualificadas"
              title="Catálogo Geral de Oportunidades"
              description="Filtre e explore todas as vagas validadas, com remuneração a confirmar ou mantidas no histórico."
              onViewJob={handleViewJob}
              onPrepareAnswers={handlePrepareAnswers}
              onToggleSave={handleToggleSave}
            />
          )}

          {currentTab === 'preparacao' && (
            <CandidatePreparation
              onViewJobById={(id) => {
                api.getJobById(id).then(j => {
                  setSelectedJob(j);
                  setModalInitialTab('answers');
                });
              }}
            />
          )}

          {currentTab === 'candidaturas' && (
            <ApplicationsKanban
              onViewJobById={(id) => {
                api.getJobById(id).then(j => {
                  setSelectedJob(j);
                  setModalInitialTab('overview');
                });
              }}
            />
          )}

          {currentTab === 'curriculos' && <Resumes />}

          {currentTab === 'empresas' && <Companies />}

          {currentTab === 'perfil' && <Profile />}

          {currentTab === 'historico_runs' && <Logs />}

          {currentTab === 'configuracoes' && <Settings />}

          {currentTab === 'logs' && <Logs />}
        </main>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onToggleSave={handleToggleSave}
          defaultTab={modalInitialTab}
        />
      )}
    </div>
  );
}
