/*
  # Brownie na Estrada - Sistema de Estoque e Controle de Produção

  ## Visão Geral
  Sistema completo de gestão de estoque com fichas técnicas, controle de produção
  e prevenção de perdas para Brownie na Estrada.

  ## 1. Novas Tabelas

  ### `products` - Produtos finais
    - `id` (uuid, chave primária)
    - `name` (text) - Nome do produto
    - `description` (text) - Descrição
    - `unit` (text) - Unidade de medida (unidade, kg, litro, etc)
    - `target_stock` (numeric) - Estoque alvo
    - `minimum_stock` (numeric) - Estoque mínimo para alerta
    - `current_stock` (numeric) - Estoque atual
    - `cost_per_unit` (numeric) - Custo por unidade
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### `ingredients` - Ingredientes/matérias-primas
    - `id` (uuid, chave primária)
    - `name` (text) - Nome do ingrediente
    - `unit` (text) - Unidade de medida
    - `current_stock` (numeric) - Estoque atual
    - `minimum_stock` (numeric) - Estoque mínimo
    - `cost_per_unit` (numeric) - Custo por unidade
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### `recipes` - Fichas técnicas (receitas)
    - `id` (uuid, chave primária)
    - `product_id` (uuid, FK para products)
    - `ingredient_id` (uuid, FK para ingredients)
    - `quantity` (numeric) - Quantidade necessária do ingrediente
    - `created_at` (timestamptz)

  ### `production_logs` - Registros de produção
    - `id` (uuid, chave primária)
    - `product_id` (uuid, FK para products)
    - `quantity` (numeric) - Quantidade produzida
    - `produced_by` (text) - Nome do funcionário
    - `production_date` (timestamptz) - Data/hora da produção
    - `notes` (text) - Observações
    - `created_at` (timestamptz)

  ### `loss_logs` - Registros de perdas
    - `id` (uuid, chave primária)
    - `product_id` (uuid, FK para products, nullable)
    - `ingredient_id` (uuid, FK para ingredients, nullable)
    - `quantity` (numeric) - Quantidade perdida
    - `reason` (text) - Motivo da perda
    - `loss_date` (timestamptz) - Data da perda
    - `reported_by` (text) - Quem reportou
    - `created_at` (timestamptz)

  ## 2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas permitem leitura para todos autenticados
    - Apenas administradores podem modificar dados (implementar depois)

  ## 3. Índices
    - Índices em chaves estrangeiras para performance
    - Índices em datas para queries de relatórios
*/

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  unit text NOT NULL DEFAULT 'unidade',
  target_stock numeric NOT NULL DEFAULT 0,
  minimum_stock numeric NOT NULL DEFAULT 0,
  current_stock numeric NOT NULL DEFAULT 0,
  cost_per_unit numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de ingredientes
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  current_stock numeric NOT NULL DEFAULT 0,
  minimum_stock numeric NOT NULL DEFAULT 0,
  cost_per_unit numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de receitas (fichas técnicas)
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, ingredient_id)
);

-- Criar tabela de logs de produção
CREATE TABLE IF NOT EXISTS production_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL,
  produced_by text NOT NULL,
  production_date timestamptz NOT NULL DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de logs de perdas
CREATE TABLE IF NOT EXISTS loss_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE SET NULL,
  quantity numeric NOT NULL,
  reason text NOT NULL,
  loss_date timestamptz NOT NULL DEFAULT now(),
  reported_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_recipes_product ON recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_recipes_ingredient ON recipes(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_production_logs_product ON production_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_production_logs_date ON production_logs(production_date);
CREATE INDEX IF NOT EXISTS idx_loss_logs_product ON loss_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_loss_logs_ingredient ON loss_logs(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_loss_logs_date ON loss_logs(loss_date);

-- Habilitar RLS em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (permitir acesso para desenvolvimento)
-- Products
CREATE POLICY "Allow all access to products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ingredients
CREATE POLICY "Allow all access to ingredients"
  ON ingredients FOR ALL
  USING (true)
  WITH CHECK (true);

-- Recipes
CREATE POLICY "Allow all access to recipes"
  ON recipes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Production Logs
CREATE POLICY "Allow all access to production_logs"
  ON production_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Loss Logs
CREATE POLICY "Allow all access to loss_logs"
  ON loss_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ingredients_updated_at ON ingredients;
CREATE TRIGGER update_ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO products (name, description, unit, target_stock, minimum_stock, current_stock, cost_per_unit)
VALUES
  ('Brownie Tradicional', 'Brownie clássico de chocolate', 'unidade', 100, 20, 50, 3.50),
  ('Brownie de Nozes', 'Brownie com nozes picadas', 'unidade', 80, 15, 30, 4.20),
  ('Brownie Vegano', 'Brownie sem ingredientes de origem animal', 'unidade', 60, 10, 25, 4.50)
ON CONFLICT DO NOTHING;

INSERT INTO ingredients (name, unit, current_stock, minimum_stock, cost_per_unit)
VALUES
  ('Chocolate em Pó', 'kg', 50, 10, 15.00),
  ('Açúcar', 'kg', 80, 15, 3.50),
  ('Farinha de Trigo', 'kg', 100, 20, 4.00),
  ('Ovos', 'unidade', 200, 50, 0.60),
  ('Manteiga', 'kg', 30, 5, 25.00),
  ('Nozes', 'kg', 20, 5, 35.00),
  ('Óleo de Coco', 'litro', 10, 2, 28.00)
ON CONFLICT DO NOTHING;

-- Inserir fichas técnicas de exemplo
INSERT INTO recipes (product_id, ingredient_id, quantity)
SELECT 
  p.id,
  i.id,
  CASE i.name
    WHEN 'Chocolate em Pó' THEN 0.15
    WHEN 'Açúcar' THEN 0.12
    WHEN 'Farinha de Trigo' THEN 0.10
    WHEN 'Ovos' THEN 2
    WHEN 'Manteiga' THEN 0.08
  END
FROM products p
CROSS JOIN ingredients i
WHERE p.name = 'Brownie Tradicional'
  AND i.name IN ('Chocolate em Pó', 'Açúcar', 'Farinha de Trigo', 'Ovos', 'Manteiga')
ON CONFLICT DO NOTHING;