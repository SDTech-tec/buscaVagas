import * as cheerio from 'cheerio';
import { BaseConnector } from './BaseConnector.js';
import { RawJob, VerificationResult, JobModality } from '../../types/index.js';

export class LeverConnector implements BaseConnector {
  public atsType = 'lever';

  public async fetchCompanyJobs(companySlug: string, companyName: string): Promise<RawJob[]> {
    const cleanSlug = companySlug.replace(/^https?:\/\/.*?\//, '').split('/')[0].split('?')[0];
    const url = `https://api.lever.co/v0/postings/${cleanSlug}?mode=json`;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((j: any) => {
        const categories = j.categories || {};
        const commitment = (categories.commitment || '').toLowerCase();
        const workplaceType = (categories.workplaceType || '').toLowerCase();
        let modality: JobModality = 'Modalidade a confirmar';
        if (workplaceType.includes('remote') || commitment.includes('remote')) modality = 'Remoto';
        else if (workplaceType.includes('hybrid')) modality = 'Híbrido';
        else if (workplaceType.includes('on-site')) modality = 'Presencial';

        return {
          atsJobId: j.id,
          companyName: companyName || cleanSlug,
          title: j.text,
          officialUrl: j.hostedUrl || `https://jobs.lever.co/${cleanSlug}/${j.id}`,
          atsType: 'lever',
          modality,
          regime: 'CLT',
          locationCity: categories.location || '',
          locationCountry: 'Brasil',
          publishedAt: new Date(j.createdAt).toISOString(),
          descriptionFull: j.descriptionPlain || '',
          applyUrl: j.applyUrl
        };
      });
    } catch (err) {
      console.error(`Erro ao consultar Lever para ${companySlug}:`, err);
      return [];
    }
  }

  public async fetchJobDetails(officialUrl: string): Promise<{ rawJob: RawJob; verification: VerificationResult }> {
    try {
      const match = officialUrl.match(/lever\.co\/([^\/]+)\/([a-f0-9\-]+)/i);
      if (match) {
        const companySlug = match[1];
        const jobId = match[2];
        const apiUrl = `https://api.lever.co/v0/postings/${companySlug}/${jobId}`;

        const apiRes = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
        if (apiRes.ok) {
          const job = await apiRes.json() as any;
          const categories = job.categories || {};

          return {
            rawJob: {
              atsJobId: job.id,
              companyName: companySlug,
              title: job.text,
              officialUrl: job.hostedUrl || officialUrl,
              atsType: 'lever',
              modality: categories.workplaceType === 'remote' ? 'Remoto' : 'Modalidade a confirmar',
              regime: 'CLT',
              locationCity: categories.location || '',
              descriptionFull: job.descriptionPlain || '',
              applyUrl: job.applyUrl
            },
            verification: {
              isOpen: true,
              httpStatus: 200,
              applyButtonFound: true,
              officialDomainVerified: true,
              evidenceSummary: `Publicação oficial validada no Lever API. ID: ${job.id}. Criado em: ${new Date(job.createdAt).toLocaleDateString('pt-BR')}.`
            }
          };
        }
      }

      const res = await fetch(officialUrl, { signal: AbortSignal.timeout(8000) });
      const html = await res.text();
      const $ = cheerio.load(html);
      const title = $('h2').first().text().trim() || $('title').text().trim();
      const hasApply = $('a.postings-btn, a[href*="apply"]').length > 0;
      const isClosed = html.includes('posting is no longer active') || html.includes('expired');

      return {
        rawJob: { companyName: 'Lever Partner', title, officialUrl, atsType: 'lever' },
        verification: {
          isOpen: !isClosed && hasApply,
          httpStatus: res.status,
          applyButtonFound: hasApply,
          officialDomainVerified: officialUrl.includes('lever.co'),
          evidenceSummary: `Verificação web no portal oficial Lever. Aberta: ${!isClosed}.`
        }
      };
    } catch (err: any) {
      return {
        rawJob: { companyName: 'Erro', title: 'Erro', officialUrl, atsType: 'lever' },
        verification: {
          isOpen: false,
          httpStatus: 0,
          applyButtonFound: false,
          officialDomainVerified: officialUrl.includes('lever.co'),
          evidenceSummary: `Erro ao verificar Lever: ${err.message}`
        }
      };
    }
  }

  public async verifyUrl(url: string): Promise<VerificationResult> {
    const details = await this.fetchJobDetails(url);
    return details.verification;
  }
}

