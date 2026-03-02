const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthController {
  
  // Rota para criar o primeiro administrador (Setup Inicial)
  async registrar(req, res) {
    try {
      const { nome, email, senha } = req.body;

      // Verifica se já existe
      const usuarioExiste = await db.query('SELECT id FROM usuarios_admin WHERE email = $1', [email]);
      if (usuarioExiste.rows.length > 0) {
        return res.status(400).json({ erro: 'Email já cadastrado.' });
      }

      // Criptografa a senha antes de salvar no banco
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      const novoUsuario = await db.query(
        'INSERT INTO usuarios_admin (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
        [nome, email, senhaHash]
      );

      res.status(201).json({ sucesso: true, admin: novoUsuario.rows[0] });
    } catch (erro) {
      console.error("[ERRO_AUTH_REGISTRO]", erro);
      res.status(500).json({ erro: 'Erro interno ao registrar administrador.' });
    }
  }

  // Rota de Login (Gera o JWT)
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Busca o usuário e verifica se está ativo
      const usuario = await db.query('SELECT * FROM usuarios_admin WHERE email = $1 AND ativo = true', [email]);
      
      if (usuario.rows.length === 0) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      // Compara a senha enviada com o Hash do banco
      const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      // Gera o Token com validade de 1 dia
      const token = jwt.sign(
        { id: usuario.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.status(200).json({
        sucesso: true,
        token,
        admin: { id: usuario.rows[0].id, nome: usuario.rows[0].nome }
      });
    } catch (erro) {
      console.error("[ERRO_AUTH_LOGIN]", erro);
      res.status(500).json({ erro: 'Erro interno ao realizar login.' });
    }
  }
}

module.exports = new AuthController();