import { useState, useEffect } from 'react';
import { supabase, Ingredient } from '../lib/supabase';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';

export default function IngredientsPanel() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');

  useEffect(() => {
    loadIngredients();
    const interval = setInterval(loadIngredients, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredIngredients = () => {
    return ingredients.filter(ing => {
      if (filter === 'critical') {
        return ing.current_stock < ing.minimum_stock;
      } else if (filter === 'low') {
        return ing.current_stock <= ing.minimum_stock * 1.5;
      }
      return true;
    });
  };

  const getCriticalCount = () => {
    return ingredients.filter(ing => ing.current_stock < ing.minimum_stock).length;
  };

  const getLowCount = () => {
    return ingredients.filter(ing => ing.current_stock <= ing.minimum_stock * 1.5).length;
  };

  const getTotalValue = () => {
    return ingredients.reduce((sum, ing) => sum + (ing.current_stock * ing.cost_per_unit), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando matérias-primas...</p>
        </div>
      </div>
    );
  }

  const filtered = getFilteredIngredients();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-white" size={36} />
            <h1 className="text-3xl font-bold text-white">Gestão de Matérias-Primas</h1>
          </div>
          <p className="text-blue-100">Controle de estoque de ingredientes em tempo real</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{ingredients.length}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{getLowCount()}</p>
              </div>
              <TrendingDown className="text-amber-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crítico</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{getCriticalCount()}</p>
              </div>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  R$ {getTotalValue().toFixed(2)}
                </p>
              </div>
              <Package className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({ingredients.length})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'low'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Baixo ({getLowCount()})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Crítico ({getCriticalCount()})
            </button>
          </div>

          <div className="grid gap-4">
            {filtered.length > 0 ? (
              filtered.map(ingredient => {
                const isCritical = ingredient.current_stock < ingredient.minimum_stock;
                const isLow = ingredient.current_stock <= ingredient.minimum_stock * 1.5;
                const stockPercentage = (ingredient.current_stock / ingredient.minimum_stock) * 100;

                return (
                  <div key={ingredient.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{ingredient.name}</h3>
                        <p className="text-sm text-gray-600">Unidade: {ingredient.unit}</p>
                      </div>
                      {isCritical ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle size={14} /> Crítico
                        </span>
                      ) : isLow ? (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                          Baixo
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                          Normal
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">Atual</p>
                        <p className={`text-xl font-bold ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
                          {ingredient.current_stock}
                        </p>
                        <p className="text-xs text-gray-500">{ingredient.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mínimo</p>
                        <p className="text-xl font-bold text-gray-900">{ingredient.minimum_stock}</p>
                        <p className="text-xs text-gray-500">{ingredient.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Custo Unit.</p>
                        <p className="text-xl font-bold text-gray-900">R$ {ingredient.cost_per_unit.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {(ingredient.current_stock * ingredient.cost_per_unit).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">% Mín</p>
                        <p className={`text-xl font-bold ${isCritical ? 'text-red-600' : 'text-gray-900'}`}>
                          {stockPercentage.toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isCritical
                              ? 'bg-red-500'
                              : isLow
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhuma matéria-prima encontrada com esse filtro</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
