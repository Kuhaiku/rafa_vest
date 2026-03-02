const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Busca o token no cabeçalho
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
  }

  // Remove a palavra 'Bearer ' e deixa só o código
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verifica a assinatura do token usando a chave do .env
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // Salva o ID do admin logado dentro da requisição para uso nos controllers
    req.adminId = decodificado.id;
    next(); // Libera a passagem
  } catch (erro) {
    res.status(403).json({ erro: 'Sessão inválida ou expirada.' });
  }
};