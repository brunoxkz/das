import express from 'express';
import { analyzeFunnelUrl, importFunnel, getImportedFunnels } from './routes/funnel-api';
import { requireAuth } from './auth-hybrid';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Analisar URL do funil
router.post('/analyze', analyzeFunnelUrl);

// Importar funil para o sistema
router.post('/import', importFunnel);

// Listar funis importados
router.get('/imported', getImportedFunnels);

export default router;