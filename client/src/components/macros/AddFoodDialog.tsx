import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FoodItem } from '@/lib/types';

const foodItemSchema = z.object({
  name: z.string().min(2, { message: "Food name must be at least 2 characters" }),
  brand: z.string().optional(),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0).optional(),
  sugar: z.coerce.number().min(0).optional(),
  servingSize: z.coerce.number().min(0),
  servingUnit: z.string().min(1),
});

const mealFoodItemSchema = z.object({
  mealType: z.string(),
  foodItemId: z.number(),
  servingSize: z.coerce.number().min(0.1),
  servingUnit: z.string(),
  date: z.string(),
});

type FoodItemForm = z.infer<typeof foodItemSchema>;
type MealFoodItemForm = z.infer<typeof mealFoodItemSchema>;

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType?: string;
}

export function AddFoodDialog({ open, onOpenChange, mealType = 'breakfast' }: AddFoodDialogProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form for creating new food
  const createFoodForm = useForm<FoodItemForm>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: {
      name: '',
      brand: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      servingSize: 100,
      servingUnit: 'g',
    },
  });
  
  // Form for adding existing food to meal
  const addToMealForm = useForm<MealFoodItemForm>({
    resolver: zodResolver(mealFoodItemSchema),
    defaultValues: {
      mealType,
      foodItemId: 0,
      servingSize: 1,
      servingUnit: 'serving',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });
  
  const isCreatingFood = createFoodForm.formState.isSubmitting;
  const isAddingToMeal = addToMealForm.formState.isSubmitting;
  
  // Search for food
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    try {
      const res = await apiRequest('GET', `/api/food-items/search?query=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching for food:", error);
      toast({
        title: "Error",
        description: "Failed to search for food. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Select a food item from search results
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    addToMealForm.setValue('foodItemId', food.id);
    addToMealForm.setValue('servingUnit', food.servingUnit || 'g');
  };
  
  // Create a new food item
  const onCreateFood = async (data: FoodItemForm) => {
    try {
      const response = await apiRequest('POST', '/api/food-items', data);
      const newFood = await response.json();
      
      // Add new food to the meal and reset forms
      setSelectedFood(newFood);
      addToMealForm.setValue('foodItemId', newFood.id);
      addToMealForm.setValue('servingUnit', newFood.servingUnit);
      
      toast({
        title: "Success!",
        description: "Food item created successfully",
      });
      
      // Switch to the add to meal tab
      setActiveTab('search');
      setSearchResults([newFood]);
      
      // Reset create food form
      createFoodForm.reset();
    } catch (error) {
      console.error("Error creating food item:", error);
      toast({
        title: "Error",
        description: "Failed to create food item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Add food to meal
  const onAddToMeal = async (data: MealFoodItemForm) => {
    try {
      // First check if a meal of this type exists for today
      const dateQuery = data.date;
      const mealTypeQuery = data.mealType;
      
      const mealsRes = await apiRequest('GET', `/api/meals/by-date-and-type?date=${dateQuery}&type=${mealTypeQuery}`);
      const meals = await mealsRes.json();
      
      let mealId: number;
      
      if (meals.length > 0) {
        // Use existing meal
        mealId = meals[0].id;
      } else {
        // Create a new meal
        const createMealRes = await apiRequest('POST', '/api/meals', {
          name: data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1),
          type: data.mealType,
          date: data.date,
        });
        const newMeal = await createMealRes.json();
        mealId = newMeal.id;
      }
      
      // Now add the food item to the meal
      await apiRequest('POST', `/api/meals/${mealId}/items`, {
        mealId,
        foodItemId: data.foodItemId,
        servingSize: data.servingSize,
        servingUnit: data.servingUnit,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/meals/by-date'] });
      queryClient.invalidateQueries({ queryKey: ['/api/meals/by-date-and-type'] });
      
      // Show success message, close dialog, and reset form
      toast({
        title: "Success!",
        description: "Food added to your meal",
      });
      
      onOpenChange(false);
      setTimeout(() => {
        addToMealForm.reset();
        setSelectedFood(null);
        setSearchResults([]);
        setSearchTerm('');
      }, 300);
      
    } catch (error) {
      console.error("Error adding food to meal:", error);
      toast({
        title: "Error",
        description: "Failed to add food to meal. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Food</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="search" value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'create')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="search">Search Food</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="Search food items..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </form>
            
            {/* Search Results */}
            <div className="max-h-[200px] overflow-y-auto border rounded-md">
              {searchResults.length > 0 ? (
                <div className="divide-y">
                  {searchResults.map((food) => (
                    <div 
                      key={food.id}
                      className={`p-3 cursor-pointer hover:bg-muted transition-colors ${selectedFood?.id === food.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelectFood(food)}
                    >
                      <div className="font-medium">{food.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {food.brand && `${food.brand} • `}
                        {food.calories} kcal | P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Per {food.servingSize} {food.servingUnit}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="p-4 text-center text-muted-foreground">
                  No results found. Try a different search or create a new food item.
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Search for food by name or brand
                </div>
              )}
            </div>
            
            {/* Add to Meal Form */}
            {selectedFood && (
              <Form {...addToMealForm}>
                <form onSubmit={addToMealForm.handleSubmit(onAddToMeal)} className="space-y-4">
                  <div className="bg-muted p-3 rounded-md mb-4">
                    <div className="font-medium">{selectedFood.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedFood.calories} kcal | P: {selectedFood.protein}g • C: {selectedFood.carbs}g • F: {selectedFood.fat}g
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <FormField
                      control={addToMealForm.control}
                      name="servingSize"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0.1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addToMealForm.control}
                      name="servingUnit"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Unit</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="oz">oz</SelectItem>
                              <SelectItem value="serving">serving</SelectItem>
                              <SelectItem value="cup">cup</SelectItem>
                              <SelectItem value="tbsp">tbsp</SelectItem>
                              <SelectItem value="tsp">tsp</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addToMealForm.control}
                    name="mealType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snacks</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingToMeal}>
                      {isAddingToMeal ? "Adding..." : "Add to Meal"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            <Form {...createFoodForm}>
              <form onSubmit={createFoodForm.handleSubmit(onCreateFood)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createFoodForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Food Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Chicken Breast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createFoodForm.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Brand (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Tyson" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createFoodForm.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories (kcal)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createFoodForm.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createFoodForm.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbs (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createFoodForm.control}
                    name="fat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fat (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createFoodForm.control}
                    name="fiber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiber (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createFoodForm.control}
                    name="sugar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sugar (g)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createFoodForm.control}
                    name="servingSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serving Size</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createFoodForm.control}
                    name="servingUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="oz">oz</SelectItem>
                            <SelectItem value="serving">serving</SelectItem>
                            <SelectItem value="cup">cup</SelectItem>
                            <SelectItem value="tbsp">tbsp</SelectItem>
                            <SelectItem value="tsp">tsp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreatingFood}>
                    {isCreatingFood ? "Creating..." : "Create Food"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}