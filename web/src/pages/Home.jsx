import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

export function Home() {
  const [products, setProducts] = useState([]);
  
  // Inicializa o carrinho buscando do LocalStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('@App:cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    // Busca os produtos da API no [ESTADO ZERO]
    async function loadProducts() {
      try {
        const response = await api.get('/products'); 
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos da API:", error);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    // Salva o carrinho no LocalStorage sempre que houver alteração
    localStorage.setItem('@App:cart', JSON.stringify(cart));
  }, [cart]);

  function handleAddToCart(product) {
    setCart((prevCart) => {
      const productExists = prevCart.find((item) => item.id === product.id);
      
      if (productExists) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Vitrine da Loja</h1>
        
        {/* Link para a tela de Checkout com feedback visual da quantidade */}
        <Link 
          to="/checkout" 
          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-200 transition"
        >
          <span>🛒 Carrinho:</span>
          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            {totalItems}
          </span>
        </Link>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </main>
      
      {products.length === 0 && (
        <p className="text-center text-gray-500 mt-10">Procurando produtos ou vitrine vazia...</p>
      )}
    </div>
  );
}