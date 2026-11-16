import { BaseConnector } from './BaseConnector.js';
import { RawJob, VerificationResult, JobModality } from '../../types/index.js';

export class AshbyConnector implements BaseConnector {
  public atsType = 'ashby';

  public async fetchCompanyJobs(companySlug: string, companyName: string): Promise<RawJob[]> {
    const cleanSlug = companySlug.replace(/^https?:\/\/.*?\//, '').split('/')[0].split('?')[0];
    const url = `https://api.ashbyhq.com/posting-api/job-board/${cleanSlug}`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'VagaCerta/1.0' },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) return [];

      const data = await response.json() as { jobs: any[] };
      const jobs = data.jobs || [];

      return jobs.map(j => {
        let modality: JobModality = 'Modalidade a confirmar';
        if (j.isRemote) modality = 'Remoto';
        else if (j.location && j.location.toLowerCase().includes('hybrid')) modality = 'Híbrido';
        else if (j.location) modality = 'Presencial';

        return {
          atsJobId: j.id,
          companyName: companyName || cleanSlug,
          title: j.title,
          officialUrl: j.jobUrl || `https://jobs.ashbyhq.com/${cleanSlug}/${j.id}`,
          atsType: 'ashby',
          modality,
          regime: 'CLT',
          locationCity: j.location || '',
          locationCountry: 'Brasil',
          publishedAt: j.publishedAt || new Date().toISOString(),
          descriptionFull: j.descriptionHtml || '',
          applyUrl: j.jobUrl || `https://jobs.ashbyhq.com/${cleanSlug}/${j.id}/application`
        };
      });
    } catch (err) {
      console.error(`Erro ao consultar Ashby para ${companySlug}:`, err);
      return [];
    }
  }

  public async fetchJobDetails(officialUrl: string): Promise<{ rawJob: RawJob; verification: VerificationResult }> {
    try {
      const match = officialUrl.match(/jobs\.ashbyhq\.com\/([^\/]+)\/([a-f0-9\-]+)/i);
      if (match) {
        const companySlug = match[1];
        const jobId = match[2];
        const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${companySlug}`;

        const apiRes = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
        if (apiRes.ok) {
          const data = await apiRes.json() as { jobs: any[] };
          const job = (data.jobs || []).find(j => j.id === jobId);
          if (job) {
            return {
              rawJob: {
                atsJobId: job.id,
                companyName: companySlug,
                title: job.title,
                officialUrl: job.jobUrl || officialUrl,
                atsType: 'ashby',
                modality: job.isRemote ? 'Remoto' : 'Modalidade a confirmar',
                regime: 'CLT',
                locationCity: job.location || '',
                descriptionFull: job.descriptionHtml || '',
                applyUrl: job.jobUrl || `${officialUrl}/application`
              },
              verification: {
                isOpen: true,
                httpStatus: 200,
                applyButtonFound: true,
                officialDomainVerified: true,
                evidenceSummary: `Publicação oficial validada via API do Ashby Job Board. ID: ${job.id}.`
              }
            };
          }
        }
      }

      const res = await fetch(officialUrl, { signal: AbortSignal.timeout(8000) });
      return {
        rawJob: { companyName: 'Ashby Partner', title: 'Vaga', officialUrl, atsType: 'ashby' },
        verification: {
          isOpen: res.ok,
          httpStatus: res.status,
          applyButtonFound: res.ok,
          officialDomainVerified: officialUrl.includes('ashbyhq.com'),
          evidenceSummary: `Verificação web no domínio do Ashby. Status HTTP: ${res.status}.`
        }
      };
    } catch (err: any) {
      return {
        rawJob: { companyName: 'Erro', title: 'Erro', officialUrl, atsType: 'ashby' },
        verification: {
          isOpen: false,
          httpStatus: 0,
          applyButtonFound: false,
          officialDomainVerified: officialUrl.includes('ashbyhq.com'),
          evidenceSummary: `Erro ao verificar Ashby: ${err.message}`
        }
      };
    }
  }

  public async verifyUrl(url: string): Promise<VerificationResult> {
    const details = await this.fetchJobDetails(url);
    return details.verification;
  }
}

