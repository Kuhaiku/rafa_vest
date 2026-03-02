const db = require('../config/database');
const { z } = require('zod');

// Schema de validação blindado com Zod
const schemaPedido = z.object({
  nome_cliente: z.string().min(2, "Nome muito curto"),
  telefone_cliente: z.string().min(10, "Telefone inválido"),
  itens: z.array(z.object({
    variacao_id: z.number().positive(),
    quantidade: z.number().int().positive()
  })).min(1, "O carrinho não pode estar vazio")
});

class PedidoController {
  
  // Cria o pedido, valida estoque real e calcula o preço pelo Back-end
  async criar(req, res) {
    const client = await db.getClient(); // Pega uma conexão exclusiva para a Transação

    try {
      // 1. Validação de segurança dos dados recebidos
      const dadosValidados = schemaPedido.parse(req.body);
      const { nome_cliente, telefone_cliente, itens } = dadosValidados;
      
      // Limpa o telefone para salvar apenas números
      const telefoneLimpo = telefone_cliente.replace(/\D/g, '');

      await client.query('BEGIN'); // INICIA A TRANSAÇÃO ACID

      let totalOrcamento = 0;
      const itensConfirmados = [];

      // 2. Loop de verificação de estoque e cálculo de preço
      for (const item of itens) {
        // Tenta abater o estoque DENTRO do banco de dados (evita Race Condition)
        // O JOIN traz o preço base do produto + o preço adicional da variação
        const queryEstoque = `
          UPDATE variacoes v
          SET estoque_atual = estoque_atual - $1
          FROM produtos p
          WHERE v.id = $2 AND v.produto_id = p.id AND v.estoque_atual >= $1 AND v.ativo = true
          RETURNING v.id, p.preco_base, v.preco_adicional;
        `;
        const resEstoque = await client.query(queryEstoque, [item.quantidade, item.variacao_id]);

        if (resEstoque.rowCount === 0) {
          // Se não afetou nenhuma linha, significa que o estoque acabou ou a variação não existe
          throw new Error(`Estoque insuficiente para a variação ID ${item.variacao_id}`);
        }

        // Calcula o preço real deste item
        const { preco_base, preco_adicional } = resEstoque.rows[0];
        const precoUnitario = parseFloat(preco_base) + parseFloat(preco_adicional);
        
        totalOrcamento += precoUnitario * item.quantidade;
        
        itensConfirmados.push({
          variacao_id: item.variacao_id,
          quantidade: item.quantidade,
          preco_unitario: precoUnitario
        });
      }

      // 3. Salva o cabeçalho do pedido
      const queryPedido = `
        INSERT INTO pedidos (nome_cliente, telefone_cliente, total_orcamento, status)
        VALUES ($1, $2, $3, 'Pendente') RETURNING id
      `;
      const resPedido = await client.query(queryPedido, [nome_cliente, telefoneLimpo, totalOrcamento]);
      const pedidoId = resPedido.rows[0].id;

      // 4. Salva os itens do pedido
      for (const item of itensConfirmados) {
        await client.query(
          'INSERT INTO itens_pedido (pedido_id, variacao_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [pedidoId, item.variacao_id, item.quantidade, item.preco_unitario]
        );
      }

      await client.query('COMMIT'); // CONFIRMA A TRANSAÇÃO. Tudo salvo com sucesso!

      res.status(201).json({
        sucesso: true,
        pedidoId: pedidoId,
        numero_whatsapp: process.env.NUMERO_WHATSAPP_ADMIN || ''
      });

    } catch (erro) {
      await client.query('ROLLBACK'); // DESFAZ TUDO SE DER ERRO
      
      // Se for erro do Zod (Validação)
      if (erro instanceof z.ZodError) {
        return res.status(400).json({ erro: 'Dados inválidos', detalhes: erro.errors });
      }
      
      // Se for erro de estoque (lançado por nós)
      if (erro.message.includes('Estoque insuficiente')) {
         return res.status(409).json({ erro: erro.message });
      }

      console.error("[ERRO_PEDIDO_CRIAR]", erro);
      res.status(500).json({ erro: 'Erro interno ao processar o pedido.' });
    } finally {
      client.release(); // Devolve a conexão para o Pool
    }
  }

  // Admin atualiza o status (Aprova, Rejeita) e gera movimentação no Caixa
  async atualizarStatus(req, res) {
    const client = await db.getClient();
    
    try {
      const { id } = req.params;
      const { novo_status } = req.body; // 'Aprovado' ou 'Rejeitado'

      if (!['Aprovado', 'Rejeitado'].includes(novo_status)) {
        return res.status(400).json({ erro: 'Status inválido.' });
      }

      await client.query('BEGIN');

      // Busca o pedido atual
      const resPedido = await client.query('SELECT status, total_orcamento FROM pedidos WHERE id = $1 FOR UPDATE', [id]);
      
      if (resPedido.rowCount === 0) {
        throw new Error('Pedido não encontrado.');
      }

      const pedido = resPedido.rows[0];

      // Evita processar um pedido que já foi finalizado
      if (pedido.status !== 'Pendente') {
        throw new Error(`Pedido já está ${pedido.status}.`);
      }

      // Atualiza o status
      await client.query('UPDATE pedidos SET status = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2', [novo_status, id]);

      // Lógica de Negócio:
      if (novo_status === 'Aprovado') {
        // Alimenta o fluxo de caixa
        await client.query(
          'INSERT INTO fluxo_caixa (pedido_id, valor, tipo) VALUES ($1, $2, $3)',
          [id, pedido.total_orcamento, 'Entrada']
        );
      } else if (novo_status === 'Rejeitado') {
        // Devolve o estoque, pois a venda foi cancelada
        const resItens = await client.query('SELECT variacao_id, quantidade FROM itens_pedido WHERE pedido_id = $1', [id]);
        
        for (const item of resItens.rows) {
          await client.query(
            'UPDATE variacoes SET estoque_atual = estoque_atual + $1 WHERE id = $2',
            [item.quantidade, item.variacao_id]
          );
        }
      }

      await client.query('COMMIT');
      res.status(200).json({ sucesso: true, mensagem: `Pedido marcado como ${novo_status}.` });

    } catch (erro) {
      await client.query('ROLLBACK');
      
      if (erro.message === 'Pedido não encontrado.' || erro.message.includes('já está')) {
         return res.status(400).json({ erro: erro.message });
      }

      console.error("[ERRO_PEDIDO_STATUS]", erro);
      res.status(500).json({ erro: 'Erro interno ao atualizar o pedido.' });
    } finally {
      client.release();
    }
  }
}

module.exports = new PedidoController();