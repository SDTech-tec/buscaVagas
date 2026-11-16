import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'vaga_certa.db');

// Garantir que diretório de dados existe
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(DB_PATH);

// Habilitar WAL mode para alta concorrência e performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- 1. Perfil Profissional do Candidato
    CREATE TABLE IF NOT EXISTS candidate_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      linkedin_url TEXT,
      email TEXT,
      phone TEXT,
      summary TEXT,
      experience_json TEXT NOT NULL,
      education_json TEXT NOT NULL,
      skills_json TEXT NOT NULL,
      preferences_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 2. Empresas Monitoradas e Portais de Carreira
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL,
      website_url TEXT,
      career_url TEXT,
      ats_type TEXT NOT NULL, -- gupy, greenhouse, lever, ashby, workday, direct
      ats_slug TEXT,
      ats_evidence TEXT,
      verified_link INTEGER DEFAULT 1,
      last_checked_at TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TEXT NOT NULL
    );

    -- 3. Oportunidades / Vagas
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      ats_job_id TEXT,
      company_id TEXT,
      company_name TEXT NOT NULL,
      title TEXT NOT NULL,
      normalized_title TEXT,
      official_url TEXT NOT NULL UNIQUE,
      canonical_url TEXT NOT NULL,
      ats_type TEXT NOT NULL,
      regime TEXT NOT NULL, -- CLT, PJ, Regime a confirmar
      modality TEXT NOT NULL, -- Remoto, Híbrido, Presencial, Modalidade a confirmar
      location_city TEXT,
      location_state TEXT,
      location_country TEXT DEFAULT 'Brasil',
      is_aracaju_viable INTEGER DEFAULT 1,
      salary_disclosed INTEGER DEFAULT 0,
      salary_min REAL,
      salary_max REAL,
      salary_currency TEXT DEFAULT 'BRL',
      salary_raw TEXT,
      salary_notes TEXT,
      meets_salary_floor INTEGER DEFAULT 1,
      status TEXT NOT NULL, 
      -- nova, aberta_validada, remuneracao_a_confirmar, em_analise, candidatura_encerrada,
      -- vaga_removida, link_indisponivel, nao_verificada, repetida, descartada_salario,
      -- descartada_modalidade, descartada_tecnica, historico_conhecida
      compatibility_level TEXT, -- Alta, Média, Baixa
      compatibility_score INTEGER DEFAULT 0,
      published_at TEXT,
      discovered_at TEXT NOT NULL,
      last_verified_at TEXT NOT NULL,
      responsibilities_raw TEXT,
      requirements_raw TEXT,
      desirable_raw TEXT,
      benefits_raw TEXT,
      description_full TEXT,
      question_form_json TEXT,
      apply_button_verified INTEGER DEFAULT 1,
      discard_reason TEXT,
      is_new INTEGER DEFAULT 1,
      is_saved INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- 4. Ficha de Evidências e Auditoria da Vaga
    CREATE TABLE IF NOT EXISTS job_evidences (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      url_checked TEXT NOT NULL,
      domain TEXT NOT NULL,
      ats_system TEXT NOT NULL,
      ats_evidence_text TEXT,
      http_status INTEGER,
      checked_at TEXT NOT NULL,
      is_active_official INTEGER DEFAULT 1,
      apply_button_found INTEGER DEFAULT 1,
      apply_url TEXT,
      evidence_summary TEXT,
      raw_metadata_json TEXT,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- 5. Detalhamento de Compatibilidade
    CREATE TABLE IF NOT EXISTS job_compatibility_details (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL UNIQUE,
      score INTEGER NOT NULL,
      level TEXT NOT NULL,
      matching_points TEXT NOT NULL, -- JSON Array
      mandatory_fulfilled TEXT NOT NULL, -- JSON Array
      mandatory_partial TEXT NOT NULL, -- JSON Array
      mandatory_unproven TEXT NOT NULL, -- JSON Array
      missing_desirables TEXT NOT NULL, -- JSON Array
      attention_points TEXT NOT NULL, -- JSON Array
      recommendation TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- 6. Respostas Personalizadas para Candidatura
    CREATE TABLE IF NOT EXISTS application_answers (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      question_type TEXT NOT NULL,
      question_prompt TEXT NOT NULL,
      suggested_answer TEXT NOT NULL,
      char_count INTEGER NOT NULL,
      confidence_level TEXT NOT NULL, -- Alta, Média, Baixa
      needs_user_confirmation TEXT,
      generated_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- 7. Acompanhamento de Candidaturas (Funil Kanban)
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      -- Interessante, A revisar, Aprovada pelo candidato, Candidatura realizada pelo candidato,
      -- Entrevista agendada, Em processo seletivo, Reprovada, Encerrada, Desistência, Contratado
      applied_at TEXT,
      interview_at TEXT,
      resume_version_used TEXT,
      salary_claim TEXT,
      responses_used TEXT,
      next_step TEXT,
      notes TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );

    -- 8. Gerenciador de Currículos Direcionados
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      targeted_area TEXT NOT NULL, -- Geral, Suporte, Integração, Automação, Implantação, Dados
      content_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 9. Histórico de Execuções de Pesquisa (Runs)
    CREATE TABLE IF NOT EXISTS search_runs (
      id TEXT PRIMARY KEY,
      trigger_type TEXT NOT NULL, -- manual, agendada, sob_demanda
      started_at TEXT NOT NULL,
      finished_at TEXT,
      companies_checked INTEGER DEFAULT 0,
      jobs_found INTEGER DEFAULT 0,
      jobs_validated INTEGER DEFAULT 0,
      jobs_new INTEGER DEFAULT 0,
      jobs_discarded INTEGER DEFAULT 0,
      jobs_salary_to_confirm INTEGER DEFAULT 0,
      status TEXT NOT NULL, -- running, completed, failed
      summary TEXT
    );

    -- 10. Configurações do Sistema
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    );

    -- 11. Logs e Diagnóstico
    CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      level TEXT NOT NULL, -- info, warn, error
      source TEXT NOT NULL,
      message TEXT NOT NULL,
      details_json TEXT,
      created_at TEXT NOT NULL
    );

    -- Índices para buscas rápidas
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_name);
    CREATE INDEX IF NOT EXISTS idx_jobs_compatibility ON jobs(compatibility_level);
    CREATE INDEX IF NOT EXISTS idx_jobs_modality ON jobs(modality);
    CREATE INDEX IF NOT EXISTS idx_jobs_regime ON jobs(regime);
    CREATE INDEX IF NOT EXISTS idx_jobs_discovered_at ON jobs(discovered_at);
  `);
}

