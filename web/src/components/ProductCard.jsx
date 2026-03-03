export function ProductCard({ product, onAddToCart }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col justify-between h-full">
      {/* Ajuste 'product.imageUrl' para o nome exato do campo que vem da sua API */}
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4 bg-gray-100" />
      
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        <p className="text-blue-600 font-bold text-xl mt-3">R$ {Number(product.price).toFixed(2)}</p>
      </div>
      
      <button 
        onClick={() => onAddToCart(product)}
        className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition active:scale-95"
      >
        Adicionar ao Carrinho
      </button>
    </div>
  );
}