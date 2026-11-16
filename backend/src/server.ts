import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { apiRouter } from './routes/api.js';
import { authRouter } from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';
import { SearchSchedulerService } from './services/scheduler/SearchSchedulerService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares essenciais
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Inicializar banco de dados e sementes iniciais
initDatabase();
seedDatabase();

// Iniciar agendador diário (America/Sao_Paulo)
const scheduler = new SearchSchedulerService();
scheduler.init();

// Rotas de Autenticação Exclusiva
app.use('/api/auth', authRouter);

// Rotas da API protegidas por autenticação
app.use('/api', authMiddleware, apiRouter);

// Servir frontend compilado em produção se existir
const frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');
app.use(express.static(frontendDistPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vaga Certa API', timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Vaga Certa — Backend iniciado com sucesso na porta ${PORT}`);
  console.log(`📡 API REST disponível em: http://localhost:${PORT}/api`);
  console.log(`⏰ Agendamento diário ativo no fuso America/Sao_Paulo`);
  console.log(`=======================================================`);
});
