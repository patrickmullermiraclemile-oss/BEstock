import { useState, useEffect } from 'react';
import EmployeePanel from './components/EmployeePanel';
import AdminDashboard from './components/AdminDashboard';
import IngredientsPanel from './components/IngredientsPanel';
import SetupPanel from './components/SetupPanel';
import { User, Shield, Boxes, Settings } from 'lucide-react';

function App() {
  const [view, setView] = useState<'home' | 'employee' | 'admin' | 'ingredients' | 'setup'>('home');
  const [showSetupHint, setShowSetupHint] = useState(false);

  useEffect(() => {
    const hasSeenSetup = localStorage.getItem('setup_completed');
    if (!hasSeenSetup) {
      setShowSetupHint(true);
    }
  }, []);

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

  if (view === 'ingredients') {
    return (
      <div>
        <button
          onClick={() => setView('home')}
          className="fixed top-4 left-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition font-medium z-10"
        >
          ← Voltar
        </button>
        <IngredientsPanel />
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div>
        <button
          onClick={() => {
            setView('home');
            localStorage.setItem('setup_completed', 'true');
            setShowSetupHint(false);
          }}
          className="fixed top-4 left-4 bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition font-medium z-10"
        >
          ← Voltar
        </button>
        <SetupPanel />
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

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => setView('employee')}
              className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-6 mb-6 group-hover:scale-110 transition-transform">
                  <User className="text-white" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Painel de Produção
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Registre a produção e o abatimento automático de matérias-primas
                </p>
              </div>
            </button>

            <button
              onClick={() => setView('ingredients')}
              className="group bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-full p-6 mb-6 group-hover:scale-110 transition-transform">
                  <Boxes className="text-white" size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Matérias-Primas
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Gerencie estoque e visualize alertas de ingredientes
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
                  Administrativo
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Visualize gráficos, análises de produção e alertas
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

        {showSetupHint && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-xs">
            <p className="text-sm font-medium mb-3">Primeira vez? Inicialize o sistema para carregar os dados padrão.</p>
            <button
              onClick={() => setView('setup')}
              className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <Settings size={18} />
              Inicializar Sistema
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
