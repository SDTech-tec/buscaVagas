import { db } from '../../db/database.js';
import { CompatibilityAnalysis, CompatibilityLevel } from '../../types/index.js';

export class ProfileMatcher {
  private getCandidateProfile() {
    const profile = db.prepare('SELECT * FROM candidate_profile WHERE id = ?').get('pedro_paulo') as any;
    if (!profile) {
      throw new Error('Perfil do candidato não encontrado no banco de dados.');
    }
    return {
      ...profile,
      experience: JSON.parse(profile.experience_json),
      education: JSON.parse(profile.education_json),
      skills: JSON.parse(profile.skills_json),
      preferences: JSON.parse(profile.preferences_json)
    };
  }

  /**
   * Executa a análise de compatibilidade detalhada comparando o perfil de Pedro Paulo
   * com a oportunidade, garantindo que nenhuma competência seja inventada.
   */
  public analyze(title: string, description: string, requirements: string = ''): CompatibilityAnalysis {
    const profile = this.getCandidateProfile();
    const fullText = `${title} ${description} ${requirements}`.toLowerCase();

    const matchingPoints: string[] = [];
    const mandatoryFulfilled: string[] = [];
    const mandatoryPartial: string[] = [];
    const mandatoryUnproven: string[] = [];
    const missingDesirables: string[] = [];
    const attentionPoints: string[] = [];

    // Mapeamento de competências reais do Pedro Paulo
    const knownSkillsMap = [
      {
        category: 'Integração & APIs',
        terms: ['api', 'apis', 'rest', 'json', 'webhook', 'webhooks', 'integração', 'integracao', 'integrações', 'postman'],
        matchText: 'Integração de Sistemas via APIs REST, Webhooks, Postman e payloads JSON (Experiência na 1Doc)'
      },
      {
        category: 'Automação & n8n',
        terms: ['n8n', 'automação', 'automacao', 'workflow', 'fluxos'],
        matchText: 'Automação de processos corporativos com n8n na prática e scripts JavaScript (1Doc)'
      },
      {
        category: 'Banco de Dados & Migração',
        terms: ['sql', 'postgres', 'postgresql', 'mariadb', 'mysql', 'migração', 'migracao', 'tratamento de dados'],
        matchText: 'Migração e tratamento de dados com SQL, PostgreSQL e MariaDB (1Doc)'
      },
      {
        category: 'Suporte & Service Desk',
        terms: ['suporte', 'chamados', 'atendimento', 'service desk', 'help desk', 'movidesk', 'glpi', 'jira', 'sla', 'anydesk', 'teamviewer', 'rdp', 'ssh'],
        matchText: 'Suporte técnico N1/N2, atendimento de chamados com SLA (Movidesk, GLPI, Jira, AnyDesk, TeamViewer, RDP, SSH - Lanlink e 1Doc)'
      },
      {
        category: 'Ecossistema Microsoft',
        terms: ['windows', 'microsoft 365', 'm365', 'active directory', 'ad', 'sharepoint'],
        matchText: 'Administração avançada de Windows, Microsoft 365, Active Directory e SharePoint'
      },
      {
        category: 'Redes & Infra',
        terms: ['tcp/ip', 'dns', 'dhcp', 'vpn', 'redes', 'conectividade'],
        matchText: 'Diagnóstico de conectividade e redes TCP/IP, DNS, DHCP e VPN'
      },
      {
        category: 'Docker',
        terms: ['docker', 'containers', 'conteinerizacao'],
        matchText: 'Utilização prática de Docker para ambientes de integração e microsserviços'
      },
      {
        category: 'Implantação & Treinamento',
        terms: ['implantação', 'implantacao', 'onboarding', 'treinamento', 'parametrização', 'parametrizacao'],
        matchText: 'Experiência em implantação de sistemas SaaS, parametrização e treinamento de usuários (1Doc)'
      }
    ];

    let matchedCount = 0;
    for (const item of knownSkillsMap) {
      const hasMatch = item.terms.some(t => fullText.includes(t));
      if (hasMatch) {
        matchedCount++;
        matchingPoints.push(item.matchText);
        mandatoryFulfilled.push(item.category);
      }
    }

    // Checagem de requisitos que NÃO constam no perfil de Pedro Paulo
    const unprovenChecks = [
      { term: 'inglês fluente', label: 'Inglês fluente / avançado (Não informado no perfil cadastrado)' },
      { term: 'fluent english', label: 'Inglês fluente para conversação (Não cadastrado)' },
      { term: 'aws', label: 'Experiência em nuvem AWS (Não cadastrada no perfil)' },
      { term: 'azure', label: 'Administração de nuvem Azure além do M365 (Não cadastrada)' },
      { term: 'python', label: 'Desenvolvimento em Python (Perfil possui JavaScript)' },
      { term: 'java', label: 'Desenvolvimento em Java (Não cadastrado)' },
      { term: 'c#', label: 'Desenvolvimento em C# / .NET (Não cadastrado)' },
      { term: 'power bi', label: 'Ferramenta Power BI avançado (Não cadastrado)' },
      { term: 'kubernetes', label: 'Orquestração Kubernetes (Perfil possui Docker)' },
      { term: 'itil v4', label: 'Certificação ITIL v4 (Certificação não cadastrada no perfil)' }
    ];

    for (const uc of unprovenChecks) {
      if (fullText.includes(uc.term)) {
        if (uc.term.includes('certificação') || uc.term.includes('desejável')) {
          missingDesirables.push(uc.label);
        } else {
          mandatoryUnproven.push(uc.label);
          attentionPoints.push(`Vaga menciona '${uc.term}'. O candidato NÃO possui essa competência cadastrada e isso NÃO deve ser inventado.`);
        }
      }
    }

    // Avaliação de Formação
    if (fullText.includes('superior') || fullText.includes('graduação') || fullText.includes('tecnólogo')) {
      mandatoryFulfilled.push('Graduação concluída em Gestão da TI e Pós-graduação em Full-stack em andamento atendem aos requisitos acadêmicos');
    }

    // Cálculo do Score de Compatibilidade
    let baseScore = 40;
    // Título alinhado
    const titleNorm = title.toLowerCase();
    if (
      titleNorm.includes('suporte') ||
      titleNorm.includes('integração') ||
      titleNorm.includes('integracao') ||
      titleNorm.includes('automação') ||
      titleNorm.includes('automacao') ||
      titleNorm.includes('implantacao') ||
      titleNorm.includes('implantação') ||
      titleNorm.includes('dados') ||
      titleNorm.includes('customer success') ||
      titleNorm.includes('onboarding') ||
      titleNorm.includes('sistemas')
    ) {
      baseScore += 25;
    }

    baseScore += Math.min(matchedCount * 10, 35);
    baseScore -= mandatoryUnproven.length * 8;
    const finalScore = Math.max(10, Math.min(baseScore, 98));

    let level: CompatibilityLevel = 'Baixa';
    let recommendation = 'Candidatura não prioritária devido ao baixo alinhamento técnico.';

    if (finalScore >= 75) {
      level = 'Alta';
      recommendation = 'Fortemente recomendada. Alta aderência com o histórico prático na 1Doc (Suporte/Integração/Automação).';
    } else if (finalScore >= 45) {
      level = 'Média';
      recommendation = 'Candidatura recomendada com ressalvas. Verificar os pontos não cadastrados antes da entrevista.';
    }

    if (matchingPoints.length === 0) {
      matchingPoints.push('Alinhamento básico na área de Tecnologia da Informação');
    }

    return {
      score: finalScore,
      level,
      matchingPoints,
      mandatoryFulfilled,
      mandatoryPartial,
      mandatoryUnproven,
      missingDesirables,
      attentionPoints,
      recommendation
    };
  }
}

