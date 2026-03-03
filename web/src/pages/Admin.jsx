import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('orders'); // Alternar entre 'pedidos' e 'produtos'
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('@App:token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate, view]);

async function loadData() {
  try {
    if (view === 'orders') {
      // Tenta buscar pedidos, se der 404, define como lista vazia
      const response = await api.get('/api/pedidos').catch(() => ({ data: [] }));
      // Garante que orders seja sempre um array
      setOrders(Array.isArray(response.data) ? response.data : []);
    } else {
      const response = await api.get('/api/produtos');
      // Garante que products seja sempre um array
      setProducts(Array.isArray(response.data) ? response.data : []);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do painel:", error);
    setOrders([]);
    setProducts([]);
  }
}

// ... no local onde você faz o .map dos produtos (por volta da linha 142) ...
// Adicione a verificação antes de mapear:

<tbody>
  {Array.isArray(products) && products.map(product => (
    <tr key={product.id} className="border-b hover:bg-gray-50">
       {/* ... conteúdo da linha ... */}
    </tr>
  ))}
</tbody>
  async function handleUpdateStatus(orderId, newStatus) {
    try {
      // Rota PATCH /api/pedidos/:id/status
      await api.patch(`/api/pedidos/${orderId}/status`, { status: newStatus });
      alert("Status atualizado!");
      loadData();
    } catch (error) {
      alert("Erro ao atualizar status.");
    }
  }

  function handleLogout() {
    localStorage.removeItem('@App:token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex gap-8 items-center">
            <h1 className="text-2xl font-bold text-gray-800">Painel Rafa Vest</h1>
            <div className="flex gap-4">
              <button 
                onClick={() => setView('orders')}
                className={`pb-1 border-b-2 transition ${view === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
              >
                Pedidos
              </button>
              <button 
                onClick={() => setView('products')}
                className={`pb-1 border-b-2 transition ${view === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
              >
                Produtos
              </button>
            </div>
          </div>
          <button onClick={handleLogout} className="text-red-600 font-semibold hover:text-red-800">Sair</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">
            {view === 'orders' ? 'Gestão de Pedidos' : 'Gestão de Inventário'}
          </h2>
          {view === 'products' && (
            <Link to="/admin/produtos/novo" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
              + Novo Produto
            </Link>
          )}
        </div>

        <div className="bg-white shadow rounded-lg border overflow-hidden">
          {view === 'orders' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-600">#{order.id}</td>
                    <td className="p-4 font-medium">{order.customer_name}</td>
                    <td className="p-4 text-gray-700">R$ {Number(order.total).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'Aprovado')}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Aprovar
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'Cancelado')}
                        className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4">Foto</th>
                  <th className="p-4">Nome</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <img src={product.imagem_url} alt="" className="w-10 h-10 rounded object-cover shadow-sm" />
                    </td>
                    <td className="p-4 font-medium text-gray-800">{product.nome}</td>
                    <td className="p-4">R$ {Number(product.preco).toFixed(2)}</td>
                    <td className="p-4 text-gray-600">{product.estoque} un.</td>
                    <td className="p-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                        {product.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}