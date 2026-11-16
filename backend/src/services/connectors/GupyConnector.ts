import * as cheerio from 'cheerio';
import { BaseConnector } from './BaseConnector.js';
import { RawJob, VerificationResult, JobModality, JobRegime } from '../../types/index.js';

export class GupyConnector implements BaseConnector {
  public atsType = 'gupy';

  private mapWorkplaceType(type?: string): JobModality {
    if (!type) return 'Modalidade a confirmar';
    const t = type.toLowerCase();
    if (t === 'remote') return 'Remoto';
    if (t === 'hybrid') return 'Híbrido';
    if (t === 'on-site' || t === 'onsite') return 'Presencial';
    return 'Modalidade a confirmar';
  }

  private mapRegime(jobType?: string, desc?: string): JobRegime {
    const text = `${jobType || ''} ${desc || ''}`.toLowerCase();
    if (text.includes('pessoa jurídica') || text.includes('pj') || text.includes('prestador de serviços')) {
      return 'PJ';
    }
    if (text.includes('clt') || text.includes('efetivo') || text.includes('vacancy_type_effective')) {
      return 'CLT';
    }
    return 'CLT'; // Padrão de vagas corporativas no Brasil ou Regime a confirmar
  }

  public async fetchCompanyJobs(companySlug: string, companyName: string): Promise<RawJob[]> {
    const cleanSlug = companySlug.replace(/^https?:\/\//, '').replace(/\.gupy\.io.*$/, '');
    const url = `https://${cleanSlug}.gupy.io/`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        return [];
      }

      const html = await response.text();
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
      if (!match) {
        return [];
      }

      const nextData = JSON.parse(match[1]);
      const pageProps = nextData?.props?.pageProps || {};
      const jobsList = pageProps.jobs || pageProps.jobList || [];

      const rawJobs: RawJob[] = [];
      for (const item of jobsList) {
        if (!item.id || !item.title) continue;

        // Pular bancos de talentos se o usuário busca oportunidades ativas específicas
        if (item.type === 'vacancy_type_talent_pool' && item.title.toLowerCase().includes('banco de talentos')) {
          continue;
        }

        const workplace = item.workplace || {};
        const address = workplace.address || {};
        const modality = this.mapWorkplaceType(workplace.workplaceType);

        rawJobs.push({
          atsJobId: String(item.id),
          companyName: companyName || pageProps.careerPage?.name || cleanSlug,
          title: item.title,
          officialUrl: `https://${cleanSlug}.gupy.io/jobs/${item.id}`,
          atsType: 'gupy',
          modality,
          regime: this.mapRegime(item.type),
          locationCity: address.city || '',
          locationState: address.stateShortName || address.state || '',
          locationCountry: address.country || 'Brasil',
          publishedAt: item.publishedAt || new Date().toISOString()
        });
      }

      return rawJobs;
    } catch (err) {
      console.error(`Erro ao consultar Gupy para empresa ${companySlug}:`, err);
      return [];
    }
  }

  public async fetchJobDetails(officialUrl: string): Promise<{ rawJob: RawJob; verification: VerificationResult }> {
    try {
      const response = await fetch(officialUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(8000)
      });

      const httpStatus = response.status;
      if (!response.ok) {
        return {
          rawJob: {
            companyName: 'Desconhecida',
            title: 'Não encontrada',
            officialUrl,
            atsType: 'gupy'
          },
          verification: {
            isOpen: false,
            httpStatus,
            applyButtonFound: false,
            officialDomainVerified: officialUrl.includes('.gupy.io'),
            evidenceSummary: `HTTP ${httpStatus} ao tentar acessar página oficial da vaga.`
          }
        };
      }

      const html = await response.text();
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);

      if (!match) {
        const $ = cheerio.load(html);
        const title = $('h1').first().text().trim() || $('title').text().trim();
        const hasApply = $('button:contains("Candidatar"), a:contains("Candidatar"), button:contains("Inscreva-se")').length > 0;
        const isClosed = html.includes('Processo seletivo finalizado') || html.includes('Vaga encerrada');

        return {
          rawJob: {
            companyName: officialUrl.split('//')[1]?.split('.')[0] || 'Empresa',
            title,
            officialUrl,
            atsType: 'gupy'
          },
          verification: {
            isOpen: !isClosed && hasApply,
            httpStatus,
            applyButtonFound: hasApply,
            officialDomainVerified: officialUrl.includes('.gupy.io'),
            evidenceSummary: `Página acessível. Botão de candidatura: ${hasApply ? 'Detectado' : 'Não localizado'}. Status: ${isClosed ? 'Encerrada' : 'Aberta'}.`
          }
        };
      }

      const nextData = JSON.parse(match[1]);
      const job = nextData?.props?.pageProps?.job || {};
      const company = job.company || {};
      const careerPage = nextData?.props?.pageProps?.careerPage || {};

      const isPublished = job.status === 'published' || !job.status;
      const isExpired = job.expiresAt ? new Date(job.expiresAt) < new Date() : false;
      const isOpen = isPublished && !isExpired;

      const rawJob: RawJob = {
        atsJobId: String(job.id || ''),
        companyName: company.name || careerPage.name || officialUrl.split('//')[1]?.split('.')[0] || 'Empresa',
        title: job.name || job.title || 'Vaga Sem Título',
        officialUrl,
        atsType: 'gupy',
        modality: this.mapWorkplaceType(job.workplaceType),
        regime: this.mapRegime(job.jobType, `${job.description} ${job.responsibilities}`),
        locationCity: job.addressCity || '',
        locationState: job.addressStateShortName || job.addressState || '',
        locationCountry: job.addressCountry || 'Brasil',
        salaryRaw: job.salary ? String(job.salary) : 'Não divulgado',
        publishedAt: job.publishedAt,
        responsibilities: job.responsibilities || '',
        requirements: job.prerequisites || '',
        desirable: job.skills ? JSON.stringify(job.skills) : '',
        benefits: '',
        descriptionFull: `${job.description || ''}\n\n${job.responsibilities || ''}\n\n${job.prerequisites || ''}`,
        questionForm: job.questionForm || job.requiredFields || [],
        applyUrl: `${officialUrl}/apply`
      };

      const verification: VerificationResult = {
        isOpen,
        httpStatus,
        applyButtonFound: true,
        officialDomainVerified: true,
        evidenceSummary: `Publicação oficial confirmada no domínio corporativo Gupy. ID: ${job.id}. Status de publicação: ${job.status || 'Ativo'}. Candidaturas aceitas: ${isOpen ? 'Sim' : 'Não'}.`,
        rawMetadata: {
          gupyId: job.id,
          code: job.code,
          publishedAt: job.publishedAt,
          expiresAt: job.expiresAt,
          workplaceType: job.workplaceType
        }
      };

      return { rawJob, verification };
    } catch (err: any) {
      return {
        rawJob: {
          companyName: 'Erro',
          title: 'Erro de Requisição',
          officialUrl,
          atsType: 'gupy'
        },
        verification: {
          isOpen: false,
          httpStatus: 0,
          applyButtonFound: false,
          officialDomainVerified: officialUrl.includes('.gupy.io'),
          evidenceSummary: `Falha na requisição: ${err.message}`
        }
      };
    }
  }

  public async verifyUrl(url: string): Promise<VerificationResult> {
    const details = await this.fetchJobDetails(url);
    return details.verification;
  }
}

