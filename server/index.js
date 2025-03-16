import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
const envPath = join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Importar middlewares
import errorHandler from './middleware/error.js';

// Importar configuração do banco de dados
import sequelize from './config/database.js';

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import scratchCardRoutes from './routes/scratch-card.js';
import luckyNumberRoutes from './routes/lucky-number.js';

// Função principal para iniciar o servidor
async function startServer() {
  // Inicializar app
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middlewares
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));

  // Logging em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Sincronizar modelos com o banco de dados
  try {
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com o banco de dados');
  } catch (err) {
    console.error('Erro ao sincronizar modelos:', err);
  }

  // Rotas da API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando corretamente' });
  });

  // Montar rotas
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/scratch-cards', scratchCardRoutes);
  app.use('/api/lucky-draws', luckyNumberRoutes);

  // Middleware de tratamento de erros
  app.use(errorHandler);

  // Servir arquivos estáticos do frontend em produção
  if (process.env.NODE_ENV === 'production') {
    const distPath = join(__dirname, '../dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      res.sendFile(join(distPath, 'index.html'));
    });
  }

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📝 API disponível em http://localhost:${PORT}/api`);
  });

  // Tratamento de exceções não capturadas
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Erro: ${err.message}`);
    // Fechar servidor e sair do processo
    // server.close(() => process.exit(1));
  });

  return app;
}

// Iniciar o servidor
const app = await startServer();
export default app; 