const db = require('../config/database');

class ProdutoController {
  
  // Cadastra um novo produto
  async criar(req, res) {
    try {
      const { nome, descricao, preco_base, categoria_id } = req.body;
      
      // A URL da imagem é injetada automaticamente pelo middleware do Cloudinary
      const imagemUrl = req.file ? req.file.path : null;

      if (!nome || !preco_base) {
        return res.status(400).json({ erro: 'Nome e preço base são obrigatórios.' });
      }

      const query = `
        INSERT INTO produtos (nome, descricao, preco_base, imagem_url, categoria_id) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `;
      const valores = [nome, descricao, preco_base, imagemUrl, categoria_id || null];
      
      const resultado = await db.query(query, valores);

      res.status(201).json({ 
        sucesso: true, 
        produto: resultado.rows[0] 
      });
    } catch (erro) {
      console.error("[ERRO_PRODUTO_CRIAR]", erro);
      res.status(500).json({ erro: 'Erro interno ao cadastrar o produto.' });
    }
  }

  // Lista produtos para a vitrine (Apenas ativos e com paginação)
  async listarTodos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Busca os produtos
      const query = `
        SELECT id, nome, descricao, preco_base, imagem_url 
        FROM produtos 
        WHERE ativo = true 
        ORDER BY criado_em DESC 
        LIMIT $1 OFFSET $2
      `;
      const produtos = await db.query(query, [limit, offset]);

      // Conta o total para o frontend saber quantas páginas existem
      const totalQuery = await db.query('SELECT COUNT(*) FROM produtos WHERE ativo = true');
      const totalItens = parseInt(totalQuery.rows[0].count);

      res.status(200).json({
        sucesso: true,
        dados: produtos.rows,
        paginacao: {
          total: totalItens,
          paginaAtual: page,
          totalPaginas: Math.ceil(totalItens / limit)
        }
      });
    } catch (erro) {
      console.error("[ERRO_PRODUTO_LISTAR]", erro);
      res.status(500).json({ erro: 'Erro interno ao buscar produtos.' });
    }
  }

  // Inativa o produto em vez de deletar (Soft Delete) para não quebrar o histórico de vendas
  async inativar(req, res) {
    try {
      const { id } = req.params;

      const query = 'UPDATE produtos SET ativo = false WHERE id = $1 RETURNING id';
      const resultado = await db.query(query, [id]);

      if (resultado.rowCount === 0) {
        return res.status(404).json({ erro: 'Produto não encontrado.' });
      }

      res.status(200).json({ sucesso: true, mensagem: 'Produto inativado com sucesso.' });
    } catch (erro) {
      console.error("[ERRO_PRODUTO_INATIVAR]", erro);
      res.status(500).json({ erro: 'Erro interno ao inativar o produto.' });
    }
  }
}

module.exports = new ProdutoController();