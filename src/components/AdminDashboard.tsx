import { useState, useEffect } from 'react';
import { supabase, Product, ProductionLog, LossLog } from '../lib/supabase';
import { BarChart3, TrendingUp, AlertTriangle, Package, Calendar } from 'lucide-react';

interface ProductionStats {
  product: Product;
  totalProduced: number;
  logs: (ProductionLog & { products?: Product })[];
}

interface LossStats {
  totalLosses: number;
  recentLosses: (LossLog & { products?: Product })[];
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productionStats, setProductionStats] = useState<ProductionStats[]>([]);
  const [lossStats, setLossStats] = useState<LossStats>({ totalLosses: 0, recentLosses: [] });
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    return startDate.toISOString();
  };

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      const startDate = getDateFilter();

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('name');

      const { data: productionData } = await supabase
        .from('production_logs')
        .select('*, products(*)')
        .gte('production_date', startDate)
        .order('production_date', { ascending: false });

      const { data: lossData } = await supabase
        .from('loss_logs')
        .select('*, products(*)')
        .gte('loss_date', startDate)
        .order('loss_date', { ascending: false });

      if (productsData) {
        setProducts(productsData);

        const stats = productsData.map(product => {
          const productLogs = (productionData || []).filter(
            log => log.product_id === product.id
          );
          const totalProduced = productLogs.reduce(
            (sum, log) => sum + (log.quantity || 0),
            0
          );

          return {
            product,
            totalProduced,
            logs: productLogs
          };
        });

        setProductionStats(stats);
      }

      if (lossData) {
        const totalLosses = lossData.reduce((sum, log) => sum + (log.quantity || 0), 0);
        setLossStats({
          totalLosses,
          recentLosses: lossData.slice(0, 10)
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalProduction = () => {
    return productionStats.reduce((sum, stat) => sum + stat.totalProduced, 0);
  };

  const getLowStockProducts = () => {
    return products.filter(p => p.current_stock <= p.minimum_stock);
  };

  const getStockHealthPercentage = () => {
    if (products.length === 0) return 100;
    const healthyProducts = products.filter(p => p.current_stock > p.minimum_stock).length;
    return Math.round((healthyProducts / products.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-white" size={36} />
            <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          </div>
          <p className="text-amber-100">Visão geral de produção e estoque</p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === 'today'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === 'week'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              dateRange === 'month'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Último Mês
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produção Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {getTotalProduction().toFixed(0)}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {getLowStockProducts().length}
                </p>
              </div>
              <AlertTriangle className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saúde do Estoque</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {getStockHealthPercentage()}%
                </p>
              </div>
              <BarChart3 className="text-amber-500" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
            Visão Geral do Estoque
          </h2>
          <div className="space-y-6">
            {products.map(product => {
              const stockPercentage = (product.current_stock / product.target_stock) * 100;
              const isLow = product.current_stock <= product.minimum_stock;
              const isOptimal = product.current_stock >= product.target_stock;

              return (
                <div key={product.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                    {isLow ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                        Crítico
                      </span>
                    ) : isOptimal ? (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        Ideal
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                        Normal
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                    <div>
                      <p className="text-gray-600">Atual</p>
                      <p className={`text-xl font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.current_stock}
                      </p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mínimo</p>
                      <p className="text-xl font-bold text-gray-900">{product.minimum_stock}</p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Meta</p>
                      <p className="text-xl font-bold text-gray-900">{product.target_stock}</p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">% da Meta</p>
                      <p className={`text-xl font-bold ${
                        isLow ? 'text-red-600' : isOptimal ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {stockPercentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isLow
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : isOptimal
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                    <div
                      className="absolute top-0 h-4 w-0.5 bg-gray-400"
                      style={{ left: `${(product.minimum_stock / product.target_stock) * 100}%` }}
                      title="Nível mínimo"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-amber-600" />
              Produção por Produto
            </h2>
            <div className="space-y-4">
              {productionStats
                .sort((a, b) => b.totalProduced - a.totalProduced)
                .map(stat => {
                  const maxProduction = Math.max(...productionStats.map(s => s.totalProduced));
                  const percentage = maxProduction > 0 ? (stat.totalProduced / maxProduction) * 100 : 0;

                  return (
                    <div key={stat.product.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{stat.product.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {stat.totalProduced.toFixed(0)} {stat.product.unit}
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {productionStats.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhuma produção registrada no período</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-600" />
              Alertas de Estoque
            </h2>
            <div className="space-y-3">
              {getLowStockProducts().map(product => (
                <div
                  key={product.id}
                  className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Estoque atual: <span className="font-semibold text-red-700">{product.current_stock}</span> {product.unit}
                      </p>
                      <p className="text-sm text-gray-600">
                        Mínimo: {product.minimum_stock} {product.unit}
                      </p>
                    </div>
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      URGENTE
                    </span>
                  </div>
                </div>
              ))}
              {getLowStockProducts().length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-green-100 text-green-700 rounded-lg p-4 inline-block">
                    <p className="font-medium">Todos os produtos estão com estoque adequado!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={24} className="text-amber-600" />
            Registro de Produção Recente
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data/Hora</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Produto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantidade</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Funcionário</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Observações</th>
                </tr>
              </thead>
              <tbody>
                {productionStats.flatMap(stat => stat.logs).slice(0, 10).map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(log.production_date).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {log.products?.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {log.quantity} {log.products?.unit}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{log.produced_by}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productionStats.flatMap(stat => stat.logs).length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhum registro encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
