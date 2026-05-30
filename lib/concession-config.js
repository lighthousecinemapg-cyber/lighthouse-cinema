// ================================================================
// CONCESSION MENU CONFIG — Lighthouse Cinema
// All food items, combos, modifiers, and categories
// ================================================================

export const CONCESSION_CATEGORIES = [
  { id: 'hot-dogs', name: 'Hot Dogs', icon: '🌭', order: 1 },
  { id: 'pizza', name: 'Pizza Slices', icon: '🍕', order: 2 },
  { id: 'wings', name: 'Wings', icon: '🍗', order: 3 },
  { id: 'sides', name: 'Sides & Appetizers', icon: '🧀', order: 4 },
  { id: 'pretzels', name: 'Soft Pretzels', icon: '🥨', order: 5 },
  { id: 'classics', name: 'Cinema Classics', icon: '🍿', order: 6 },
];

export const MODIFIER_GROUPS = {
  'wing-sauce': {
    id: 'wing-sauce', name: 'Sauce', type: 'single',
    options: [
      { id: 'hot', name: 'Hot', price: 0 },
      { id: 'bbq', name: 'BBQ', price: 0 },
      { id: 'original', name: 'Original', price: 0 },
    ],
  },
};

export const CONCESSION_ITEMS = [
  // Hot Dogs
  { id: 'classic-dog', name: 'Classic Dog', price: 8.99, category: 'hot-dogs', desc: 'Ketchup & Mustard' },
  { id: 'chili-cheese-dog', name: 'Chili Cheese Dog', price: 9.99, category: 'hot-dogs', desc: 'House Chili & Cheese' },
  { id: 'bbq-bacon-dog', name: 'BBQ Bacon Dog', price: 11, category: 'hot-dogs', desc: 'BBQ Sauce & Crispy Bacon' },
  { id: 'spicy-jalapeno-dog', name: 'Spicy Jalapeno Dog', price: 10, category: 'hot-dogs', desc: 'Nacho Cheese & Jalapenos' },
  // Pizza Slices
  { id: 'detroit-pepperoni', name: 'Detroit Pepperoni', price: 5, category: 'pizza', desc: 'Deep Dish, Crispy Edge' },
  { id: 'margherita', name: 'Margherita', price: 5, category: 'pizza', desc: 'Basil & Fresh Mozzarella' },
  { id: 'supreme', name: 'Supreme', price: 5, category: 'pizza', desc: 'Pepperoni, Sausage, Veggies' },
  { id: 'white-pizza', name: 'White Pizza', price: 5, category: 'pizza', desc: 'Spinach & Four Cheese' },
  // Wings
  { id: '5-wings', name: '5 Wings', price: 11.95, category: 'wings', desc: 'Hot, BBQ, or Original', modifiers: ['wing-sauce'] },
  { id: '8-wings', name: '8 Wings', price: 15.95, category: 'wings', desc: 'Hot, BBQ, or Original', modifiers: ['wing-sauce'] },
  // Sides & Appetizers
  { id: 'mozz-sticks', name: 'Mozzarella Sticks', price: 9.99, category: 'sides', desc: 'Hand-Battered, Golden, Marinara' },
  { id: 'chicken-tenders', name: 'Chicken Tenders', price: 10, category: 'sides', desc: 'Crispy Breaded, Dipping Sauce' },
  { id: 'nachos-cheese', name: 'Nachos & Cheese', price: 7.99, category: 'sides', desc: 'Tortilla Chips & Warm Cheese' },
  // Soft Pretzels
  { id: 'salted-pretzel', name: 'Salted Pretzel', price: 6, category: 'pretzels', desc: 'Classic Sea Salt' },
  { id: 'cheese-pretzel', name: 'Cheese Pretzel', price: 6, category: 'pretzels', desc: 'Warm Cheese Dip' },
  { id: 'cinnamon-pretzel', name: 'Cinnamon Pretzel', price: 6, category: 'pretzels', desc: 'Cinnamon Sugar Coated' },
  // Cinema Classics
  { id: 'large-popcorn', name: 'Large Popcorn', price: 8, category: 'classics', desc: 'Freshly Popped & Buttered' },
  { id: 'candy-bar', name: 'Candy Bar', price: 4, category: 'classics', desc: 'Assorted Selection' },
  { id: 'fountain-drink', name: 'Fountain Drink', price: 5, category: 'classics', desc: 'Coke, Sprite, Lemonade' },
  { id: 'bottled-water', name: 'Bottled Water', price: 3, category: 'classics', desc: 'Cold & Refreshing' },
];

export function getItemsByCategory(categoryId) {
  return CONCESSION_ITEMS.filter(item => item.category === categoryId);
}

export function getModifierGroup(groupId) {
  return MODIFIER_GROUPS[groupId] || null;
}

export function calculateItemTotal(item, quantity, isCombo, selectedModifiers = []) {
  const basePrice = isCombo ? item.comboPrice : item.price;
  let modTotal = 0;
  for (const mod of selectedModifiers) {
    for (const groupId of item.modifierGroups) {
      const group = MODIFIER_GROUPS[groupId];
      if (group) {
        const opt = group.options.find(o => o.id === mod);
        if (opt) modTotal += opt.price;
      }
    }
  }
  return (basePrice + modTotal) * quantity;
}

export const COMBO_INCLUDES = 'Includes: Fountain Drink + Popcorn';
