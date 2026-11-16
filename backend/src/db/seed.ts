import { db, initDatabase } from './database.js';
import { randomUUID } from 'crypto';

export function seedDatabase() {
  initDatabase();

  // 1. Perfil Inicial do Candidato (Pedro Paulo dos Santos Dantas)
  const existingProfile = db.prepare('SELECT id FROM candidate_profile WHERE id = ?').get('pedro_paulo');
  if (!existingProfile) {
    const profile = {
      id: 'pedro_paulo',
      name: 'Pedro Paulo dos Santos Dantas',
      location: 'Aracaju, Sergipe, Brasil',
      linkedin_url: 'https://www.linkedin.com/in/pedropaulodossantosdantas/',
      email: 'ppsantos.se@gmail.com',
      phone: '(79) 99837-0068',
      summary: 'Profissional de TIC com mais de 15 anos de sólida experiência, atuando com destaque em Suporte Técnico N1/N2, Implantação e Integração de Sistemas, Automação de Processos com n8n, Webhooks e APIs REST, além de Migração e Tratamento de Dados com SQL (PostgreSQL/MariaDB). Trajetória recente de 4 anos na 1Doc e atuação atual N2 na Lanlink, combinada a mais de 10 anos em contratos de missão crítica (TJSE, Petrobras, TRT-SE). Habilidade comprovada em diagnosticar incidentes complexos, criar integrações robustas e orientar usuários com excelência.',
      experience_json: JSON.stringify([
        {
          company: '1Doc',
          period: 'março de 2022 a abril de 2026',
          roles: [
            {
              title: 'Analista de Suporte I',
              description: 'Atendimento e gerenciamento de chamados técnicos, suporte remoto avançado a clientes e usuários utilizando AnyDesk, TeamViewer, RDP e SSH. Administração de ambientes Windows avançado, Microsoft 365 avançado, Active Directory avançado e SharePoint avançado. Diagnóstico e resolução de incidentes em redes TCP/IP, DNS, DHCP e VPN.'
            },
            {
              title: 'Analista de Integração, Automação e Migração de Dados',
              period_approx: 'Aproximadamente 1 ano e 2 meses',
              description: 'Desenvolvimento e manutenção de integrações entre sistemas utilizando APIs REST e formato JSON. Criação e sustentação de fluxos de automação de processos corporativos com n8n na prática, scripts em JavaScript e webhooks. Execução de migrações e tratamento de bases de dados relacionais com consultas SQL e PostgreSQL, utilizando containers Docker para ambientes de integração.'
            }
          ]
        }
      ]),
      education_json: JSON.stringify([
        {
          degree: 'Graduação em Gestão da Tecnologia da Informação',
          status: 'Concluído'
        },
        {
          degree: 'Pós-graduação em Desenvolvimento Full-stack',
          status: 'Em andamento (2º período)'
        }
      ]),
      skills_json: JSON.stringify({
        suporte_atendimento: [
          'Suporte técnico',
          'Atendimento e gerenciamento de chamados',
          'Suporte remoto',
          'AnyDesk',
          'TeamViewer',
          'RDP',
          'SSH',
          'Windows avançado',
          'Microsoft 365 avançado',
          'Active Directory avançado',
          'SharePoint avançado'
        ],
        infraestrutura_redes: [
          'TCP/IP',
          'DNS',
          'DHCP',
          'VPN'
        ],
        integracao_automacao: [
          'APIs REST',
          'JSON',
          'Integração de sistemas',
          'n8n (experiência prática)',
          'Webhooks',
          'JavaScript',
          'Automação de processos'
        ],
        banco_dados: [
          'SQL',
          'PostgreSQL',
          'Docker',
          'Migração de dados',
          'Tratamento de dados'
        ]
      }),
      preferences_json: JSON.stringify({
        travel_availability: true,
        relocation_availability: false,
        contract_types: ['CLT', 'PJ'],
        preferred_modality: 'Remoto',
        viable_hybrid_location: 'Aracaju/SE',
        notes: 'Disponibilidade para viagens comprovada. Sem disponibilidade para mudança definitiva de cidade. Preferência absoluta por trabalho remoto integral.'
      }),
      updated_at: new Date().toISOString()
    };

    db.prepare(`
      INSERT INTO candidate_profile (
        id, name, location, linkedin_url, email, phone, summary,
        experience_json, education_json, skills_json, preferences_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      profile.id,
      profile.name,
      profile.location,
      profile.linkedin_url,
      profile.email,
      profile.phone,
      profile.summary,
      profile.experience_json,
      profile.education_json,
      profile.skills_json,
      profile.preferences_json,
      profile.updated_at
    );
  }

  // 2. Configurações Iniciais do Sistema
  const defaultSettings = [
    { key: 'floor_remote_clt', value: '2800', description: 'Piso mínimo mensal CLT para trabalho Remoto (R$)' },
    { key: 'floor_remote_pj', value: '5600', description: 'Piso mínimo mensal PJ para trabalho Remoto (R$)' },
    { key: 'floor_hybrid_clt', value: '2800', description: 'Piso mínimo mensal CLT para trabalho Híbrido (R$)' },
    { key: 'floor_hybrid_pj', value: '5600', description: 'Piso mínimo mensal PJ para trabalho Híbrido (R$)' },
    { key: 'floor_onsite_clt', value: '3500', description: 'Piso mínimo mensal CLT para Presencial (preferencialmente Aracaju/SE) (R$)' },
    { key: 'floor_onsite_pj', value: '7000', description: 'Piso mínimo mensal PJ para Presencial (preferencialmente Aracaju/SE) (R$)' },
    { key: 'schedule_enabled', value: 'true', description: 'Execução diária automática ativa' },
    { key: 'schedule_time', value: '08:00', description: 'Horário da busca diária (HH:mm)' },
    { key: 'schedule_days', value: '1,2,3,4,5', description: 'Dias da semana (1=Segunda a 5=Sexta)' },
    { key: 'timezone', value: 'America/Sao_Paulo', description: 'Fuso horário do sistema' },
    { key: 'gemini_api_key', value: process.env.GEMINI_API_KEY || '', description: 'Chave de API do Google Gemini' },
    { key: 'master_password', value: process.env.MASTER_PASSWORD || 'pedropaulo2026', description: 'Senha de acesso exclusivo ao sistema' },
    { key: 'home_city', value: 'Aracaju', description: 'Cidade base do candidato' },
    { key: 'home_state', value: 'SE', description: 'Estado base do candidato' }
  ];

  const insertSetting = db.prepare(`
    INSERT INTO system_settings (key, value, description)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET description = excluded.description
  `);

  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value, s.description);
  }

  // 3. Cadastrar as 7 vagas conhecidas que JAMAIS devem ser reportadas como novas
  const knownJobs = [
    {
      company: 'NEXDOM Healthtech',
      title: 'Analista de Suporte Sistemas Júnior',
      url: 'https://nexdom.gupy.io/jobs/historico-nexdom-suporte-jr',
      regime: 'CLT',
      modality: 'Remoto'
    },
    {
      company: 'LG lugar de gente',
      title: 'Analista de Sistemas de Implantação Pleno',
      url: 'https://lglugardegente.gupy.io/jobs/historico-lg-implantacao-pl',
      regime: 'CLT',
      modality: 'Remoto'
    },
    {
      company: '+A Educação',
      title: 'Analista de Implantação',
      url: 'https://maisaeducacao.gupy.io/jobs/historico-maisa-implantacao',
      regime: 'CLT',
      modality: 'Remoto'
    },
    {
      company: 'Globalweb',
      title: 'Analista de Sistemas Jr.',
      url: 'https://globalweb.gupy.io/jobs/historico-globalweb-sistemas-jr',
      regime: 'CLT',
      modality: 'Remoto'
    },
    {
      company: 'Clicksign',
      title: 'Analista de Customer Success Pleno Foco em Expansão',
      url: 'https://clicksign.gupy.io/jobs/historico-clicksign-cs-expansao',
      regime: 'CLT',
      modality: 'Remoto'
    },
    {
      company: 'Equanimus',
      title: 'Analista de Implantação e Integração Pleno',
      url: 'https://equanimus.gupy.io/jobs/historico-equanimus-implantacao-integracao',
      regime: 'PJ',
      modality: 'Remoto'
    },
    {
      company: 'Stefanini',
      title: 'Analista Suporte Jr N1',
      url: 'https://stefanini.gupy.io/jobs/historico-stefanini-suporte-n1',
      regime: 'CLT',
      modality: 'Remoto'
    }
  ];

  const checkJob = db.prepare('SELECT id FROM jobs WHERE official_url = ?');
  const insertJob = db.prepare(`
    INSERT INTO jobs (
      id, company_name, title, normalized_title, official_url, canonical_url,
      ats_type, regime, modality, location_city, location_state, location_country,
      is_aracaju_viable, salary_disclosed, salary_min, salary_max, salary_currency,
      salary_raw, salary_notes, meets_salary_floor, status, compatibility_level,
      compatibility_score, published_at, discovered_at, last_verified_at,
      responsibilities_raw, requirements_raw, desirable_raw, benefits_raw,
      description_full, is_new, is_saved, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  for (const kj of knownJobs) {
    const exists = checkJob.get(kj.url);
    if (!exists) {
      const jobId = randomUUID();
      insertJob.run(
        jobId,
        kj.company,
        kj.title,
        kj.title.toLowerCase(),
        kj.url,
        kj.url,
        'gupy',
        kj.regime,
        kj.modality,
        'Brasil',
        'BR',
        'Brasil',
        1,
        0,
        null,
        null,
        'BRL',
        'Não divulgado',
        'Vaga pré-existente no histórico do candidato',
        1,
        'historico_conhecida', // Vaga conhecida previamente, não reportar como nova
        'Média',
        70,
        '2026-03-01T00:00:00.000Z',
        '2026-03-01T00:00:00.000Z',
        new Date().toISOString(),
        'Atividades compatíveis com o histórico profissional.',
        'Requisitos verificados no histórico de buscas.',
        'Diferenciais compatíveis.',
        'Benefícios compatíveis.',
        'Oportunidade já conhecida pelo candidato previamente. Mantida no histórico permanente para evitar duplicidades.',
        0, // is_new = 0
        1, // is_saved = 1
        new Date().toISOString()
      );
    }
  }

  // 4. Cadastrar Empresas Monitoradas com Vínculo Oficial Comprovado
  const initialCompanies = [
    {
      name: 'Ambev Tech',
      domain: 'ambev.com.br',
      website_url: 'https://www.ambev.com.br',
      career_url: 'https://ambev.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'ambev',
      ats_evidence: 'Portal oficial de vagas hospedado no subdomínio corporativo oficial da Gupy homologado pela Ambev.',
      verified_link: 1
    },
    {
      name: 'GitLab',
      domain: 'gitlab.com',
      website_url: 'https://about.gitlab.com',
      career_url: 'https://about.gitlab.com/jobs/careers/',
      ats_type: 'greenhouse',
      ats_slug: 'gitlab',
      ats_evidence: 'API oficial pública do Greenhouse boards-api.greenhouse.io/v1/boards/gitlab vinculada no portal da GitLab.',
      verified_link: 1
    },
    {
      name: 'Automattic',
      domain: 'automattic.com',
      website_url: 'https://automattic.com',
      career_url: 'https://automattic.com/work-with-us/',
      ats_type: 'greenhouse',
      ats_slug: 'automattic',
      ats_evidence: 'Job board oficial Greenhouse referenciado na página institucional da dona do WordPress.',
      verified_link: 1
    },
    {
      name: 'TOTVS',
      domain: 'totvs.com',
      website_url: 'https://www.totvs.com',
      career_url: 'https://totvs.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'totvs',
      ats_evidence: 'Portal de carreiras corporativo TOTVS no domínio Gupy verificado.',
      verified_link: 1
    },
    {
      name: 'Locaweb',
      domain: 'locaweb.com.br',
      website_url: 'https://www.locaweb.com.br',
      career_url: 'https://locaweb.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'locaweb',
      ats_evidence: 'Página de talentos oficial Locaweb / LWSA no ATS Gupy.',
      verified_link: 1
    },
    {
      name: 'Clicksign',
      domain: 'clicksign.com',
      website_url: 'https://www.clicksign.com',
      career_url: 'https://clicksign.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'clicksign',
      ats_evidence: 'Página oficial de carreiras Clicksign na Gupy.',
      verified_link: 1
    },
    {
      name: 'Conta Azul',
      domain: 'contaazul.com',
      website_url: 'https://contaazul.com',
      career_url: 'https://contaazul.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'contaazul',
      ats_evidence: 'Página de oportunidades Conta Azul no ATS Gupy.',
      verified_link: 1
    },
    {
      name: 'RD Station',
      domain: 'rdstation.com',
      website_url: 'https://www.rdstation.com',
      career_url: 'https://rdstation.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'rdstation',
      ats_evidence: 'Página oficial de vagas RD Station.',
      verified_link: 1
    },
    {
      name: 'Senior Sistemas',
      domain: 'senior.com.br',
      website_url: 'https://www.senior.com.br',
      career_url: 'https://seniorsistemas.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'seniorsistemas',
      ats_evidence: 'Página de carreiras Senior Sistemas no ATS Gupy.',
      verified_link: 1
    },
    {
      name: 'Sankhya Gestão de Negócios',
      domain: 'sankhya.com.br',
      website_url: 'https://www.sankhya.com.br',
      career_url: 'https://sankhya.gupy.io/',
      ats_type: 'gupy',
      ats_slug: 'sankhya',
      ats_evidence: 'Página de carreiras oficial Sankhya no ATS Gupy.',
      verified_link: 1
    }
  ];

  const checkCompany = db.prepare('SELECT id FROM companies WHERE domain = ? OR ats_slug = ?');
  const insertCompany = db.prepare(`
    INSERT INTO companies (
      id, name, domain, website_url, career_url, ats_type, ats_slug,
      ats_evidence, verified_link, last_checked_at, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of initialCompanies) {
    const exists = checkCompany.get(c.domain, c.ats_slug);
    if (!exists) {
      insertCompany.run(
        randomUUID(),
        c.name,
        c.domain,
        c.website_url,
        c.career_url,
        c.ats_type,
        c.ats_slug,
        c.ats_evidence,
        c.verified_link,
        new Date().toISOString(),
        'active',
        'Empresa cadastrada inicialmente com ATS oficial confirmado.',
        new Date().toISOString()
      );
    }
  }

  // 5. Cadastrar Versões Iniciais de Currículo Direcionado
  const resumeTemplates = [
    {
      id: 'cv_geral',
      title: 'Currículo Geral — Tecnologia da Informação',
      targeted_area: 'Geral',
      content: {
        headline: 'Analista de Integração, Automação de Processos e Suporte Avançado de TI',
        objective: 'Atuação estratégica em posições remotas ou híbridas de Suporte Técnico Especializado, Integração de Sistemas, Automação de Processos e Migração de Dados, unindo visão prática de infraestrutura e desenvolvimento full-stack.',
        highlight_skills: [
          'Integração de Sistemas via APIs REST & Webhooks',
          'Automação de fluxos com n8n na prática',
          'Manipulação e Migração de Dados com SQL e PostgreSQL',
          'Suporte Técnico Avançado (Windows, M365, Active Directory, SharePoint)',
          'Diagnóstico de Redes TCP/IP, DNS, DHCP e VPN'
        ]
      }
    },
    {
      id: 'cv_suporte',
      title: 'Currículo Direcionado — Suporte Técnico & Service Desk',
      targeted_area: 'Suporte',
      content: {
        headline: 'Analista de Suporte Técnico N1/N2 / Service Desk Especialista',
        objective: 'Atendimento e gerenciamento de incidentes complexos, suporte remoto corporativo, administração de ecossistemas Microsoft 365, Active Directory e SharePoint com foco em SLA e estabilidade operacional.',
        highlight_skills: [
          'Gerenciamento de chamados e suporte remoto avançado (AnyDesk, TeamViewer, RDP, SSH)',
          'Administração avançada de Windows, Microsoft 365, Active Directory e SharePoint',
          'Análise e resolução de conectividade em redes corporativas (TCP/IP, DNS, DHCP, VPN)',
          'Atendimento focado em experiência do usuário e resolução definitiva de problemas'
        ]
      }
    },
    {
      id: 'cv_integracao',
      title: 'Currículo Direcionado — Integração de Sistemas & APIs',
      targeted_area: 'Integração',
      content: {
        headline: 'Analista de Integração de Sistemas & APIs REST',
        objective: 'Conectar ecossistemas corporativos através de APIs REST, webhooks e transformação de payloads JSON, garantindo interoperabilidade segura e alta disponibilidade de dados.',
        highlight_skills: [
          'Arquitetura e consumo de APIs RESTful com payloads JSON complexos',
          'Desenvolvimento de pipelines de integração com n8n e webhooks',
          'Manipulação e validação de dados com JavaScript e consultas SQL/PostgreSQL',
          'Ambientes de integração conteinerizados com Docker'
        ]
      }
    },
    {
      id: 'cv_automacao',
      title: 'Currículo Direcionado — Automação de Processos & n8n',
      targeted_area: 'Automação',
      content: {
        headline: 'Analista de Automação de Processos (n8n & Scripts)',
        objective: 'Otimização e automação de rotinas manuais com n8n, webhooks e JavaScript, eliminando retrabalho operacional e aumentando a eficiência de processos de negócios.',
        highlight_skills: [
          'Construção de workflows robustos no n8n para orquestração de processos',
          'Integração orientada a eventos através de Webhooks e gatilhos automatizados',
          'Automação de tarefas com scripts em JavaScript e rotinas de banco de dados SQL',
          'Monitoramento de fluxos e tratamento resiliente de erros em execuções'
        ]
      }
    },
    {
      id: 'cv_implantacao',
      title: 'Currículo Direcionado — Implantação de Sistemas & Onboarding',
      targeted_area: 'Implantação',
      content: {
        headline: 'Analista de Implantação e Onboarding Técnico',
        objective: 'Conduzir implantações técnicas de sistemas SaaS, parametrização, validação de regras de negócio, suporte técnico inicial e transição segura para produção.',
        highlight_skills: [
          'Experiência prática na 1Doc com processos de implantação, migração e suporte',
          'Parametrização técnica de sistemas e alinhamento com regras de negócios de clientes',
          'Migração de bases históricas e saneamento de dados com SQL',
          'Comunicação técnica clara e acompanhamento próximo de usuários-chave'
        ]
      }
    },
    {
      id: 'cv_dados',
      title: 'Currículo Direcionado — Migração & Tratamento de Dados',
      targeted_area: 'Dados',
      content: {
        headline: 'Analista de Migração e Tratamento de Dados',
        objective: 'Planejamento e execução de migrações de dados, extração, transformação e carga (ETL), modelagem relacional em PostgreSQL e garantia de integridade de dados.',
        highlight_skills: [
          'Consultas avançadas e scripts de migração em SQL e PostgreSQL',
          'Saneamento, normalização e validação de consistência em bases de clientes',
          'Integração e ingestão de dados via APIs REST e arquivos estruturados (JSON/CSV)',
          'Utilização de Docker para isolamento e reprodutibilidade de cargas de dados'
        ]
      }
    }
  ];

  const checkResume = db.prepare('SELECT id FROM resumes WHERE id = ?');
  const insertResume = db.prepare(`
    INSERT INTO resumes (id, title, targeted_area, content_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const r of resumeTemplates) {
    const exists = checkResume.get(r.id);
    if (!exists) {
      insertResume.run(
        r.id,
        r.title,
        r.targeted_area,
        JSON.stringify(r.content),
        new Date().toISOString(),
        new Date().toISOString()
      );
    }
  }
}

