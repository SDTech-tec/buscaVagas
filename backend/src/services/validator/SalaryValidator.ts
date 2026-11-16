import { JobModality, JobRegime, JobStatus, SalaryCheckResult } from '../../types/index.js';
import { db } from '../../db/database.js';

export class SalaryValidator {
  private getSettings(): Record<string, number> {
    const rows = db.prepare("SELECT key, value FROM system_settings WHERE key LIKE 'floor_%'").all() as { key: string; value: string }[];
    const settings: Record<string, number> = {
      floor_remote_clt: 2800,
      floor_remote_pj: 5600,
      floor_hybrid_clt: 2800,
      floor_hybrid_pj: 5600,
      floor_onsite_clt: 3500,
      floor_onsite_pj: 7000
    };
    for (const r of rows) {
      const val = parseFloat(r.value);
      if (!isNaN(val)) {
        settings[r.key] = val;
      }
    }
    return settings;
  }

  public parseSalary(salaryRaw?: string | null): { min: number | null; max: number | null; isMonthly: boolean; isVariable: boolean; notes: string } {
    if (!salaryRaw || salaryRaw.trim() === '' || salaryRaw.toLowerCase().includes('a combinar') || salaryRaw.toLowerCase().includes('não divulgado')) {
      return { min: null, max: null, isMonthly: true, isVariable: false, notes: 'Não divulgado' };
    }

    const text = salaryRaw.toLowerCase();
    const isVariable = text.includes('comissão') || text.includes('variável') || text.includes('bônus');
    let isMonthly = true;
    if (text.includes('/ano') || text.includes('ano') || text.includes('anual') || text.includes('per year')) {
      isMonthly = false;
    }

    // Extrair números no padrão brasileiro R$ 3.500,00 ou 3500
    const numbers = text.match(/\d+[\.\d]*(?:,\d{2})?/g);
    if (!numbers || numbers.length === 0) {
      return { min: null, max: null, isMonthly, isVariable, notes: salaryRaw };
    }

    const parsedNums: number[] = numbers.map(n => {
      let clean = n.replace(/\./g, '').replace(',', '.');
      let val = parseFloat(clean);
      if (!isMonthly && val > 0) {
        val = val / 12; // Normalizar para base mensal
      }
      return val;
    }).filter(n => !isNaN(n) && n > 200); // Filtrar ruídos pequenos

    if (parsedNums.length === 0) {
      return { min: null, max: null, isMonthly, isVariable, notes: salaryRaw };
    }

    parsedNums.sort((a, b) => a - b);
    const min = parsedNums[0];
    const max = parsedNums.length > 1 ? parsedNums[parsedNums.length - 1] : min;

    let notes = `R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (max > min) {
      notes += ` a R$ ${max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (isVariable) notes += ' (+ remuneração variável/comissão)';
    if (!isMonthly) notes += ' (convertido de base anual)';

    return { min, max, isMonthly: true, isVariable, notes };
  }

  public evaluate(
    modality: JobModality,
    regime: JobRegime,
    salaryRaw?: string | null,
    salaryMin?: number | null,
    salaryMax?: number | null
  ): SalaryCheckResult {
    const floors = this.getSettings();

    // Determinar piso aplicável
    let floor = 2800; // default baseline
    if (modality === 'Remoto') {
      floor = regime === 'PJ' ? floors.floor_remote_pj : floors.floor_remote_clt;
    } else if (modality === 'Híbrido') {
      floor = regime === 'PJ' ? floors.floor_hybrid_pj : floors.floor_hybrid_clt;
    } else if (modality === 'Presencial') {
      floor = regime === 'PJ' ? floors.floor_onsite_pj : floors.floor_onsite_clt;
    } else {
      // Modalidade a confirmar
      floor = regime === 'PJ' ? floors.floor_remote_pj : floors.floor_remote_clt;
    }

    // Se não veio salaryMin já parsed, tentar parsear
    let min = salaryMin ?? null;
    let max = salaryMax ?? null;
    let notes = salaryRaw || 'Não divulgado';

    if (min === null && salaryRaw) {
      const parsed = this.parseSalary(salaryRaw);
      min = parsed.min;
      max = parsed.max;
      notes = parsed.notes;
    }

    const salaryDisclosed = min !== null && min > 0;

    // REGRA 3: Vagas totalmente presenciais sem remuneração divulgada DEVEM ser descartadas
    if (modality === 'Presencial' && !salaryDisclosed) {
      return {
        meetsFloor: false,
        status: 'descartada_salario',
        salaryNotes: 'Remuneração não divulgada para vaga presencial',
        salaryDisclosed: false,
        salaryMin: null,
        salaryMax: null,
        discardReason: `Vaga presencial sem remuneração divulgada descartada obrigatoriamente (Piso exigido: R$ ${floors.floor_onsite_clt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} CLT / R$ ${floors.floor_onsite_pj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} PJ, preferencialmente Aracaju/SE).`
      };
    }

    // REGRA 2: Se a remuneração não estiver divulgada em Remoto ou Híbrido, vai para "Remuneração a confirmar"
    if (!salaryDisclosed) {
      return {
        meetsFloor: true, // Não elimina da visualização, classifica para checagem
        status: 'remuneracao_a_confirmar',
        salaryNotes: 'Remuneração a confirmar (não informada no anúncio oficial)',
        salaryDisclosed: false,
        salaryMin: null,
        salaryMax: null
      };
    }

    // REGRA 7: Quando houver faixa salarial, verificar se o valor MÍNIMO atende ao piso
    if (min < floor) {
      return {
        meetsFloor: false,
        status: 'descartada_salario',
        salaryNotes: `${notes} (Abaixo do piso de R$ ${floor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
        salaryDisclosed: true,
        salaryMin: min,
        salaryMax: max,
        discardReason: `Remuneração mínima informada (R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) está abaixo do piso obrigatório para ${modality} ${regime} (R$ ${floor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`
      };
    }

    // Atende ao piso!
    return {
      meetsFloor: true,
      status: 'aberta_validada',
      salaryNotes: notes,
      salaryDisclosed: true,
      salaryMin: min,
      salaryMax: max
    };
  }
}
