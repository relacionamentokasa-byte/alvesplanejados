import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { alvesAuthMiddleware, isAlvesRole, signAlvesToken } from '../../middlewares/alvesAuth.js';

export const alvesAuthRouter = Router();

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(4, 'Senha deve ter pelo menos 4 caracteres')
});

const publicUser = (user: { id: string; name: string; email: string; role: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

alvesAuthRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.alvesUser.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.active) return res.status(401).json({ error: 'Credenciais inválidas ou usuário Alves inativo' });
    if (!(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Credenciais inválidas' });

    if (!isAlvesRole(user.role)) return res.status(401).json({ error: 'Perfil Alves inválido' });
    const payload = { ...publicUser(user), role: user.role };
    return res.json({ token: signAlvesToken(payload), user: payload });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    console.error('Erro detalhado no login Alves:', err);
    const errorDetails = process.env.NODE_ENV === 'production' && !err?.message?.includes('prisma')
      ? err?.message
      : 'Erro de conexão com o banco de dados ou autenticação.';
    return res.status(500).json({
      error: `Erro interno ao autenticar área Alves: ${err?.message || 'desconhecido'}`
    });
  }
});

alvesAuthRouter.get('/me', alvesAuthMiddleware, (req: Request, res: Response) => {
  return res.json({ user: req.alvesUser });
});

const forgotPasswordSchema = z.object({ email: z.string().email('Informe um e-mail válido') });

alvesAuthRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.alvesUser.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (user?.active) {
      await prisma.alvesUser.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: crypto.randomBytes(32).toString('hex'),
          resetPasswordExpires: new Date(Date.now() + 3600000)
        }
      });
    }

    return res.json({ success: true, message: 'Se o e-mail estiver cadastrado, as instruções de recuperação foram preparadas.' });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao processar recuperação de senha Alves' });
  }
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(4, 'Nova senha deve ter pelo menos 4 caracteres')
});

alvesAuthRouter.post('/reset-password-with-token', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const user = await prisma.alvesUser.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() }, active: true }
    });
    if (!user) return res.status(400).json({ error: 'O link de recuperação Alves é inválido ou expirou.' });

    await prisma.alvesUser.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10), resetPasswordToken: null, resetPasswordExpires: null }
    });
    return res.json({ success: true, message: 'Senha Alves redefinida com sucesso.' });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao redefinir senha Alves' });
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(4, 'Nova senha deve ter pelo menos 4 caracteres')
});

alvesAuthRouter.post('/change-password', alvesAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await prisma.alvesUser.findUnique({ where: { id: req.alvesUser!.id } });
    if (!user) return res.status(404).json({ error: 'Usuário Alves não encontrado' });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ error: 'Senha atual incorreta' });

    await prisma.alvesUser.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } });
    return res.json({ success: true, message: 'Senha Alves alterada com sucesso' });
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    return res.status(500).json({ error: 'Erro ao alterar senha Alves' });
  }
});

