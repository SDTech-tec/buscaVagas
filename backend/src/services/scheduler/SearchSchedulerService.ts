import cron from 'node-cron';
import { db } from '../../db/database.js';
import { SearchDiscoveryService } from '../search/SearchDiscoveryService.js';

export class SearchSchedulerService {
  private discoveryService = new SearchDiscoveryService();
  private scheduledTask: cron.ScheduledTask | null = null;

  public init() {
    const enabledSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'schedule_enabled'").get() as any;
    const timeSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'schedule_time'").get() as any;
    const tzSetting = db.prepare("SELECT value FROM system_settings WHERE key = 'timezone'").get() as any;

    const enabled = enabledSetting?.value !== 'false';
    const timeStr = timeSetting?.value || '08:00';
    const timezone = tzSetting?.value || 'America/Sao_Paulo';

    const [hour, minute] = timeStr.split(':');
    const cronExpression = `${minute || '0'} ${hour || '8'} * * *`;

    if (this.scheduledTask) {
      this.scheduledTask.stop();
    }

    if (enabled) {
      console.log(`[Scheduler] Agendamento ativo: '${cronExpression}' no fuso '${timezone}'.`);
      this.scheduledTask = cron.schedule(
        cronExpression,
        async () => {
          console.log(`[Scheduler] Iniciando pesquisa diária automática (${new Date().toLocaleString('pt-BR', { timeZone: timezone })})...`);
          try {
            const summary = await this.discoveryService.executeRun('agendada');
            console.log(`[Scheduler] Execução concluída: ${summary}`);
          } catch (err: any) {
            console.error(`[Scheduler] Erro na execução agendada:`, err.message);
          }
        },
        {
          timezone
        }
      );
    } else {
      console.log('[Scheduler] Execução automática desabilitada nas configurações.');
    }
  }

  public updateSchedule() {
    this.init();
  }
}
