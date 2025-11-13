import { useState, useEffect } from 'react';
import { supabase, Product, Recipe, Ingredient } from '../lib/supabase';
import { Package, Plus, CheckCircle, AlertCircle } from 'lucide-react';

interface RecipeWithIngredient extends Recipe {
  ingredients?: Ingredient;
}

export default function EmployeePanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithIngredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [insufficientStock, setInsufficientStock] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [productsRes, ingredientsRes, recipesRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('recipes').select('*, ingredients(*)')
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (ingredientsRes.data) setIngredients(ingredientsRes.data);
      if (recipesRes.data) setRecipes(recipesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkIngredientsAvailability = (productId: string, qty: number): boolean => {
    const productRecipes = recipes.filter(r => r.product_id === productId);

    for (const recipe of productRecipes) {
      const requiredQuantity = recipe.quantity * qty;
      const ingredient = ingredients.find(i => i.id === recipe.ingredient_id);

      if (!ingredient || ingredient.current_stock < requiredQuantity) {
        return false;
      }
    }

    return true;
  };

  const consumeIngredients = async (productId: string, qty: number): Promise<boolean> => {
    try {
      const productRecipes = recipes.filter(r => r.product_id === productId);

      for (const recipe of productRecipes) {
        const ingredient = ingredients.find(i => i.id === recipe.ingredient_id);
        if (!ingredient) continue;

        const consumedQuantity = recipe.quantity * qty;
        const newStock = ingredient.current_stock - consumedQuantity;

        const { error } = await supabase
          .from('ingredients')
          .update({ current_stock: newStock })
          .eq('id', ingredient.id);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error consuming ingredients:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !quantity || !employeeName) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const productQuantity = parseFloat(quantity);

    if (!checkIngredientsAvailability(selectedProduct, productQuantity)) {
      setInsufficientStock(true);
      setTimeout(() => setInsufficientStock(false), 5000);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const { error: logError } = await supabase
        .from('production_logs')
        .insert({
          product_id: selectedProduct,
          quantity: productQuantity,
          produced_by: employeeName,
          production_date: new Date().toISOString(),
          notes: notes
        });

      if (logError) throw logError;

      const ingredientsConsumed = await consumeIngredients(selectedProduct, productQuantity);
      if (!ingredientsConsumed) throw new Error('Failed to consume ingredients');

      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ current_stock: product.current_stock + productQuantity })
          .eq('id', selectedProduct);

        if (updateError) throw updateError;
      }

      setSuccess(true);
      setSelectedProduct('');
      setQuantity('');
      setNotes('');

      await loadAllData();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error registering production:', error);
      alert('Erro ao registrar produção. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <Package className="text-white" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-white">Painel de Produção</h1>
                <p className="text-amber-100">Registre a produção do dia</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="text-green-600" size={24} />
                <p className="text-green-800 font-medium">Produção registrada com sucesso e matérias-primas descontadas!</p>
              </div>
            )}

            {insufficientStock && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="text-red-600" size={24} />
                <p className="text-red-800 font-medium">Estoque insuficiente de matérias-primas para esta produção!</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Funcionário *
                </label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Produto *
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Estoque atual: {product.current_stock} {product.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantidade Produzida *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="Digite a quantidade"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                  rows={3}
                  placeholder="Adicione observações sobre a produção (opcional)"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Registrando...'
                ) : (
                  <>
                    <Plus size={20} />
                    Registrar Produção
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Status dos Produtos</h2>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {products.map((product) => {
                const stockPercentage = (product.current_stock / product.target_stock) * 100;
                const isLow = product.current_stock <= product.minimum_stock;

                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                      {isLow && (
                        <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                          Baixo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Atual: <span className="font-semibold text-gray-800">{product.current_stock}</span>
                      </span>
                      <span className="text-gray-600">
                        Meta: <span className="font-semibold text-gray-800">{product.target_stock}</span>
                      </span>
                      <span className="text-gray-600">{product.unit}</span>
                    </div>
                    <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isLow ? 'bg-red-500' : stockPercentage >= 100 ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ingredientes Necessários</h2>
            {selectedProduct ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recipes
                  .filter(r => r.product_id === selectedProduct)
                  .map((recipe) => {
                    const ingredient = ingredients.find(i => i.id === recipe.ingredient_id);
                    if (!ingredient) return null;

                    const requiredQty = parseFloat(quantity || '0') * recipe.quantity;
                    const hasEnough = ingredient.current_stock >= requiredQty;

                    return (
                      <div
                        key={recipe.id}
                        className={`border rounded-lg p-3 ${
                          hasEnough ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800">{ingredient.name}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            hasEnough ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                          }`}>
                            {hasEnough ? '✓ OK' : '✗ Insuficiente'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Necessário:</span> {requiredQty.toFixed(2)} {ingredient.unit}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Disponível:</span> {ingredient.current_stock.toFixed(2)} {ingredient.unit}
                        </div>
                      </div>
                    );
                  })}
                {recipes.filter(r => r.product_id === selectedProduct).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhuma receita configurada para este produto</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Selecione um produto para ver os ingredientes necessários</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
