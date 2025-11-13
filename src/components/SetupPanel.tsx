import { useState } from 'react';
import { seedIngredients, seedRecipes } from '../lib/seedData';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function SetupPanel() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ type: 'success' | 'error', text: string }[]>([]);

  const handleSeedData = async () => {
    setLoading(true);
    setMessages([]);

    try {
      const ingredientsOk = await seedIngredients();
      if (ingredientsOk) {
        setMessages(prev => [...prev, { type: 'success', text: 'Ingredientes carregados com sucesso!' }]);
      } else {
        setMessages(prev => [...prev, { type: 'error', text: 'Erro ao carregar ingredientes' }]);
      }

      const recipesOk = await seedRecipes();
      if (recipesOk) {
        setMessages(prev => [...prev, { type: 'success', text: 'Receitas carregadas com sucesso!' }]);
      } else {
        setMessages(prev => [...prev, { type: 'error', text: 'Erro ao carregar receitas' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'error', text: `Erro: ${error}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicializar Sistema</h1>
        <p className="text-gray-600 mb-6">Carregue os ingredientes e receitas padrão do sistema</p>

        <button
          onClick={handleSeedData}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Carregando...
            </>
          ) : (
            'Inicializar Dados'
          )}
        </button>

        <div className="space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg flex items-center gap-3 ${
                msg.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <p className={msg.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {msg.text}
              </p>
            </div>
          ))}
        </div>

        {messages.length > 0 && messages.every(m => m.type === 'success') && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              ✓ Sistema inicializado! Você pode agora fechar este painel e usar o sistema normalmente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
