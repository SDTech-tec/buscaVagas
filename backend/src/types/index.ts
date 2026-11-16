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
  atsType: 'gupy' | 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'direct';
  regime?: JobRegime;
  modality?: JobModality;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryRaw?: string;
  publishedAt?: string;
  responsibilities?: string;
  requirements?: string;
  desirable?: string;
  benefits?: string;
  descriptionFull?: string;
  questionForm?: any[];
  applyUrl?: string;
}

export interface VerificationResult {
  isOpen: boolean;
  httpStatus: number;
  applyButtonFound: boolean;
  officialDomainVerified: boolean;
  evidenceSummary: string;
  rawMetadata?: any;
}

export interface SalaryCheckResult {
  meetsFloor: boolean;
  status: JobStatus;
  salaryNotes: string;
  salaryDisclosed: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  discardReason?: string;
}

export interface CompatibilityAnalysis {
  score: number;
  level: CompatibilityLevel;
  matchingPoints: string[];
  mandatoryFulfilled: string[];
  mandatoryPartial: string[];
  mandatoryUnproven: string[];
  missingDesirables: string[];
  attentionPoints: string[];
  recommendation: string;
}

export interface ApplicationAnswer {
  questionType: string;
  questionPrompt: string;
  suggestedAnswer: string;
  charCount: number;
  confidenceLevel: 'Alta' | 'Média' | 'Baixa';
  needsUserConfirmation?: string;
}

