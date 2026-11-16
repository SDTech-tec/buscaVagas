import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { createSessionToken, isValidSession, revokeSession } from '../middleware/auth.js';

export const authRouter = Router();

// Acesso direto e irrestrito para Pedro Paulo (usuário exclusivo da aplicação)
authRouter.all('/login', (req: Request, res: Response) => {
  const token = createSessionToken();
  res.json({
    success: true,
    token,
    user: {
      name: 'Pedro Paulo dos Santos Dantas',
      email: 'ppsantos.se@gmail.com'
    }
  });
});

authRouter.all('/auto-login', (req: Request, res: Response) => {
  const token = createSessionToken();
  res.json({
    success: true,
    token,
    user: {
      name: 'Pedro Paulo dos Santos Dantas',
      email: 'ppsantos.se@gmail.com'
    }
  });
});

authRouter.all('/verify', (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: {
      name: 'Pedro Paulo dos Santos Dantas',
      email: 'ppsantos.se@gmail.com'
    }
  });
});

authRouter.all('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Sessão limpa.' });
});

authRouter.post('/change-password', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-auth-token'] as string);

  if (!isValidSession(token)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { currentPassword, newPassword } = req.body;
  const actualPassword = getMasterPassword();

  if (currentPassword !== actualPassword) {
    return res.status(400).json({ error: 'Senha atual incorreta.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  db.prepare(`
    INSERT INTO system_settings (key, value, description)
    VALUES ('master_password', ?, 'Senha de acesso exclusivo do candidato')
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(newPassword);

  res.json({ success: true, message: 'Senha atualizada com sucesso!' });
});

