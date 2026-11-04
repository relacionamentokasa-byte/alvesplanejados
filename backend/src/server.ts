import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './modules/auth/routes.js';
import { alvesAuthRouter } from './modules/alvesAuth/routes.js';
import { usersRouter } from './modules/users/routes.js';
import { companiesRouter } from './modules/companies/routes.js';
import { catalogRouter } from './modules/catalog/routes.js';
import { evaluationsRouter } from './modules/evaluations/routes.js';
import { auditRouter } from './modules/audit/routes.js';
import { alvesRouter, publicAlvesRouter } from './modules/alves/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/alves-auth', alvesAuthRouter);
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/evaluations', evaluationsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/alves', alvesRouter);
app.use('/api/public', publicAlvesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Libus Partner API', version: '1.0.0' });
});

app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Alves Planejados Backend rodando na porta ${PORT} (${HOST})`);
});
