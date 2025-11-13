import { supabase } from './supabase';

export const seedIngredients = async () => {
  const ingredients = [
    { name: 'Açúcar refinado', unit: 'kg', current_stock: 15, minimum_stock: 2, cost_per_unit: 3.50 },
    { name: 'Açúcar Mascavo', unit: 'kg', current_stock: 10, minimum_stock: 1, cost_per_unit: 5.00 },
    { name: 'Nescau', unit: 'kg', current_stock: 5, minimum_stock: 1, cost_per_unit: 18.00 },
    { name: 'Farinha de trigo', unit: 'kg', current_stock: 20, minimum_stock: 3, cost_per_unit: 4.00 },
    { name: 'Ovos', unit: 'dúzia', current_stock: 10, minimum_stock: 2, cost_per_unit: 12.00 },
    { name: 'Leite condensado caixinha', unit: 'unidade', current_stock: 30, minimum_stock: 5, cost_per_unit: 4.50 },
    { name: 'Leite condensado lata', unit: 'unidade', current_stock: 20, minimum_stock: 3, cost_per_unit: 5.50 },
    { name: 'Creme de leite', unit: 'unidade', current_stock: 25, minimum_stock: 3, cost_per_unit: 3.80 },
    { name: 'Leite em pó ninho', unit: 'kg', current_stock: 5, minimum_stock: 1, cost_per_unit: 25.00 },
    { name: 'Nutella', unit: 'kg', current_stock: 3, minimum_stock: 0.5, cost_per_unit: 35.00 },
    { name: 'Biscoito Oreo', unit: 'pacote', current_stock: 15, minimum_stock: 2, cost_per_unit: 8.00 },
    { name: 'Margarina', unit: 'kg', current_stock: 8, minimum_stock: 1, cost_per_unit: 12.00 },
    { name: 'Biscoito de maisena', unit: 'pacote', current_stock: 20, minimum_stock: 3, cost_per_unit: 6.00 },
    { name: 'Banana', unit: 'kg', current_stock: 5, minimum_stock: 1, cost_per_unit: 4.00 },
    { name: 'Morangos', unit: 'kg', current_stock: 2, minimum_stock: 0.5, cost_per_unit: 15.00 },
    { name: 'Chocolate nobre 40%', unit: 'kg', current_stock: 8, minimum_stock: 1, cost_per_unit: 45.00 },
    { name: 'Chocolate Nobre 70%', unit: 'kg', current_stock: 6, minimum_stock: 1, cost_per_unit: 50.00 },
    { name: 'Chocolate cobertura', unit: 'kg', current_stock: 10, minimum_stock: 1, cost_per_unit: 30.00 }
  ];

  try {
    for (const ing of ingredients) {
      const { data: existing } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', ing.name)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase
          .from('ingredients')
          .insert(ing);

        if (error) console.error(`Error inserting ${ing.name}:`, error);
      } else {
        const { error } = await supabase
          .from('ingredients')
          .update(ing)
          .eq('id', existing.id);

        if (error) console.error(`Error updating ${ing.name}:`, error);
      }
    }

    console.log('Ingredients seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding ingredients:', error);
    return false;
  }
};

export const seedRecipes = async () => {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, name');

    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('id, name');

    if (!products || !ingredients) return false;

    const recipes = [
      {
        product: 'Brownie Tradicional',
        ingredients: [
          { name: 'Farinha de trigo', quantity: 0.2 },
          { name: 'Açúcar refinado', quantity: 0.15 },
          { name: 'Chocolate Nobre 70%', quantity: 0.25 },
          { name: 'Ovos', quantity: 0.5 },
          { name: 'Margarina', quantity: 0.1 },
          { name: 'Leite condensado lata', quantity: 0.3 }
        ]
      },
      {
        product: 'Brownie de Nozes',
        ingredients: [
          { name: 'Farinha de trigo', quantity: 0.2 },
          { name: 'Açúcar refinado', quantity: 0.15 },
          { name: 'Chocolate nobre 40%', quantity: 0.2 },
          { name: 'Ovos', quantity: 0.5 },
          { name: 'Margarina', quantity: 0.1 },
          { name: 'Leite condensado caixinha', quantity: 0.3 },
          { name: 'Biscoito de maisena', quantity: 0.1 }
        ]
      },
      {
        product: 'Brownie Vegano',
        ingredients: [
          { name: 'Farinha de trigo', quantity: 0.2 },
          { name: 'Açúcar Mascavo', quantity: 0.2 },
          { name: 'Chocolate Nobre 70%', quantity: 0.25 },
          { name: 'Leite em pó ninho', quantity: 0.1 },
          { name: 'Margarina', quantity: 0.12 },
          { name: 'Banana', quantity: 0.15 }
        ]
      }
    ];

    for (const recipeGroup of recipes) {
      const product = products.find(p => p.name === recipeGroup.product);
      if (!product) continue;

      for (const item of recipeGroup.ingredients) {
        const ingredient = ingredients.find(i => i.name === item.name);
        if (!ingredient) continue;

        const { data: existing } = await supabase
          .from('recipes')
          .select('id')
          .eq('product_id', product.id)
          .eq('ingredient_id', ingredient.id)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase
            .from('recipes')
            .insert({
              product_id: product.id,
              ingredient_id: ingredient.id,
              quantity: item.quantity
            });

          if (error) console.error(`Error inserting recipe:`, error);
        }
      }
    }

    console.log('Recipes seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding recipes:', error);
    return false;
  }
};
