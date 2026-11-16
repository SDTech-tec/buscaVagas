import { db } from '../../db/database.js';

export interface DedupCheckResult {
  isDuplicate: boolean;
  existingJobId?: string;
  isPreviouslyKnown: boolean;
  reason?: string;
  canonicalUrl: string;
}

export class DeduplicationService {
  /**
   * Normaliza uma URL removendo parâmetros de rastreamento (UTMs, refs, timestamps)
   */
  public normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'ref', 'source', 'fbclid', 'gclid', 'trk', 'tracking', 'from'
      ];
      for (const p of trackingParams) {
        parsed.searchParams.delete(p);
      }
      // Remove trailing slash
      let clean = parsed.origin + parsed.pathname;
      if (clean.endsWith('/') && clean.length > parsed.origin.length + 1) {
        clean = clean.slice(0, -1);
      }
      return clean.toLowerCase();
    } catch {
      return url.trim().toLowerCase().replace(/\/$/, '');
    }
  }

  /**
   * Normaliza um título de vaga para comparação fonética/textual
   */
  public normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Checa se a vaga já existe no banco de dados por:
   * 1. URL Canônica exata
   * 2. ATS ID idêntico para a mesma empresa
   * 3. Empresa + Título Normalizado + Localidade idênticos
   */
  public check(
    officialUrl: string,
    companyName: string,
    title: string,
    atsJobId?: string | null,
    city?: string | null
  ): DedupCheckResult {
    const canonicalUrl = this.normalizeUrl(officialUrl);
    const normTitle = this.normalizeTitle(title);
    const normCompany = companyName.trim().toLowerCase();

    // 1. Checagem por URL canônica
    const byUrl = db.prepare('SELECT id, status, is_new FROM jobs WHERE canonical_url = ? OR official_url = ?').get(canonicalUrl, officialUrl) as { id: string; status: string; is_new: number } | undefined;
    if (byUrl) {
      return {
        isDuplicate: true,
        existingJobId: byUrl.id,
        isPreviouslyKnown: byUrl.status === 'historico_conhecida' || byUrl.is_new === 0,
        reason: 'URL canônica oficial já cadastrada no banco de dados',
        canonicalUrl
      };
    }

    // 2. Checagem por ATS Job ID e Empresa
    if (atsJobId && atsJobId.trim() !== '') {
      const byAts = db.prepare('SELECT id, status, is_new FROM jobs WHERE ats_job_id = ? AND lower(company_name) = ?').get(atsJobId, normCompany) as { id: string; status: string; is_new: number } | undefined;
      if (byAts) {
        return {
          isDuplicate: true,
          existingJobId: byAts.id,
          isPreviouslyKnown: byAts.status === 'historico_conhecida' || byAts.is_new === 0,
          reason: `Identificador de vaga no ATS (${atsJobId}) já existente para a empresa ${companyName}`,
          canonicalUrl
        };
      }
    }

    // 3. Checagem por Empresa e Título idêntico/similar
    const byTitleCompany = db.prepare(`
      SELECT id, status, is_new, title FROM jobs 
      WHERE lower(company_name) = ? AND (normalized_title = ? OR lower(title) = ?)
    `).get(normCompany, normTitle, title.toLowerCase()) as { id: string; status: string; is_new: number; title: string } | undefined;

    if (byTitleCompany) {
      return {
        isDuplicate: true,
        existingJobId: byTitleCompany.id,
        isPreviouslyKnown: byTitleCompany.status === 'historico_conhecida' || byTitleCompany.is_new === 0,
        reason: `Vaga de mesmo cargo ('${byTitleCompany.title}') já cadastrada para a empresa ${companyName}`,
        canonicalUrl
      };
    }

    return {
      isDuplicate: false,
      isPreviouslyKnown: false,
      canonicalUrl
    };
  }
}

