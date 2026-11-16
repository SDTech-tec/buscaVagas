import { JobModality } from '../../types/index.js';

export interface LocationEvaluation {
  isViable: boolean;
  statusModification?: 'descartada_modalidade';
  reason?: string;
  notes: string;
}

export class LocationValidator {
  private homeCity = 'aracaju';
  private homeState = 'se';

  public evaluate(
    modality: JobModality,
    city?: string | null,
    state?: string | null,
    description?: string | null
  ): LocationEvaluation {
    const normCity = (city || '').trim().toLowerCase();
    const normState = (state || '').trim().toLowerCase();
    const fullText = `${normCity} ${normState} ${(description || '').toLowerCase()}`;

    // 1. Remoto é 100% viável (candidato aceita viagens ocasionais de trabalho)
    if (modality === 'Remoto') {
      return {
        isViable: true,
        notes: 'Remoto integral (100% compatível com a localização em Aracaju/SE e disponibilidade para viagens).'
      };
    }

    // 2. Presencial em Aracaju/SE
    const isLocal = normCity.includes('aracaju') || normCity.includes('nossa senhora do socorro') || normCity.includes('são cristóvão') || normState === 'se' || normState === 'sergipe';

    if (modality === 'Presencial') {
      if (isLocal) {
        return {
          isViable: true,
          notes: `Presencial em ${city || 'Aracaju'}/${state || 'SE'} (Localidade viável para residência atual).`
        };
      }
      return {
        isViable: false,
        statusModification: 'descartada_modalidade',
        reason: `Vaga 100% presencial em ${city || 'outra localidade'}/${state || ''}, inviável para residência em Aracaju/SE (candidato não tem disponibilidade para mudança definitiva).`,
        notes: `Presencial em ${city}/${state}`
      };
    }

    // 3. Híbrido
    if (modality === 'Híbrido') {
      if (isLocal) {
        return {
          isViable: true,
          notes: `Híbrido com base em Aracaju/SE (${city || 'Aracaju'}/${state || 'SE'}). Viável.`
        };
      }

      // Se menciona "viagens ocasionais" e não exigência de dias fixos semanais no escritório de outra UF:
      if (fullText.includes('viagens ocasionais') || fullText.includes('eventual') || fullText.includes('flexível')) {
        return {
          isViable: true,
          notes: `Híbrido flexível com presença eventual em ${city || 'outra UF'}. Viável pela disponibilidade para viagens informada no perfil.`
        };
      }

      // Híbrido fixo em SP, RJ, etc. é inviável sem mudança de cidade
      return {
        isViable: false,
        statusModification: 'descartada_modalidade',
        reason: `Vaga híbrida localizada em ${city || 'outra localidade'}/${state || ''}, incompatível com a residência em Aracaju/SE e ausência de disponibilidade para mudança definitiva.`,
        notes: `Híbrido em ${city}/${state} (Inviável para deslocamento frequente de Aracaju/SE).`
      };
    }

    // Modalidade a confirmar
    return {
      isViable: true,
      notes: 'Modalidade a confirmar diretamente na oportunidade.'
    };
  }
}

