import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../db/database.js';
import { SearchDiscoveryService } from '../services/search/SearchDiscoveryService.js';
import { GupyConnector } from '../services/connectors/GupyConnector.js';
import { GreenhouseConnector } from '../services/connectors/GreenhouseConnector.js';
import { LeverConnector } from '../services/connectors/LeverConnector.js';
import { AshbyConnector } from '../services/connectors/AshbyConnector.js';
import { DirectPortalCrawler } from '../services/connectors/DirectPortalCrawler.js';
import { ApplicationPrepService } from '../services/application/ApplicationPrepService.js';

export const apiRouter = Router();
const discoveryService = new SearchDiscoveryService();
const applicationPrep = new ApplicationPrepService();

// ==========================================
// 1. DASHBOARD
// ==========================================
apiRouter.get('/dashboard', (req: Request, res: Response) => {
  try {
    const lastRun = db.prepare('SELECT * FROM search_runs ORDER BY started_at DESC LIMIT 1').get() as any;
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_vagas,
        SUM(CASE WHEN is_new = 1 AND status != 'historico_conhecida' AND status NOT LIKE 'descartada_%' THEN 1 ELSE 0 END) as vagas_novas,
        SUM(CASE WHEN status = 'aberta_validada' THEN 1 ELSE 0 END) as vagas_validadas,
        SUM(CASE WHEN status = 'remuneracao_a_confirmar' THEN 1 ELSE 0 END) as vagas_remuneracao_a_confirmar,
        SUM(CASE WHEN status LIKE 'descartada_%' THEN 1 ELSE 0 END) as vagas_descartadas,
        SUM(CASE WHEN status = 'historico_conhecida' THEN 1 ELSE 0 END) as vagas_historico
      FROM jobs
    `).get() as any;

    const companiesCount = db.prepare("SELECT COUNT(*) as count FROM companies WHERE status = 'active'").get() as any;
    const applicationsCount = db.prepare("SELECT COUNT(*) as count FROM job_applications WHERE status NOT IN ('Reprovada', 'Encerrada', 'Desistência')").get() as any;
    const settings = db.prepare('SELECT key, value FROM system_settings').all() as any[];
    const scheduleTime = settings.find(s => s.key === 'schedule_time')?.value || '08:00';
    const scheduleEnabled = settings.find(s => s.key === 'schedule_enabled')?.value !== 'false';

    res.json({
      ultima_pesquisa: lastRun ? {
        data: lastRun.finished_at || lastRun.started_at,
        resumo: lastRun.summary,
        status: lastRun.status
      } : null,
      proxima_pesquisa: scheduleEnabled ? `Diariamente às ${scheduleTime} (America/Sao_Paulo)` : 'Automático pausado',
      empresas_consultadas: companiesCount?.count || 0,
      vagas_encontradas: stats?.total_vagas || 0,
      vagas_validadas: stats?.vagas_validadas || 0,
      vagas_novas: stats?.vagas_novas || 0,
      vagas_descartadas: stats?.vagas_descartadas || 0,
      vagas_remuneracao_a_confirmar: stats?.vagas_remuneracao_a_confirmar || 0,
      vagas_historico: stats?.vagas_historico || 0,
      candidaturas_em_andamento: applicationsCount?.count || 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. VAGAS (JOBS)
// ==========================================
apiRouter.get('/jobs', (req: Request, res: Response) => {
  try {
    const { category, modality, regime, search } = req.query;

    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params: any[] = [];

    if (category === 'novas') {
      query += " AND is_new = 1 AND status != 'historico_conhecida' AND status NOT LIKE 'descartada_%'";
    } else if (category === 'remuneracao_a_confirmar') {
      query += " AND status = 'remuneracao_a_confirmar'";
    } else if (category === 'qualificadas') {
      query += " AND status IN ('aberta_validada', 'remuneracao_a_confirmar') AND compatibility_level IN ('Alta', 'Média')";
    } else if (category === 'salvas') {
      query += " AND is_saved = 1";
    } else if (category === 'descartadas') {
      query += " AND status LIKE 'descartada_%'";
    } else if (category === 'historico') {
      query += " AND status = 'historico_conhecida'";
    }

    if (modality) {
      query += ' AND modality = ?';
      params.push(modality);
    }

    if (regime) {
      query += ' AND regime = ?';
      params.push(regime);
    }

    if (search) {
      query += ' AND (title LIKE ? OR company_name LIKE ? OR description_full LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const jobs = db.prepare(query).all(...params);
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/jobs/:id', (req: Request, res: Response) => {
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id) as any;
    if (!job) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }

    const evidence = db.prepare('SELECT * FROM job_evidences WHERE job_id = ?').get(req.params.id) as any;
    const compatibility = db.prepare('SELECT * FROM job_compatibility_details WHERE job_id = ?').get(req.params.id) as any;
    const answers = db.prepare('SELECT * FROM application_answers WHERE job_id = ?').all(req.params.id) as any[];
    const application = db.prepare('SELECT * FROM job_applications WHERE job_id = ?').get(req.params.id) as any;

    res.json({
      ...job,
      evidence,
      compatibility: compatibility ? {
        ...compatibility,
        matching_points: JSON.parse(compatibility.matching_points || '[]'),
        mandatory_fulfilled: JSON.parse(compatibility.mandatory_fulfilled || '[]'),
        mandatory_partial: JSON.parse(compatibility.mandatory_partial || '[]'),
        mandatory_unproven: JSON.parse(compatibility.mandatory_unproven || '[]'),
        missing_desirables: JSON.parse(compatibility.missing_desirables || '[]'),
        attention_points: JSON.parse(compatibility.attention_points || '[]')
      } : null,
      application_answers: answers,
      application
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/jobs/:id/save', (req: Request, res: Response) => {
  try {
    const job = db.prepare('SELECT is_saved FROM jobs WHERE id = ?').get(req.params.id) as any;
    if (!job) return res.status(404).json({ error: 'Vaga não encontrada' });
    const newSaved = job.is_saved ? 0 : 1;
    db.prepare('UPDATE jobs SET is_saved = ? WHERE id = ?').run(newSaved, req.params.id);
    res.json({ is_saved: newSaved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/jobs/:id/status', (req: Request, res: Response) => {
  try {
    const { status, discard_reason } = req.body;
    db.prepare('UPDATE jobs SET status = ?, discard_reason = ? WHERE id = ?').run(status, discard_reason || null, req.params.id);
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. PESQUISA & VARREDURA (SEARCH)
// ==========================================
apiRouter.post('/search/run', async (req: Request, res: Response) => {
  try {
    // Iniciar varredura em background e retornar imediatamente para feedback ágil da UI
    const trigger = req.body.trigger_type || 'manual';
    discoveryService.executeRun(trigger).then(summary => {
      console.log(`[SearchRun] Finalizado: ${summary}`);
    }).catch(err => {
      console.error('[SearchRun] Erro:', err);
    });

    res.json({ message: 'Varredura iniciada nas fontes oficiais.', status: 'running' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/search/runs', (req: Request, res: Response) => {
  try {
    const runs = db.prepare('SELECT * FROM search_runs ORDER BY started_at DESC LIMIT 20').all();
    res.json(runs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verificação pontual de qualquer URL diretamente pela interface
apiRouter.post('/search/check-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL obrigatória' });

    let connector;
    if (url.includes('.gupy.io')) connector = new GupyConnector();
    else if (url.includes('greenhouse.io')) connector = new GreenhouseConnector();
    else if (url.includes('lever.co')) connector = new LeverConnector();
    else if (url.includes('ashbyhq.com')) connector = new AshbyConnector();
    else connector = new DirectPortalCrawler();

    const result = await connector.fetchJobDetails(url);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. EMPRESAS MONITORADAS (COMPANIES)
// ==========================================
apiRouter.get('/companies', (req: Request, res: Response) => {
  try {
    const companies = db.prepare('SELECT * FROM companies ORDER BY name ASC').all();
    res.json(companies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/companies', (req: Request, res: Response) => {
  try {
    const { name, domain, website_url, career_url, ats_type, ats_slug, ats_evidence, notes } = req.body;
    const id = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO companies (
        id, name, domain, website_url, career_url, ats_type, ats_slug,
        ats_evidence, verified_link, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, ?)
    `).run(
      id, name, domain, website_url || null, career_url || null, ats_type || 'direct',
      ats_slug || null, ats_evidence || 'Cadastrada manualmente', notes || null, now
    );

    res.json({ id, message: 'Empresa cadastrada com sucesso' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/companies/:id', (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PERFIL PROFISSIONAL DO CANDIDATO
// ==========================================
apiRouter.get('/profile', (req: Request, res: Response) => {
  try {
    const profile = db.prepare('SELECT * FROM candidate_profile WHERE id = ?').get('pedro_paulo') as any;
    if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
    res.json({
      ...profile,
      experience: JSON.parse(profile.experience_json),
      education: JSON.parse(profile.education_json),
      skills: JSON.parse(profile.skills_json),
      preferences: JSON.parse(profile.preferences_json)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/profile', (req: Request, res: Response) => {
  try {
    const { name, location, linkedin_url, email, phone, summary, experience, education, skills, preferences } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE candidate_profile SET
        name = ?, location = ?, linkedin_url = ?, email = ?, phone = ?,
        summary = ?, experience_json = ?, education_json = ?, skills_json = ?,
        preferences_json = ?, updated_at = ?
      WHERE id = 'pedro_paulo'
    `).run(
      name, location, linkedin_url, email, phone, summary,
      JSON.stringify(experience), JSON.stringify(education),
      JSON.stringify(skills), JSON.stringify(preferences), now
    );

    res.json({ success: true, updated_at: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. ACOMPANHAMENTO DE CANDIDATURAS (KANBAN)
// ==========================================
apiRouter.get('/applications', (req: Request, res: Response) => {
  try {
    const applications = db.prepare(`
      SELECT a.*, j.title as job_title, j.company_name, j.official_url, j.modality, j.regime, j.salary_notes
      FROM job_applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.updated_at DESC
    `).all();
    res.json(applications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/applications', (req: Request, res: Response) => {
  try {
    const { job_id, status, resume_version_used, salary_claim, notes, next_step, interview_at } = req.body;
    const existing = db.prepare('SELECT id FROM job_applications WHERE job_id = ?').get(job_id) as any;
    const now = new Date().toISOString();

    if (existing) {
      db.prepare(`
        UPDATE job_applications SET
          status = ?, resume_version_used = ?, salary_claim = ?,
          notes = ?, next_step = ?, interview_at = ?, updated_at = ?
        WHERE id = ?
      `).run(status, resume_version_used, salary_claim, notes, next_step, interview_at, now, existing.id);
      return res.json({ id: existing.id, updated: true });
    }

    const id = randomUUID();
    db.prepare(`
      INSERT INTO job_applications (
        id, job_id, status, applied_at, interview_at, resume_version_used,
        salary_claim, next_step, notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, job_id, status || 'Interessante',
      status === 'Candidatura realizada pelo candidato' ? now : null,
      interview_at || null, resume_version_used || 'Geral',
      salary_claim || null, next_step || null, notes || null, now
    );

    res.json({ id, created: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. CURRÍCULOS DIRECIONADOS (RESUMES)
// ==========================================
apiRouter.get('/resumes', (req: Request, res: Response) => {
  try {
    const resumes = db.prepare('SELECT * FROM resumes ORDER BY targeted_area ASC').all() as any[];
    res.json(resumes.map(r => ({ ...r, content: JSON.parse(r.content_json) })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/resumes/:id', (req: Request, res: Response) => {
  try {
    const resume = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id) as any;
    if (!resume) return res.status(404).json({ error: 'Currículo não encontrado' });
    res.json({ ...resume, content: JSON.parse(resume.content_json) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. CONFIGURAÇÕES DO SISTEMA (SETTINGS)
// ==========================================
apiRouter.get('/settings', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM system_settings').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const settings = req.body; // Array de { key, value }
    const update = db.prepare('UPDATE system_settings SET value = ? WHERE key = ?');
    for (const s of settings) {
      update.run(String(s.value), s.key);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. LOGS E DIAGNÓSTICO
// ==========================================
apiRouter.get('/logs', (req: Request, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. GERADOR DE RESPOSTAS PERSONALIZADAS EM 1ª PESSOA
// ==========================================
apiRouter.post('/application/custom-answer', (req: Request, res: Response) => {
  try {
    const { question, companyName, jobTitle } = req.body;
    if (!question) return res.status(400).json({ error: 'Pergunta obrigatória' });

    const answer = applicationPrep.generateCustomAnswer(question, companyName, jobTitle);
    res.json(answer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. EXPORTAÇÃO DE HISTÓRICO
// ==========================================
apiRouter.get('/export/jobs.json', (req: Request, res: Response) => {
  try {
    const jobs = db.prepare('SELECT * FROM jobs').all();
    res.setHeader('Content-Disposition', 'attachment; filename="vagas_certa_historico.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(jobs, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
