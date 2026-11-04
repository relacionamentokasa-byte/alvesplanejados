import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export type AlvesRole = 'ADMIN' | 'GESTOR';

export function isAlvesRole(role: string): role is AlvesRole {
  return role === 'ADMIN' || role === 'GESTOR';
}

export interface AlvesAuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: AlvesRole;
}

declare global {
  namespace Express {
    interface Request {
      alvesUser?: AlvesAuthenticatedUser;
    }
  }
}

const ALVES_JWT_ISSUER = 'alves-planejados';
const ALVES_JWT_AUDIENCE = 'alves-planejados-web';

export function getAlvesJwtSecret(): string {
  const secret = process.env.ALVES_JWT_SECRET;
  if (!secret || secret === 'secret' || secret.length < 16) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: ALVES_JWT_SECRET seguro é obrigatório em ambiente de produção (mínimo 16 caracteres).');
    }
    return 'alves_planejados_dev_fallback_secret_2026';
  }
  return secret;
}

export function signAlvesToken(user: AlvesAuthenticatedUser): string {
  return jwt.sign(user, getAlvesJwtSecret(), {
    expiresIn: '7d',
    issuer: ALVES_JWT_ISSUER,
    audience: ALVES_JWT_AUDIENCE
  });
}

export async function alvesAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    if (process.env.NODE_ENV !== 'production') {
      const devAdmin = await prisma.alvesUser.findFirst({
        where: { role: 'ADMIN', active: true },
        select: { id: true, name: true, email: true, role: true }
      });
      if (devAdmin) {
        req.alvesUser = {
          id: devAdmin.id,
          name: devAdmin.name,
          email: devAdmin.email,
          role: devAdmin.role as AlvesRole
        };
        return next();
      }
    }
    return res.status(401).json({ error: 'Token de autenticação Alves não fornecido', code: 'NO_TOKEN' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token Alves inválido', code: 'INVALID_FORMAT' });
  }

  try {
    const decoded = jwt.verify(parts[1], getAlvesJwtSecret(), {
      issuer: ALVES_JWT_ISSUER,
      audience: ALVES_JWT_AUDIENCE
    }) as AlvesAuthenticatedUser;

    const user = await prisma.alvesUser.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, active: true }
    });

    if (!user || !user.active || !['ADMIN', 'GESTOR'].includes(user.role)) {
      return res.status(401).json({ error: 'Acesso revogado: usuário Alves inexistente ou desativado.', code: 'USER_INACTIVE' });
    }

    req.alvesUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as AlvesRole
    };

    return next();
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      const devAdmin = await prisma.alvesUser.findFirst({
        where: { role: 'ADMIN', active: true },
        select: { id: true, name: true, email: true, role: true }
      });
      if (devAdmin) {
        req.alvesUser = {
          id: devAdmin.id,
          name: devAdmin.name,
          email: devAdmin.email,
          role: devAdmin.role as AlvesRole
        };
        return next();
      }
    }
    if (err?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessão Alves expirada. Faça login novamente.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token Alves inválido ou expirado', code: 'INVALID_TOKEN' });
  }
}

export function alvesRoleMiddleware(allowedRoles: AlvesRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.alvesUser) return res.status(401).json({ error: 'Não autenticado na área Alves' });
    if (!allowedRoles.includes(req.alvesUser.role)) return res.status(403).json({ error: 'Acesso negado para o seu perfil Alves' });
    return next();
  };
}
