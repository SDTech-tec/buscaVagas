import * as cheerio from 'cheerio';
import { BaseConnector } from './BaseConnector.js';
import { RawJob, VerificationResult, JobModality, JobRegime } from '../../types/index.js';

export class GreenhouseConnector implements BaseConnector {
  public atsType = 'greenhouse';

  private mapModality(locationName?: string, content?: string): JobModality {
    const text = `${locationName || ''} ${content || ''}`.toLowerCase();
    if (text.includes('remote') || text.includes('remoto') || text.includes('anywhere')) {
      return 'Remoto';
    }
    if (text.includes('hybrid') || text.includes('híbrido')) {
      return 'Híbrido';
    }
    if (text.includes('on-site') || text.includes('onsite') || text.includes('presencial')) {
      return 'Presencial';
    }
    return 'Remoto'; // Maioria das vagas globais em tech no Greenhouse
  }

  public async fetchCompanyJobs(boardToken: string, companyName: string): Promise<RawJob[]> {
    const cleanToken = boardToken.replace(/^https?:\/\/.*?\//, '').split('/')[0].split('?')[0];
    const url = `https://boards-api.greenhouse.io/v1/boards/${cleanToken}/jobs`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'VagaCerta-JobFinder/1.0' },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) return [];

      const data = await response.json() as { jobs: any[] };
      const jobs = data.jobs || [];

      return jobs.map(j => {
        const location = j.location?.name || '';
        return {
          atsJobId: String(j.id),
          companyName: companyName || cleanToken,
          title: j.title,
          officialUrl: j.absolute_url || `https://job-boards.greenhouse.io/${cleanToken}/jobs/${j.id}`,
          atsType: 'greenhouse',
          modality: this.mapModality(location),
          regime: 'CLT',
          locationCity: location,
          locationCountry: location.includes('Brazil') || location.includes('Brasil') ? 'Brasil' : 'Internacional',
          publishedAt: j.updated_at || new Date().toISOString()
        };
      });
    } catch (err) {
      console.error(`Erro ao consultar Greenhouse para ${boardToken}:`, err);
      return [];
    }
  }

  public async fetchJobDetails(officialUrl: string): Promise<{ rawJob: RawJob; verification: VerificationResult }> {
    try {
      // Tentar extrair board token e job id da URL
      const match = officialUrl.match(/greenhouse\.io\/(?:embed\/job_board\/)?([^\/]+)\/jobs\/(\d+)/i);
      if (match) {
        const boardToken = match[1];
        const jobId = match[2];
        const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${jobId}`;

        const apiRes = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
        if (apiRes.ok) {
          const job = await apiRes.json() as any;
          const $ = cheerio.load(job.content || '');
          const textContent = $('body').text();

          const rawJob: RawJob = {
            atsJobId: String(job.id),
            companyName: boardToken,
            title: job.title,
            officialUrl: job.absolute_url || officialUrl,
            atsType: 'greenhouse',
            modality: this.mapModality(job.location?.name, textContent),
            regime: 'CLT',
            locationCity: job.location?.name || '',
            locationCountry: 'Brasil',
            salaryRaw: 'Não divulgado',
            publishedAt: job.updated_at,
            responsibilities: '',
            requirements: textContent,
            descriptionFull: textContent,
            applyUrl: `${officialUrl}#app`
          };

          return {
            rawJob,
            verification: {
              isOpen: true,
              httpStatus: 200,
              applyButtonFound: true,
              officialDomainVerified: true,
              evidenceSummary: `Publicação oficial confirmada via API Greenhouse. ID: ${job.id}. Atualizado em: ${job.updated_at}.`,
              rawMetadata: { departments: job.departments, offices: job.offices }
            }
          };
        }
      }

      // Fallback via HTML direto
      const pageRes = await fetch(officialUrl, { signal: AbortSignal.timeout(8000) });
      const html = await pageRes.text();
      const $ = cheerio.load(html);

      const title = $('h1').first().text().trim() || $('title').text().trim();
      const hasApply = $('form#application_form, a[href*="apply"], button:contains("Apply")').length > 0;
      const isClosed = html.includes('job is no longer available') || html.includes('this job posting is closed');

      return {
        rawJob: {
          companyName: 'Greenhouse Partner',
          title,
          officialUrl,
          atsType: 'greenhouse',
          descriptionFull: $('body').text().slice(0, 4000)
        },
        verification: {
          isOpen: !isClosed && hasApply,
          httpStatus: pageRes.status,
          applyButtonFound: hasApply,
          officialDomainVerified: officialUrl.includes('greenhouse.io'),
          evidenceSummary: `Verificação web na página oficial do Greenhouse. Aberta: ${!isClosed}. Botão de candidatura: ${hasApply}.`
        }
      };
    } catch (err: any) {
      return {
        rawJob: { companyName: 'Erro', title: 'Erro', officialUrl, atsType: 'greenhouse' },
        verification: {
          isOpen: false,
          httpStatus: 0,
          applyButtonFound: false,
          officialDomainVerified: officialUrl.includes('greenhouse.io'),
          evidenceSummary: `Falha ao verificar Greenhouse: ${err.message}`
        }
      };
    }
  }

  public async verifyUrl(url: string): Promise<VerificationResult> {
    const details = await this.fetchJobDetails(url);
    return details.verification;
  }
}

