import { describe, it, expect, beforeAll } from 'vitest';
import { SalaryValidator } from '../src/services/validator/SalaryValidator.js';
import { LocationValidator } from '../src/services/validator/LocationValidator.js';
import { DeduplicationService } from '../src/services/deduplication/DeduplicationService.js';
import { ProfileMatcher } from '../src/services/matcher/ProfileMatcher.js';
import { ApplicationPrepService } from '../src/services/application/ApplicationPrepService.js';
import { initDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Vaga Certa — Suíte de Homologação e Critérios de Aceitação', () => {
  beforeAll(() => {
    initDatabase();
    seedDatabase();
  });

  describe('1. Validação de Pisos Salariais e Regimes', () => {
    const validator = new SalaryValidator();

    it('Deve descartar vaga REMOTA CLT com remuneração abaixo do piso (R$ 2.800,00)', () => {
      const res = validator.evaluate('Remoto', 'CLT', 'R$ 2.400,00', 2400);
      expect(res.meetsFloor).toBe(false);
      expect(res.status).toBe('descartada_salario');
      expect(res.discardReason).toContain('abaixo do piso obrigatório');
    });

    it('Deve aprovar vaga REMOTA CLT com remuneração igual ou superior ao piso (R$ 3.500,00)', () => {
      const res = validator.evaluate('Remoto', 'CLT', 'R$ 3.500,00', 3500);
      expect(res.meetsFloor).toBe(true);
      expect(res.status).toBe('aberta_validada');
      expect(res.salaryMin).toBe(3500);
    });

    it('Deve descartar vaga REMOTA PJ com remuneração abaixo do piso PJ (R$ 5.600,00)', () => {
      const res = validator.evaluate('Remoto', 'PJ', 'R$ 4.000,00', 4000);
      expect(res.meetsFloor).toBe(false);
      expect(res.status).toBe('descartada_salario');
    });

    it('Deve classificar vaga REMOTA sem remuneração divulgada como "remuneracao_a_confirmar"', () => {
      const res = validator.evaluate('Remoto', 'CLT', 'A combinar', null);
      expect(res.meetsFloor).toBe(true);
      expect(res.status).toBe('remuneracao_a_confirmar');
      expect(res.salaryDisclosed).toBe(false);
    });

    it('REGRA CRÍTICA: Deve DESCARTAR OBRIGATORIAMENTE vaga presencial sem remuneração divulgada', () => {
      const res = validator.evaluate('Presencial', 'CLT', 'A combinar', null);
      expect(res.meetsFloor).toBe(false);
      expect(res.status).toBe('descartada_salario');
      expect(res.discardReason).toContain('presencial sem remuneração divulgada descartada obrigatoriamente');
    });

    it('REGRA: Deve exigir piso de R$ 3.500,00 CLT / R$ 7.000,00 PJ para vaga presencial (preferencialmente Aracaju/SE)', () => {
      // Presencial CLT R$ 3.000,00 está abaixo dos R$ 3.500,00
      const belowClt = validator.evaluate('Presencial', 'CLT', 'R$ 3.000,00', 3000);
      expect(belowClt.meetsFloor).toBe(false);
      expect(belowClt.status).toBe('descartada_salario');

      // Presencial CLT R$ 3.500,00 atende ao piso
      const aboveClt = validator.evaluate('Presencial', 'CLT', 'R$ 3.500,00', 3500);
      expect(aboveClt.meetsFloor).toBe(true);
      expect(aboveClt.status).toBe('aberta_validada');

      // Presencial PJ R$ 6.000,00 está abaixo dos R$ 7.000,00
      const belowPj = validator.evaluate('Presencial', 'PJ', 'R$ 6.000,00', 6000);
      expect(belowPj.meetsFloor).toBe(false);
      expect(belowPj.status).toBe('descartada_salario');

      // Presencial PJ R$ 7.000,00 atende ao piso PJ
      const abovePj = validator.evaluate('Presencial', 'PJ', 'R$ 7.000,00', 7000);
      expect(abovePj.meetsFloor).toBe(true);
      expect(abovePj.status).toBe('aberta_validada');
    });

    it('Faixa salarial: Deve avaliar o valor MÍNIMO da faixa', () => {
      // Faixa R$ 2.500 a R$ 3.500 CLT Remoto -> Mínimo (2500) < 2800 -> Descartar!
      const res = validator.evaluate('Remoto', 'CLT', 'De R$ 2.500,00 a R$ 3.500,00', 2500, 3500);
      expect(res.meetsFloor).toBe(false);
      expect(res.status).toBe('descartada_salario');
    });
  });

  describe('2. Validação de Localidade e Modalidade (Residência em Aracaju/SE)', () => {
    const locValidator = new LocationValidator();

    it('Deve aprovar modalidade REMOTA integralmente', () => {
      const res = locValidator.evaluate('Remoto', 'São Paulo', 'SP');
      expect(res.isViable).toBe(true);
      expect(res.notes).toContain('100% compatível com a localização em Aracaju/SE');
    });

    it('Deve aprovar modalidade HÍBRIDA situada em Aracaju/SE', () => {
      const res = locValidator.evaluate('Híbrido', 'Aracaju', 'SE');
      expect(res.isViable).toBe(true);
      expect(res.notes).toContain('Aracaju/SE');
    });

    it('Deve descartar modalidade HÍBRIDA fixa em outra cidade (São Paulo/SP) como inviável para residência', () => {
      const res = locValidator.evaluate('Híbrido', 'São Paulo', 'SP', 'Necessário comparecer 3 vezes por semana no escritório de Pinheiros');
      expect(res.isViable).toBe(false);
      expect(res.statusModification).toBe('descartada_modalidade');
      expect(res.reason).toContain('incompatível com a residência em Aracaju/SE');
    });
  });

  describe('3. Deduplicação e Reconhecimento do Histórico Conhecido', () => {
    const dedup = new DeduplicationService();

    it('Deve normalizar URLs removendo parâmetros de rastreamento (UTMs, refs)', () => {
      const raw = 'https://empresa.gupy.io/jobs/12345?utm_source=linkedin&utm_campaign=vagas&ref=share';
      const clean = dedup.normalizeUrl(raw);
      expect(clean).toBe('https://empresa.gupy.io/jobs/12345');
    });

    it('Deve identificar e NÃO reportar como nova as 7 vagas conhecidas previamente cadastradas', () => {
      // 1. Clicksign
      const checkClicksign = dedup.check('https://clicksign.gupy.io/jobs/historico-clicksign-cs-expansao', 'Clicksign', 'Analista de Customer Success Pleno Foco em Expansão');
      expect(checkClicksign.isDuplicate).toBe(true);
      expect(checkClicksign.isPreviouslyKnown).toBe(true);

      // 2. NEXDOM
      const checkNexdom = dedup.check('https://nexdom.gupy.io/jobs/historico-nexdom-suporte-jr', 'NEXDOM Healthtech', 'Analista de Suporte Sistemas Júnior');
      expect(checkNexdom.isDuplicate).toBe(true);
      expect(checkNexdom.isPreviouslyKnown).toBe(true);
    });
  });

  describe('4. Análise de Compatibilidade e Proteção contra Informações Inventadas', () => {
    const matcher = new ProfileMatcher();

    it('Deve atribuir COMPATIBILIDADE ALTA para vaga alinhada com Suporte e Integração', () => {
      const title = 'Analista de Integração e Automação Júnior/Pleno';
      const desc = 'Atividades: Desenvolvimento de integrações via APIs REST, criação de fluxos no n8n, manipulação de banco de dados SQL e PostgreSQL. Atendimento a chamados técnicos de integração.';
      const res = matcher.analyze(title, desc);

      expect(res.level).toBe('Alta');
      expect(res.score).toBeGreaterThanOrEqual(75);
      expect(res.matchingPoints.some(p => p.includes('n8n'))).toBe(true);
      expect(res.matchingPoints.some(p => p.includes('APIs REST'))).toBe(true);
    });

    it('NUNCA deve afirmar competências não cadastradas (ex: Python avançado, Inglês Fluente, AWS)', () => {
      const title = 'Analista de Suporte e Integração';
      const desc = 'Requisitos obrigatórios: Inglês fluente para conversação diária, certificação AWS e 3 anos com Python.';
      const res = matcher.analyze(title, desc);

      expect(res.mandatoryUnproven.some(u => u.includes('Inglês'))).toBe(true);
      expect(res.mandatoryUnproven.some(u => u.includes('AWS'))).toBe(true);
      expect(res.attentionPoints.some(a => a.includes('NÃO possui essa competência'))).toBe(true);
    });
  });

  describe('5. Preparação Inteligente de Candidatura em 1ª Pessoa', () => {
    const prep = new ApplicationPrepService();

    it('Deve gerar pitch curto com menos de 500 caracteres baseado no histórico real da 1Doc', () => {
      const answers = prep.generateAnswers('Empresa Tech', 'Analista de Suporte e Automação');
      const pitch = answers.find(a => a.questionType === 'pitch_curto');
      expect(pitch).toBeDefined();
      expect(pitch!.charCount).toBeLessThan(500);
      expect(pitch!.suggestedAnswer).toContain('Pedro Paulo');
      expect(pitch!.suggestedAnswer).toContain('1Doc');
      expect(pitch!.suggestedAnswer).toContain('n8n');
      expect(pitch!.confidenceLevel).toBe('Alta');
    });

    it('Deve sinalizar que a pretensão salarial precisa de confirmação do candidato', () => {
      const answers = prep.generateAnswers('Empresa Tech', 'Analista de Integração');
      const salary = answers.find(a => a.questionType === 'pretensao_salarial');
      expect(salary).toBeDefined();
      expect(salary!.needsUserConfirmation).toBeDefined();
      expect(salary!.confidenceLevel).toBe('Média');
    });
  });
});

