import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { Package, Plus, CheckCircle } from 'lucide-react';

export default function EmployeePanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !quantity || !employeeName) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const productQuantity = parseFloat(quantity);

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

      await loadProducts();

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
                <p className="text-green-800 font-medium">Produção registrada com sucesso!</p>
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

        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Status do Estoque</h2>
          <div className="grid gap-4">
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
                        Estoque Baixo
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
      </div>
    </div>
  );
}
