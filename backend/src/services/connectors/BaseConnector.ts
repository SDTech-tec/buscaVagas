import { RawJob, VerificationResult } from '../../types/index.js';

export interface BaseConnector {
  atsType: string;
  fetchCompanyJobs(companySlugOrUrl: string, companyName: string): Promise<RawJob[]>;
  fetchJobDetails(officialUrl: string): Promise<{ rawJob: RawJob; verification: VerificationResult }>;
  verifyUrl(url: string): Promise<VerificationResult>;
}

