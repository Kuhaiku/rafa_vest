import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { ProductForm } from './pages/ProductForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Lado do Cliente */}
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Lado do Administrador */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/produtos/novo" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;