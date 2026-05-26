// ================================================================
// CONCESSION MENU CONFIG — Lighthouse Cinema
// All food items, combos, modifiers, and categories
// ================================================================

export const CONCESSION_CATEGORIES = [
  { id: 'hot-dogs', name: 'Hot Dogs', icon: '🌭', order: 1 },
  { id: 'pizza', name: 'Pizza Slices', icon: '🍕', order: 2 },
  { id: 'nachos', name: 'Nachos', icon: '🧀', order: 3 },
  { id: 'pretzels', name: 'Soft Pretzels', icon: '🥨', order: 4 },
  { id: 'chicken', name: 'Chicken', icon: '🍗', order: 5 },
  { id: 'combos', name: 'Combos', icon: '🎬', order: 6 },
];

export const MODIFIER_GROUPS = {
  'hot-dog-addons': {
    id: 'hot-dog-addons', name: 'Add-Ons', type: 'multi',
    options: [
      { id: 'extra-cheese', name: 'Extra Cheese', price: 1 },
      { id: 'jalapenos', name: 'Jalapeños', price: 1 },
      { id: 'bacon', name: 'Bacon', price: 2 },
    ],
  },
  'nacho-addons': {
    id: 'nacho-addons', name: 'Add-Ons', type: 'multi',
    options: [
      { id: 'extra-cheese', name: 'Extra Cheese', price: 1 },
      { id: 'jalapenos', name: 'Jalapeños', price: 1 },
      { id: 'chili', name: 'Chili', price: 2 },
    ],
  },
  'sauce-choice': {
    id: 'sauce-choice', name: 'Choice of Sauce', type: 'single', required: false,
    options: [
      { id: 'bbq', name: 'BBQ', price: 0 },
      { id: 'ranch', name: 'Ranch', price: 0 },
      { id: 'buffalo', name: 'Buffalo', price: 0 },
    ],
  },
};

export const CONCESSION_ITEMS = [
  { id: 'classic-hot-dog', name: 'The Classic Hot Dog', description: 'Ketchup, Mustard, Relish, Onions', price: 7, category: 'hot-dogs', comboPrice: 12, comboId: 'classic-dog-combo', modifierGroups: ['hot-dog-addons'], badge: null, image: '/images/menu/classic-hotdog.jpg' },
  { id: 'chili-cheese-dog', name: 'Chili Cheese Dog', description: 'Chili, Cheese, Onions', price: 10, category: 'hot-dogs', comboPrice: 15, comboId: 'chili-cheese-combo', modifierGroups: ['hot-dog-addons'], badge: 'Popular', image: '/images/menu/chili-cheese-dog.jpg' },
  { id: 'bbq-bacon-dog', name: 'BBQ Bacon Dog', description: 'BBQ Sauce, Bacon, Cheddar, Onions', price: 11, category: 'hot-dogs', comboPrice: 16, comboId: 'bbq-bacon-combo', modifierGroups: ['hot-dog-addons'], badge: 'Best Seller', image: '/images/menu/bbq-bacon-dog.jpg' },
  { id: 'spicy-jalapeno-dog', name: 'Spicy Jalapeño Dog', description: 'Nacho Cheese, Jalapeños, Spicy Sauce, Onions', price: 10, category: 'hot-dogs', comboPrice: 15, comboId: 'spicy-jalapeno-combo', modifierGroups: ['hot-dog-addons'], badge: null, image: '/images/menu/spicy-jalapeno-dog.jpg' },
  { id: 'cheese-slice', name: 'Cheese Slice', description: 'Classic cheese pizza slice', price: 5, category: 'pizza', comboPrice: 11, comboId: 'pizza-combo', modifierGroups: [], badge: null, image: '/images/menu/cheese-pizza.jpg' },
  { id: 'pepperoni-slice', name: 'Pepperoni Slice', description: 'Loaded with pepperoni', price: 5, category: 'pizza', comboPrice: 11, comboId: 'pizza-combo', modifierGroups: [], badge: 'Popular', image: '/images/menu/pepperoni-pizza.jpg' },
  { id: 'supreme-slice', name: 'Supreme Slice', description: 'Peppers, onions, mushrooms, olives, sausage', price: 5, category: 'pizza', comboPrice: 11, comboId: 'pizza-combo', modifierGroups: [], badge: null, image: '/images/menu/supreme-pizza.jpg' },
  { id: 'four-meat-slice', name: 'Four Meat Slice', description: 'Pepperoni, sausage, ham, bacon', price: 5, category: 'pizza', comboPrice: 11, comboId: 'pizza-combo', modifierGroups: [], badge: null, image: '/images/menu/four-meat-pizza.jpg' },
  { id: 'classic-nachos', name: 'Classic Nachos', description: 'Tortilla chips with cheese sauce', price: 7, category: 'nachos', comboPrice: 13, comboId: 'nachos-combo', modifierGroups: ['nacho-addons'], badge: null, image: '/images/menu/nachos.jpg' },
  { id: 'salted-pretzel', name: 'Salted Pretzel', description: 'Warm soft pretzel with salt', price: 6, category: 'pretzels', comboPrice: 11, comboId: 'pretzel-combo-11', modifierGroups: [], badge: null, image: '/images/menu/salted-pretzel.jpg' },
  { id: 'cheese-pretzel', name: 'Cheese Pretzel', description: 'Warm soft pretzel with cheese dip', price: 7, category: 'pretzels', comboPrice: 12, comboId: 'pretzel-combo-12', modifierGroups: [], badge: 'Popular', image: '/images/menu/cheese-pretzel.jpg' },
  { id: 'cinnamon-sugar-pretzel', name: 'Cinnamon Sugar Pretzel', description: 'Sweet cinnamon sugar coated pretzel', price: 7, category: 'pretzels', comboPrice: 12, comboId: 'pretzel-combo-12b', modifierGroups: [], badge: null, image: '/images/menu/cinnamon-pretzel.jpg' },
  { id: 'chicken-tenders', name: '3 Chicken Tenders', description: 'Crispy breaded chicken tenders', price: 10, category: 'chicken', comboPrice: 15, comboId: 'tenders-combo', modifierGroups: ['sauce-choice'], badge: 'Best Seller', image: '/images/menu/chicken-tenders.jpg' },
  { id: 'chicken-wings', name: '6 Chicken Wings', description: 'Crispy chicken wings', price: 11, category: 'chicken', comboPrice: 16, comboId: 'wings-combo', modifierGroups: ['sauce-choice'], badge: null, image: '/images/menu/chicken-wings.jpg' },
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
