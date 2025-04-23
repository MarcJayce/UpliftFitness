interface FoodImage {
  id: string;
  name: string;
  category: string;
  url: string;
}

export const foodImages: FoodImage[] = [
  {
    id: "protein-bowl",
    name: "Protein Bowl",
    category: "High Protein",
    url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "protein-shake",
    name: "Protein Shake",
    category: "Post-workout",
    url: "https://images.unsplash.com/photo-1625937286074-9ca519f7b9af?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "salmon-dinner",
    name: "Salmon Dinner",
    category: "Omega-3 Rich",
    url: "https://images.unsplash.com/photo-1604908177453-7462950daca7?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    category: "Protein Snack",
    url: "https://images.unsplash.com/photo-1556040220-4096d522378d?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "healthy-breakfast",
    name: "Healthy Breakfast",
    category: "Breakfast",
    url: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "chicken-salad",
    name: "Chicken Salad",
    category: "Lunch",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&q=75&fit=crop&w=500"
  }
];

export function getFoodImageByName(name: string): string {
  const food = foodImages.find(f => 
    f.name.toLowerCase().includes(name.toLowerCase()) || 
    name.toLowerCase().includes(f.name.toLowerCase())
  );
  
  return food?.url || foodImages[0].url;
}

export function getFoodImageByCategory(category: string): string {
  const food = foodImages.find(f => 
    f.category.toLowerCase() === category.toLowerCase()
  );
  
  return food?.url || foodImages[0].url;
}
