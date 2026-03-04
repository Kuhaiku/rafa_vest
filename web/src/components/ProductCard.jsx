import { useState } from 'react';

export function ProductCard({ product, onAddToCart }) {
  const [quantidade, setQuantidade] = useState(1);
  const [tamanho, setTamanho] = useState('M'); // Fixo para demonstração
  const [cor, setCor] = useState('Padrão'); // Fixo para demonstração

  function handleAdd() {
    onAddToCart({ ...product, quantidade_selecionada: quantidade, tamanho, cor });
    alert('Adicionado à lista!');
  }

  return (
    <article className="flex flex-col gap-4 group bg-white dark:bg-surface-dark p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm">
        <img 
          src={product.imagem_url || "https://via.placeholder.com/300x400?text=Sem+Foto"} 
          alt={product.nome} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <button className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-text-primary leading-tight line-clamp-1">{product.nome}</h3>
            <p className="text-text-secondary text-sm mt-1 line-clamp-1">{product.descricao}</p>
          </div>
          <p className="text-lg font-extrabold text-primary shrink-0 ml-2">R$ {Number(product.preco_base || product.preco || 0).toFixed(2)}</p>
        </div>

        {/* Seletores (Visual inspirado no Stitch) */}
        <div className="flex flex-col gap-3 py-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tamanho</span>
            <div className="flex gap-2">
              {['P', 'M', 'G', 'GG'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTamanho(t)}
                  className={`h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${tamanho === t ? 'bg-primary text-white shadow-md' : 'border border-gray-200 text-text-primary hover:border-primary'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Quantidade</span>
            <div className="flex items-center rounded-lg border border-gray-200 bg-surface-light">
              <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="w-8 text-center text-sm font-bold text-text-primary">{quantidade}</span>
              <button onClick={() => setQuantidade(quantidade + 1)} className="flex h-8 w-8 items-center justify-center text-text-secondary hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-all hover:bg-primary-dark"
        >
          <span className="material-symbols-outlined text-[20px]">favorite</span>
          Adicionar à Lista
        </button>
      </div>
    </article>
  );
}