import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function ProductForm() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagem, setImagem] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCreateProduct(e) {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('nome', nome);
    data.append('preco', preco);
    data.append('descricao', descricao);
    data.append('estoque', estoque);
    data.append('imagem', imagem); // O arquivo da foto

    try {
      // Rota definida no seu routes.js
      await api.post('/api/produtos', data);
      alert('Produto cadastrado com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar produto. Verifique se o Cloudinary está configurado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Novo Produto</h1>
        <Link to="/admin" className="text-blue-600 hover:underline font-semibold">Cancelar</Link>
      </header>

      <form onSubmit={handleCreateProduct} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Nome do Produto</label>
          <input type="text" required className="w-full border rounded-md p-2" 
            value={nome} onChange={e => setNome(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Preço (R$)</label>
            <input type="number" step="0.01" required className="w-full border rounded-md p-2" 
              value={preco} onChange={e => setPreco(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Estoque Inicial</label>
            <input type="number" required className="w-full border rounded-md p-2" 
              value={estoque} onChange={e => setEstoque(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Descrição</label>
          <textarea className="w-full border rounded-md p-2" rows="3"
            value={descricao} onChange={e => setDescricao(e.target.value)} />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Foto do Produto</label>
          <input type="file" accept="image/*" required className="w-full"
            onChange={e => setImagem(e.target.files[0])} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400">
          {loading ? 'Enviando para o Cloudinary...' : 'Cadastrar Produto'}
        </button>
      </form>
    </div>
  );
}