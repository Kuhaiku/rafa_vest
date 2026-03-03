import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });

  useEffect(() => {
    // Carrega o carrinho do LocalStorage
    const savedCart = localStorage.getItem('@App:cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  function handleFinalizeOrder(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    // Monta a mensagem para o WhatsApp
    let message = `*Novo Pedido - Loja*\n\n`;
    message += `*Cliente:* ${customer.name}\n`;
    message += `*Telefone:* ${customer.phone}\n\n`;
    message += `*Itens do Pedido:*\n`;
    
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (R$ ${Number(item.price).toFixed(2)})\n`;
    });

    message += `\n*Total a pagar:* R$ ${total.toFixed(2)}`;

    // SUBSTITUA PELO NÚMERO DA LOJA (com código do país e DDD, ex: 5511999999999)
    const storePhone = "5511999999999"; 
    const whatsappUrl = `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;

    // Limpa o carrinho e redireciona
    localStorage.removeItem('@App:cart');
    window.open(whatsappUrl, '_blank');
    navigate('/');
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Finalizar Pedido</h1>
        <Link to="/" className="text-blue-600 hover:underline font-semibold">
          &larr; Voltar para Vitrine
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resumo do Carrinho */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Seu Carrinho</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500">Nenhum item adicionado.</p>
          ) : (
            <ul className="space-y-3 mb-6">
              {cart.map(item => (
                <li key={item.id} className="flex justify-between text-gray-700">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t pt-4 flex justify-between items-center text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Formulário do Cliente */}
        <div>
          <form onSubmit={handleFinalizeOrder} className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Seu Nome</label>
              <input 
                type="text" 
                required
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Ex: João Silva"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Seu WhatsApp</label>
              <input 
                type="text" 
                required
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="(00) 00000-0000"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
            
            <button 
              type="submit"
              disabled={cart.length === 0}
              className="mt-4 bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
            >
              Enviar Pedido por WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}