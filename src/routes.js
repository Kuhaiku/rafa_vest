const express = require('express');
const router = express.Router();

// Middlewares
const verificarToken = require('./middlewares/authMiddleware');
const uploadCloudinary = require('./middlewares/uploadMiddleware');

// Controllers
const AuthController = require('./controllers/AuthController');
const ProdutoController = require('./controllers/ProdutoController');
const PedidoController = require('./controllers/PedidoController');

// ==========================================
// ROTAS DE AUTENTICAÇÃO (Públicas)
// ==========================================
router.post('/admin/registrar', AuthController.registrar); 
router.post('/admin/login', AuthController.login);

// ==========================================
// ROTAS DE PRODUTOS (Vitrine)
// ==========================================
// Público: Cliente visualizando a vitrine
router.get('/produtos', ProdutoController.listarTodos);

// Privado: Admin gerencia produtos
router.post(
  '/produtos', 
  verificarToken, 
  uploadCloudinary.single('imagem'), 
  ProdutoController.criar
);
router.patch('/produtos/:id/inativar', verificarToken, ProdutoController.inativar);

// ==========================================
// ROTAS DE PEDIDOS E CAIXA
// ==========================================
// Público: Cliente finalizando o carrinho (Gera ID e reserva estoque)
router.post('/pedidos', PedidoController.criar);

// Privado: Admin aprova/rejeita (Alimenta financeiro ou devolve estoque)
router.patch('/pedidos/:id/status', verificarToken, PedidoController.atualizarStatus);

module.exports = router;