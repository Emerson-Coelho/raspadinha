import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuração para obter o diretório atual em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializa o app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando corretamente' });
});

// Rotas simuladas para a aplicação
import authRoutes from './routes/auth.js';
import scratchCardRoutes from './routes/scratch-card.js';
import luckyNumberRoutes from './routes/lucky-number.js';

app.use('/api/auth', authRoutes);
app.use('/api/scratch-cards', scratchCardRoutes);
app.use('/api/lucky-draws', luckyNumberRoutes);

// Servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 API disponível em http://localhost:${PORT}/api`);
}); 