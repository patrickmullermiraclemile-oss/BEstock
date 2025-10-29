import { useState } from 'react';
import EmployeePanel from './components/EmployeePanel';
import AdminDashboard from './components/AdminDashboard';
import { User, Shield } from 'lucide-react';

function App() {
  const [view, setView] = useState<'home' | 'employee' | 'admin'>('home');

  if (view === 'employee') {
    return (
      <div>
        <button
          onClick={() => setView('home')}
          className="fixed top-4 left-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition font-medium z-10"
        >
          ← Voltar
        </button>
        <EmployeePanel />
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div>
        <button
          onClick={() => setView('home')}
          className="fixed top-4 left-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition font-medium z-10"
        >
          ← Voltar
        </button>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <img
              src="/brownie-na-estrada.png"
              alt="Brownie na Estrada"
              className="w-48 h-48 mx-auto mb-8 rounded-full shadow-2xl border-4 border-white/20"
            />
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Brownie na Estrada
            </h1>
            <p className="text-xl text-amber-100 font-medium">
              Sistema de Controle de Estoque e Produção
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <button
              onClick={() => setView('employee')}
              className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-6 mb-6 group-hover:scale-110 transition-transform">
                  <User className="text-white" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Painel do Funcionário
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Registre a produção diária e acompanhe o status do estoque em tempo real
                </p>
              </div>
            </button>

            <button
              onClick={() => setView('admin')}
              className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-full p-6 mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="text-white" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Painel Administrativo
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Visualize gráficos, análises de produção e alertas de estoque
                </p>
              </div>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-amber-100 text-sm">
              Gestão inteligente para sua produção de brownies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
