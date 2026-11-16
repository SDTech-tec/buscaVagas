import { ApplicationAnswer } from '../../types/index.js';
import { db } from '../../db/database.js';

export class ApplicationPrepService {
  private getCandidate() {
    const profile = db.prepare('SELECT * FROM candidate_profile WHERE id = ?').get('pedro_paulo') as any;
    return {
      name: profile?.name || 'Pedro Paulo dos Santos Dantas',
      location: profile?.location || 'Aracaju, Sergipe, Brasil',
      experience: profile ? JSON.parse(profile.experience_json) : [],
      skills: profile ? JSON.parse(profile.skills_json) : {},
      preferences: profile ? JSON.parse(profile.preferences_json) : {}
    };
  }

  /**
   * Gera a bateria completa de respostas vencedoras para as perguntas mais frequentes de processos seletivos
   */
  public generateAnswers(
    companyName: string = 'Empresa',
    jobTitle: string = 'Oportunidade',
    jobDescription: string = '',
    customQuestions: any[] = []
  ): ApplicationAnswer[] {
    const answers: ApplicationAnswer[] = [];

    // 1. Apresentação Curta (Pitch até 500 caracteres)
    const shortPitch = `Olá! Sou Pedro Paulo, profissional de TIC com mais de 15 anos de sólida vivência, com passagens recentes pela Lanlink (Suporte N2) e 1Doc (Suporte Pleno e Integração/Migração de Dados). Tenho experiência prática no consumo de APIs REST/JSON com Postman, automação de fluxos com n8n e webhooks, migração de dados em SQL/PostgreSQL/MariaDB e gestão de incidentes com Movidesk, GLPI e Jira. Busco somar à ${companyName} com alta resolutividade, foco em SLA e estabilidade.`;
    answers.push({
      questionType: 'pitch_curto',
      questionPrompt: 'Apresentação Profissional Curta (Pitch para campos rápidos até 500 caracteres)',
      suggestedAnswer: shortPitch,
      charCount: shortPitch.length,
      confidenceLevel: 'Alta'
    });

    // 2. Apresentação Completa (Carta de Apresentação / 1500 chars)
    const fullPitch = `Prezada equipe de atração de talentos da ${companyName},\n\nMeu nome é Pedro Paulo dos Santos Dantas e manifesto grande interesse na oportunidade de ${jobTitle}.\n\nTrago mais de 15 anos de sólida trajetória em Tecnologia da Informação. Em minha experiência mais recente de 4 anos na 1Doc Tecnologia, atuei inicialmente como Analista de Suporte e Atendimento Pleno (com ferramentas como Movidesk e Jira, diagnóstico de bugs e atendimento consultivo, além de implantação in loco em Araguaína/TO) e posteriormente como Analista de Integração, Automação e Migração de Dados, desenvolvendo integrações via APIs REST, automações de fluxos com n8n, webhooks, JavaScript e migração de bases relacionais com SQL, PostgreSQL, MariaDB e Docker.\n\nAtualmente também atuo como Analista de Suporte N2 na Lanlink Informática, lidando com incidentes de missão crítica, diagnóstico avançado de hardware, conectividade de rede (TCP/IP, VPN, DNS) e ambiente Windows corporativo com estrito cumprimento de SLAs. Anteriormente, acumulei sólida experiência em contratos de grande porte no Tribunal de Justiça de Sergipe (TJSE) e na Petrobras.\n\nPossuo graduação em Gestão da TI, pós-graduação em Desenvolvimento Full-Stack em andamento e inglês intermediário para documentações técnicas. Resido em Aracaju/SE, possuo disponibilidade para viagens corporativas e atuo tanto em regime CLT quanto PJ (com CNPJ ativo).\n\nAtenciosamente,\nPedro Paulo dos Santos Dantas`;
    answers.push({
      questionType: 'apresentacao_completa',
      questionPrompt: 'Carta de Apresentação Completa / Por que você quer trabalhar conosco?',
      suggestedAnswer: fullPitch,
      charCount: fullPitch.length,
      confidenceLevel: 'Alta'
    });

    // 3. Por que a empresa deveria contratar você? (Diferencial Competitivo)
    const whyHireMe = `Meu principal diferencial é aliar a maturidade técnica de mais de 15 anos em suporte resolutivo com a agilidade de construir integrações modernas com APIs REST, n8n e bancos de dados.\n\nNa 1Doc e Lanlink, aprendi a entender a dor real do cliente e a atuar tanto na ponta do atendimento (com Movidesk, Jira e GLPI) quanto no backend, criando integrações e automações definitivas para que incidentes repetitivos deixem de acontecer. Sou proativo, possuo excelente comunicação técnica, tenho disponibilidade para viagens e compromisso inegociável com a qualidade e prazos acordados.`;
    answers.push({
      questionType: 'por_que_contratar',
      questionPrompt: 'Por que devemos contratar você? Qual é o seu diferencial para esta vaga?',
      suggestedAnswer: whyHireMe,
      charCount: whyHireMe.length,
      confidenceLevel: 'Alta'
    });

    // 4. Experiência com Integração de Sistemas & APIs REST
    const integrationAnswer = `Na 1Doc, atuei diretamente na concepção e sustentação de integrações sistêmicas via APIs RESTful e tráfego de dados em formato JSON. Minhas responsabilidades incluíam consumo e validação de endpoints, implementação de webhooks para comunicação orientada a eventos, autenticação segura e tratamento de erros para garantir consistência e rastreabilidade nos fluxos de dados entre aplicações.`;
    answers.push({
      questionType: 'experiencia_integracao',
      questionPrompt: 'Fale sobre sua experiência com Integração de Sistemas e APIs REST:',
      suggestedAnswer: integrationAnswer,
      charCount: integrationAnswer.length,
      confidenceLevel: 'Alta'
    });

    // 5. Experiência Prática com Automação e n8n
    const automationAnswer = `Possuo vivência prática e diária na orquestração de processos através do n8n. Utilizo a ferramenta para conectar plataformas corporativas, acionar fluxos a partir de gatilhos (webhooks e schedules), aplicar transformações de dados com JavaScript em nós Function e automatizar rotinas manuais repetitivas, reduzindo prazos e eliminando erros operacionais.`;
    answers.push({
      questionType: 'experiencia_automacao',
      questionPrompt: 'Qual é a sua vivência prática com Automação de Processos e n8n?',
      suggestedAnswer: automationAnswer,
      charCount: automationAnswer.length,
      confidenceLevel: 'Alta'
    });

    // 6. Suporte Técnico N1/N2 & Atendimento Especializado
    const supportAnswer = `Possuo vasta experiência em suporte corporativo e Service Desk N1/N2, com atuações de destaque na Lanlink (N2), 1Doc (Suporte Pleno), Tribunal de Justiça (TJSE) e Petrobras. Tenho domínio no gerenciamento de filas e SLAs em plataformas como Movidesk, Jira Service Management e GLPI, além de suporte remoto seguro (AnyDesk, TeamViewer, RDP, SSH), administração de Windows, M365, Active Directory, certificados digitais e diagnóstico de conectividade em redes corporativas (TCP/IP, VPN, DNS, DHCP).`;
    answers.push({
      questionType: 'experiencia_suporte',
      questionPrompt: 'Como foi sua atuação em Suporte Técnico e Atendimento a Chamados?',
      suggestedAnswer: supportAnswer,
      charCount: supportAnswer.length,
      confidenceLevel: 'Alta'
    });

    // 7. Banco de Dados, SQL e Migração
    const dataAnswer = `Tenho experiência prática no tratamento, saneamento e migração de bases de dados relacionais utilizando SQL e PostgreSQL. Desenvolvi consultas complexas de validação, scripts de carga e utilizei Docker para isolamento de ambientes de integração, assegurando integridade e conformidade dos registros migrados de clientes.`;
    answers.push({
      questionType: 'experiencia_dados',
      questionPrompt: 'Qual é sua experiência com Banco de Dados, SQL e Migração de Dados?',
      suggestedAnswer: dataAnswer,
      charCount: dataAnswer.length,
      confidenceLevel: 'Alta'
    });

    // 8. Maior Conquista Profissional / Desafio Superado (Metodologia STAR)
    const starCase = `Minha maior conquista foi a transição orgânica de Suporte I para a área de Integração e Automação na 1Doc. Identifiquei gargalos em processos manuais de migração de clientes e passei a estruturar automações com n8n, APIs e scripts SQL.\n\nEssa iniciativa transformou rotinas que demandavam horas de intervenção manual em fluxos automatizados e auditáveis, assegurando integridade às bases de clientes e acelerando o onboarding técnico de novas contas.`;
    answers.push({
      questionType: 'maior_conquista',
      questionPrompt: 'Conte sobre sua maior conquista profissional ou desafio superado (Caso real):',
      suggestedAnswer: starCase,
      charCount: starCase.length,
      confidenceLevel: 'Alta'
    });

    // 9. Pontos Fortes e Pontos a Desenvolver
    const strengthsWeaknesses = `Como pontos fortes, destaco minha habilidade analítica para identificar a raiz dos problemas técnicos, proatividade na automação de tarefas manuais e comunicação clara com clientes e times interdisciplinares.\n\nComo ponto em constante desenvolvimento, busco expandir minha proficiência em arquitetura full-stack corporativa, motivo pelo qual estou cursando atualmente a pós-graduação em Desenvolvimento Full-stack.`;
    answers.push({
      questionType: 'pontos_fortes',
      questionPrompt: 'Quais são seus principais pontos fortes e o que você está desenvolvendo?',
      suggestedAnswer: strengthsWeaknesses,
      charCount: strengthsWeaknesses.length,
      confidenceLevel: 'Alta'
    });

    // 10. Trabalho sob Pressão e Prazos Críticos
    const pressureAnswer = `Diante de incidentes críticos ou prazos apertados, minha abordagem é priorizar por criticidade e impacto no negócio, mantendo alinhamento constante com a equipe. No suporte e nas integrações da 1Doc, atuei frequentemente sob SLAs rigorosos, mantendo a calma técnica necessária para diagnosticar a causa-raiz e restabelecer o serviço sem precipitações.`;
    answers.push({
      questionType: 'trabalho_sob_pressao',
      questionPrompt: 'Como você lida com prazos apertados, incidentes críticos e pressão?',
      suggestedAnswer: pressureAnswer,
      charCount: pressureAnswer.length,
      confidenceLevel: 'Alta'
    });

    // 11. Pretensão Salarial e Disponibilidade
    const salaryAnswer = `Minha pretensão salarial é alinhada às práticas de mercado para a complexidade da vaga e modalidade, estando totalmente aberto a propostas no regime CLT ou PJ condizentes com as responsabilidades. Possuo disponibilidade imediata para início.`;
    answers.push({
      questionType: 'pretensao_salarial',
      questionPrompt: 'Qual a sua pretensão salarial e prazo para início?',
      suggestedAnswer: salaryAnswer,
      charCount: salaryAnswer.length,
      confidenceLevel: 'Média',
      needsUserConfirmation: 'Informe o valor numérico exato na entrevista ou formulário respeitando os pisos cadastrados.'
    });

    // 12. Disponibilidade para Viagens e Localização (Aracaju/SE)
    const travelAnswer = `Resido em Aracaju, Sergipe, e possuo total disponibilidade para viagens corporativas, visitas técnicas a clientes ou períodos de imersão presencial conforme a necessidade da empresa. Atuo com excelência em modelo de trabalho remoto, mantendo rotina estruturada de comunicação assíncrona e entregas pontuais.`;
    answers.push({
      questionType: 'viagens_localizacao',
      questionPrompt: 'Qual sua localização e você possui disponibilidade para viagens?',
      suggestedAnswer: travelAnswer,
      charCount: travelAnswer.length,
      confidenceLevel: 'Alta'
    });

    // 13. Perguntas Customizadas do Formulário
    if (Array.isArray(customQuestions)) {
      for (const q of customQuestions) {
        if (!q.label && !q.title) continue;
        const prompt = q.label || q.title;
        const customRes = this.generateCustomAnswer(prompt, companyName, jobTitle);
        answers.push(customRes);
      }
    }

    return answers;
  }

  /**
   * Resolve qualquer pergunta livre de processo seletivo em primeira pessoa
   */
  public generateCustomAnswer(questionPrompt: string, companyName: string = 'Empresa', jobTitle: string = 'Vaga'): ApplicationAnswer {
    const qLower = questionPrompt.toLowerCase();

    let suggested = `Com base na minha vivência na 1Doc, atuei com foco em resolução ágil de problemas, automação de rotinas com n8n e sustentação de integrações via APIs REST e SQL, priorizando sempre a entrega de valor à equipe e aos usuários.`;
    let confidence: 'Alta' | 'Média' | 'Baixa' = 'Alta';
    let needsConfirmation: string | undefined = undefined;

    if (qLower.includes('inglês') || qLower.includes('idioma') || qLower.includes('english')) {
      suggested = `Possuo habilidade para leitura e interpretação técnica de documentações, chamados e interfaces em inglês.`;
      confidence = 'Média';
      needsConfirmation = 'Nível de conversação em inglês não cadastrado no perfil.';
    } else if (qLower.includes('conflito') || qLower.includes('divergência')) {
      suggested = `Quando surgem divergências no time ou com clientes, busco entender os fatos com empatia e escuta ativa, mantendo o foco no objetivo comum do projeto e na melhor solução técnica para o produto.`;
    } else if (qLower.includes('liderança') || qLower.includes('liderar')) {
      suggested = `Embora minha atuação seja como especialista técnico, exerço liderança técnica informal apoiando colegas, documentando fluxos e disseminando boas práticas de automação e integração na equipe.`;
    } else if (qLower.includes('por que quer sair') || qLower.includes('mudança')) {
      suggested = `Construí uma trajetória muito sólida e de grande aprendizado na 1Doc, evoluindo de suporte para integrações e dados. Busco agora uma nova etapa profissional para expandir meus horizontes em novos desafios de tecnologia na ${companyName}.`;
    }

    return {
      questionType: 'pergunta_personalizada',
      questionPrompt,
      suggestedAnswer: suggested,
      charCount: suggested.length,
      confidenceLevel: confidence,
      needsUserConfirmation: needsConfirmation
    };
  }
}
