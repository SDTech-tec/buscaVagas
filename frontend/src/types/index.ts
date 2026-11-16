export type JobStatus =
  | 'nova'
  | 'aberta_validada'
  | 'remuneracao_a_confirmar'
  | 'em_analise'
  | 'candidatura_encerrada'
  | 'vaga_removida'
  | 'link_indisponivel'
  | 'nao_verificada'
  | 'repetida'
  | 'descartada_salario'
  | 'descartada_modalidade'
  | 'descartada_tecnica'
  | 'historico_conhecida';

export type JobModality = 'Remoto' | 'Híbrido' | 'Presencial' | 'Modalidade a confirmar';
export type JobRegime = 'CLT' | 'PJ' | 'Regime a confirmar';
export type CompatibilityLevel = 'Alta' | 'Média' | 'Baixa';

export interface RawJob {
  atsJobId?: string;
  companyName: string;
  title: string;
  officialUrl: string;
  atsType: string;
  regime?: string;
  modality?: string;
  locationCity?: string;
  locationState?: string;
  salaryRaw?: string;
  descriptionFull?: string;
}

export interface VerificationResult {
  isOpen: boolean;
  httpStatus: number;
  applyButtonFound: boolean;
  officialDomainVerified: boolean;
  evidenceSummary: string;
  rawMetadata?: any;
}

export interface Job {
  id: string;
  ats_job_id?: string;
  company_id?: string;
  company_name: string;
  title: string;
  official_url: string;
  canonical_url: string;
  ats_type: string;
  regime: JobRegime;
  modality: JobModality;
  location_city: string;
  location_state: string;
  location_country: string;
  is_aracaju_viable: number;
  salary_disclosed: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_raw?: string;
  salary_notes?: string;
  meets_salary_floor: number;
  status: JobStatus;
  compatibility_level: CompatibilityLevel;
  compatibility_score: number;
  published_at?: string;
  discovered_at: string;
  last_verified_at: string;
  responsibilities_raw?: string;
  requirements_raw?: string;
  desirable_raw?: string;
  benefits_raw?: string;
  description_full?: string;
  question_form_json?: string;
  apply_button_verified: number;
  discard_reason?: string;
  is_new: number;
  is_saved: number;
  created_at: string;
  evidence?: JobEvidence;
  compatibility?: JobCompatibility;
  application_answers?: ApplicationAnswerItem[];
  application?: JobApplication;
}

export interface JobEvidence {
  id: string;
  job_id: string;
  url_checked: string;
  domain: string;
  ats_system: string;
  ats_evidence_text: string;
  http_status: number;
  checked_at: string;
  is_active_official: number;
  apply_button_found: number;
  apply_url?: string;
  evidence_summary: string;
  raw_metadata_json?: string;
}

export interface JobCompatibility {
  score: number;
  level: CompatibilityLevel;
  matching_points: string[];
  mandatory_fulfilled: string[];
  mandatory_partial: string[];
  mandatory_unproven: string[];
  missing_desirables: string[];
  attention_points: string[];
  recommendation: string;
}

export interface ApplicationAnswerItem {
  id: string;
  job_id: string;
  question_type: string;
  question_prompt: string;
  suggested_answer: string;
  char_count: number;
  confidence_level: 'Alta' | 'Média' | 'Baixa';
  needs_user_confirmation?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  job_title?: string;
  company_name?: string;
  official_url?: string;
  modality?: string;
  regime?: string;
  salary_notes?: string;
  status: string;
  applied_at?: string;
  interview_at?: string;
  resume_version_used?: string;
  salary_claim?: string;
  responses_used?: string;
  next_step?: string;
  notes?: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  website_url?: string;
  career_url?: string;
  ats_type: string;
  ats_slug?: string;
  ats_evidence?: string;
  verified_link: number;
  last_checked_at?: string;
  status: string;
  notes?: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  location: string;
  linkedin_url?: string;
  email?: string;
  phone?: string;
  summary: string;
  experience: any[];
  education: any[];
  skills: {
    suporte_atendimento: string[];
    infraestrutura_redes: string[];
    integracao_automacao: string[];
    banco_dados: string[];
  };
  preferences: {
    travel_availability: boolean;
    relocation_availability: boolean;
    contract_types: string[];
    preferred_modality: string;
    viable_hybrid_location: string;
    notes?: string;
  };
  updated_at: string;
}

export interface DashboardMetrics {
  ultima_pesquisa: {
    data: string;
    resumo: string;
    status: string;
  } | null;
  proxima_pesquisa: string;
  empresas_consultadas: number;
  vagas_encontradas: number;
  vagas_validadas: number;
  vagas_novas: number;
  vagas_descartadas: number;
  vagas_remuneracao_a_confirmar: number;
  vagas_historico: number;
  candidaturas_em_andamento: number;
}
