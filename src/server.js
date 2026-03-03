require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();

// 1. Configurações de Segurança e JSON
app.use(express.json());
app.use(cors({
  origin: '*', // Em produção, substitua pela URL do seu frontend
  optionsSuccessStatus: 200
}));

// 2. Rate Limit (Evita ataques e cliques duplos)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // limite de requisições por IP
  message: { erro: 'Muitas requisições vindas deste IP. Tente novamente em 1 minuto.' }
});
app.use(limiter);

// 3. Ativação das Rotas
app.use('/api', routes);

// 4. Tratamento Global de Erros (Evita que o servidor caia)
app.use((erro, req, res, next) => {
  console.error("Critical Error:", erro);
  res.status(500).json({ erro: 'Ocorreu um erro interno no servidor.' });
});

// 5. Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 [ESTADO ZERO] Sistema rodando na porta ${PORT}`);
});


process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason);
});