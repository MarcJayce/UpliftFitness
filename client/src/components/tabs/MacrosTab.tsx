import React, { useState } from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusIcon, MoreVerticalIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Meal, NutritionGoal, FoodItem } from '@/lib/types';
import { foodImages } from '@/assets/food-images';
import { AddFoodDialog } from '@/components/macros/AddFoodDialog';

export function MacrosTab() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const formattedDate = format(new Date(), 'MMMM d, yyyy');
  
  // State for AddFoodDialog
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [currentMealType, setCurrentMealType] = useState<string>('breakfast');
  
  // Fetch nutrition goals
  const { data: nutritionGoal, isLoading: isLoadingGoals } = useQuery({
    queryKey: ['/api/nutrition-goals'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/nutrition-goals');
        return await res.json() as NutritionGoal;
      } catch (error) {
        // Return default goals if none are set
        return {
          id: 0,
          dailyCalories: 2200,
          proteinG: 160,
          carbsG: 215,
          fatG: 70
        } as NutritionGoal;
      }
    }
  });
  
  // Fetch today's meals
  const { data: meals, isLoading: isLoadingMeals } = useQuery({
    queryKey: ['/api/meals/by-date', today],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/meals/by-date?date=${today}`);
        return await res.json() as Meal[];
      } catch (error) {
        return [];
      }
    }
  });
  
  // Calculate consumed macros from today's meals
  const consumedMacros = React.useMemo(() => {
    if (!meals || !meals.length) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    return meals.reduce((total, meal) => {
      if (!meal.items || !meal.items.length) return total;
      
      const mealTotals = meal.items.reduce((mealTotal, item) => {
        const servingRatio = item.servingSize || 1;
        
        return {
          calories: mealTotal.calories + (item.calories || 0) * servingRatio,
          protein: mealTotal.protein + (item.protein || 0) * servingRatio,
          carbs: mealTotal.carbs + (item.carbs || 0) * servingRatio,
          fat: mealTotal.fat + (item.fat || 0) * servingRatio
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      return {
        calories: total.calories + mealTotals.calories,
        protein: total.protein + mealTotals.protein,
        carbs: total.carbs + mealTotals.carbs,
        fat: total.fat + mealTotals.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meals]);
  
  // Sample meal suggestions based on remaining macros
  const mealSuggestions = [
    {
      id: 1,
      name: "Protein Bowl",
      description: "High protein • 450 kcal",
      imageUrl: foodImages[0].url
    },
    {
      id: 2,
      name: "Protein Shake",
      description: "Post-workout • 300 kcal",
      imageUrl: foodImages[1].url
    },
    {
      id: 3,
      name: "Salmon Dinner",
      description: "Omega-3 rich • 520 kcal",
      imageUrl: foodImages[2].url
    },
    {
      id: 4,
      name: "Greek Yogurt",
      description: "Protein snack • 200 kcal",
      imageUrl: foodImages[3].url
    }
  ];
  
  // Find or create meal types
  const breakfast = meals?.find(m => m.type === 'breakfast') || { id: 0, name: 'Breakfast', type: 'breakfast', date: today, items: [] };
  const lunch = meals?.find(m => m.type === 'lunch') || { id: 0, name: 'Lunch', type: 'lunch', date: today, items: [] };
  const dinner = meals?.find(m => m.type === 'dinner') || { id: 0, name: 'Dinner', type: 'dinner', date: today, items: [] };
  const snacks = meals?.find(m => m.type === 'snack') || { id: 0, name: 'Snacks', type: 'snack', date: today, items: [] };

  return (
    <div className="pb-20">
      {/* Add Food Dialog */}
      <AddFoodDialog 
        open={addFoodDialogOpen} 
        onOpenChange={setAddFoodDialogOpen} 
        mealType={currentMealType}
      />
      
      {/* Daily Nutrition Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Daily Nutrition</h2>
          <div className="text-sm text-muted-foreground">{formattedDate}</div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            {isLoadingGoals ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-poppins font-semibold">Calorie Goal</h3>
                  <Skeleton className="h-5 w-32" />
                </div>
                
                <Skeleton className="w-full h-2.5 rounded-full mb-6" />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mx-auto size-20 rounded-full mb-1" />
                      <Skeleton className="h-5 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-poppins font-semibold">Calorie Goal</h3>
                  <div className="text-primary font-medium">
                    {Math.round(consumedMacros.calories)} / {nutritionGoal?.dailyCalories} kcal
                  </div>
                </div>
                
                <div className="w-full bg-muted rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (consumedMacros.calories / (nutritionGoal?.dailyCalories || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <ProgressRing 
                      value={consumedMacros.protein} 
                      max={nutritionGoal?.proteinG || 160}
                      color="hsl(var(--primary))"
                      label={
                        <div className="text-center">
                          <div className="text-lg font-medium">{Math.round(consumedMacros.protein)}g</div>
                          <div className="text-xs text-muted-foreground">/ {nutritionGoal?.proteinG || 160}g</div>
                        </div>
                      }
                    />
                    <div className="mt-1 font-medium">Protein</div>
                  </div>
                  
                  <div>
                    <ProgressRing 
                      value={consumedMacros.fat} 
                      max={nutritionGoal?.fatG || 70}
                      color="hsl(var(--secondary))"
                      label={
                        <div className="text-center">
                          <div className="text-lg font-medium">{Math.round(consumedMacros.fat)}g</div>
                          <div className="text-xs text-muted-foreground">/ {nutritionGoal?.fatG || 70}g</div>
                        </div>
                      }
                    />
                    <div className="mt-1 font-medium">Fats</div>
                  </div>
                  
                  <div>
                    <ProgressRing 
                      value={consumedMacros.carbs} 
                      max={nutritionGoal?.carbsG || 215}
                      color="hsl(30, 100%, 60%)"
                      label={
                        <div className="text-center">
                          <div className="text-lg font-medium">{Math.round(consumedMacros.carbs)}g</div>
                          <div className="text-xs text-muted-foreground">/ {nutritionGoal?.carbsG || 215}g</div>
                        </div>
                      }
                    />
                    <div className="mt-1 font-medium">Carbs</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Meals Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Today's Meals</h2>
          <Button 
            variant="ghost" 
            className="text-primary flex items-center"
            onClick={() => {
              setCurrentMealType('breakfast');
              setAddFoodDialogOpen(true);
            }}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Food
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Breakfast */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-poppins font-semibold">Breakfast</h3>
              {breakfast.items && breakfast.items.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  {breakfast.items.reduce((sum, item) => sum + (item.calories || 0) * (item.servingSize || 1), 0)} kcal
                </div>
              )}
            </div>
            
            <CardContent className="p-4 space-y-3">
              {isLoadingMeals ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="w-10 h-10 rounded-lg mr-3" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : breakfast.items && breakfast.items.length > 0 ? (
                <>
                  {breakfast.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-muted mr-3"></div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">
                            {item.servingSize}{item.servingUnit} • {Math.round((item.calories || 0) * (item.servingSize || 1))} kcal
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-2 mt-2">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Food
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-4">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Food
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Lunch */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-poppins font-semibold">Lunch</h3>
              {lunch.items && lunch.items.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  {lunch.items.reduce((sum, item) => sum + (item.calories || 0) * (item.servingSize || 1), 0)} kcal
                </div>
              )}
            </div>
            
            <CardContent className="p-4 space-y-3">
              {isLoadingMeals ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="w-10 h-10 rounded-lg mr-3" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : lunch.items && lunch.items.length > 0 ? (
                <>
                  {lunch.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-muted mr-3"></div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">
                            {item.servingSize}{item.servingUnit} • {Math.round((item.calories || 0) * (item.servingSize || 1))} kcal
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-2 mt-2">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Food
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-4">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Food
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Dinner */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-poppins font-semibold">Dinner</h3>
              {dinner.items && dinner.items.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  {dinner.items.reduce((sum, item) => sum + (item.calories || 0) * (item.servingSize || 1), 0)} kcal
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              {isLoadingMeals ? (
                <Skeleton className="h-12 w-full" />
              ) : dinner.items && dinner.items.length > 0 ? (
                <div className="space-y-3">
                  {dinner.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-muted mr-3"></div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">
                            {item.servingSize}{item.servingUnit} • {Math.round((item.calories || 0) * (item.servingSize || 1))} kcal
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-2 mt-2">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Food
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-4">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Food
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Snacks */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-poppins font-semibold">Snacks</h3>
              {snacks.items && snacks.items.length > 0 && (
                <div className="text-muted-foreground text-sm">
                  {snacks.items.reduce((sum, item) => sum + (item.calories || 0) * (item.servingSize || 1), 0)} kcal
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              {isLoadingMeals ? (
                <Skeleton className="h-12 w-full" />
              ) : snacks.items && snacks.items.length > 0 ? (
                <div className="space-y-3">
                  {snacks.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-muted mr-3"></div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-muted-foreground text-xs">
                            {item.servingSize}{item.servingUnit} • {Math.round((item.calories || 0) * (item.servingSize || 1))} kcal
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-2 mt-2">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Food
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" className="w-full text-primary flex items-center justify-center py-4">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Food
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Meal Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Meal Suggestions</h2>
          <div className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
            Based on your macros
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {mealSuggestions.map((meal) => (
            <Card 
              key={meal.id}
              className="food-card overflow-hidden transition duration-300"
            >
              <div className="h-36 bg-muted relative">
                <img 
                  src={meal.imageUrl} 
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2">
                  <p className="font-medium text-sm">{meal.name}</p>
                  <p className="text-muted-foreground text-xs">{meal.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
