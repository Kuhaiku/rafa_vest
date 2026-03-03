import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); // Ajustado para "senha"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Agora enviamos { email, senha } exatamente como o backend espera
      const response = await api.post('/api/admin/login', { email, senha });
      
      localStorage.setItem('@App:token', response.data.token);
      navigate('/admin');
    } catch (error) {
      console.error(error);
      alert('Erro ao acessar. Verifique suas credenciais no [ESTADO ZERO].');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acesso Restrito</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">E-mail</label>
          <input 
            type="email" 
            required
            className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Senha</label>
          <input 
            type="password" 
            required
            className="w-full border rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-600"
            value={senha}
            onChange={(e) => setSenha(e.target.value)} // Atualiza o estado da senha
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? 'Acessando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}