import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CameraIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { WorkoutSession, BodyMeasurement, ProgressPhoto, NutritionGoal } from '@/lib/types';

export function DashboardTab() {
  const [timeRange, setTimeRange] = React.useState('7days');
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  // Calculate date ranges based on selection
  const endDate = new Date();
  const startDate = React.useMemo(() => {
    switch (timeRange) {
      case '7days': return subDays(endDate, 6);
      case '14days': return subDays(endDate, 13);
      case '30days': return subDays(endDate, 29);
      default: return subDays(endDate, 6);
    }
  }, [timeRange, endDate]);
  
  // Format dates for API requests
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');
  
  // Fetch workout sessions
  const { data: workoutSessions, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ['/api/workout-sessions/recent'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/workout-sessions/recent');
      return await res.json() as WorkoutSession[];
    }
  });
  
  // Fetch body measurements
  const { data: bodyMeasurements, isLoading: isLoadingMeasurements } = useQuery({
    queryKey: ['/api/body-measurements/range', formattedStartDate, formattedEndDate],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/body-measurements/range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`);
      return await res.json() as BodyMeasurement[];
    }
  });
  
  // Fetch progress photos
  const { data: progressPhotos, isLoading: isLoadingPhotos } = useQuery({
    queryKey: ['/api/progress-photos'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/progress-photos');
      return await res.json() as ProgressPhoto[];
    }
  });
  
  // Fetch nutrition goals for adherence calculations
  const { data: nutritionGoal } = useQuery({
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
          proteinPct: 30,
          carbsPct: 40,
          fatPct: 30
        } as NutritionGoal;
      }
    }
  });
  
  // Calculate workout consistency data
  const weekdayWorkouts = React.useMemo(() => {
    const days = Array(7).fill(0);
    
    if (!workoutSessions) return days;
    
    // Map sessions to days of week and count durations
    workoutSessions.forEach(session => {
      const date = new Date(session.date);
      const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Increment the value for this day (could be duration, but using 1 for simple count)
      days[dayIndex] += session.duration || 60; // Use 60 min as default if no duration
    });
    
    // Normalize values for display (percentage of max)
    const max = Math.max(...days, 60); // Ensure min height with 60
    return days.map(d => Math.max(10, (d / max) * 100)); // At least 10% height for visibility
  }, [workoutSessions]);
  
  // Get current month photos
  const currentMonthPhotos = React.useMemo(() => {
    if (!progressPhotos) return [];
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return progressPhotos.filter(photo => {
      const photoDate = new Date(photo.date);
      return photoDate.getFullYear() === year && photoDate.getMonth() === month;
    }).slice(0, 5); // Limit to 5 photos for the grid
  }, [progressPhotos, currentMonth]);
  
  // Get previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  // Get next month
  const goToNextMonth = () => {
    const nextMonth = addDays(new Date(currentMonth), 32);
    nextMonth.setDate(1);
    
    // Don't allow going past current month
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };
  
  // Sample adherence data - in a real app this would come from the API
  const adherenceData = {
    calories: 92,
    protein: 88,
    carbs: 75,
    fat: 95
  };

  return (
    <div className="pb-20">
      {/* Weekly Overview Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Weekly Overview</h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-background text-muted-foreground rounded-lg w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="14days">Last 14 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-semibold">Workout Consistency</h3>
              <div className="text-primary font-medium">
                {workoutSessions ? `${workoutSessions.length}/7 days` : '0/7 days'}
              </div>
            </div>
            
            {isLoadingWorkouts ? (
              <Skeleton className="h-32 w-full mb-2" />
            ) : (
              <>
                <div className="flex justify-between items-center mb-2 gap-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="flex-1 text-center">
                      <div className="h-24 flex flex-col justify-end mb-1">
                        <div 
                          className={`mx-auto w-6 rounded-sm ${
                            weekdayWorkouts[index] > 10 ? 'bg-primary' : 'bg-muted'
                          }`} 
                          style={{ height: `${weekdayWorkouts[index]}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{day}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center text-muted-foreground text-sm">
                  {workoutSessions && workoutSessions.length > 0 ? (
                    `Average: ${Math.round(
                      workoutSessions.reduce((sum, session) => sum + (session.duration || 60), 0) / 
                      workoutSessions.length
                    )} min/workout`
                  ) : (
                    'No workouts recorded'
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Body Measurements Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-poppins font-semibold mb-3">Weight</h3>
            {isLoadingMeasurements ? (
              <Skeleton className="h-32 w-full" />
            ) : bodyMeasurements && bodyMeasurements.length > 0 ? (
              <div className="h-32 flex flex-col justify-end">
                <div className="relative w-full h-24 flex items-end">
                  <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between">
                    {bodyMeasurements.length > 0 && [0, 1, 2].map((i) => {
                      const weights = bodyMeasurements.map(m => m.weight || 0).filter(w => w > 0);
                      const maxWeight = Math.max(...weights);
                      const minWeight = Math.min(...weights);
                      const range = maxWeight - minWeight;
                      const step = range > 0 ? range / 2 : 1;
                      const value = maxWeight - (i * step);
                      
                      return (
                        <div key={i} className="border-t border-border relative">
                          <span className="absolute -top-3 right-0 text-xs text-muted-foreground">
                            {value.toFixed(1)}kg
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 24">
                    <path 
                      d={bodyMeasurements.length > 1 
                        ? `M${bodyMeasurements.map((m, i) => {
                            const x = (i / (bodyMeasurements.length - 1)) * 100;
                            
                            const weights = bodyMeasurements.map(m => m.weight || 0).filter(w => w > 0);
                            const maxWeight = Math.max(...weights);
                            const minWeight = Math.min(...weights);
                            const range = maxWeight - minWeight;
                            
                            // Calculate y position (0 = top, 24 = bottom)
                            // Inverse the value since SVG coordinates have 0 at the top
                            let y = 12; // Default to middle if no weight
                            if (m.weight && range > 0) {
                              y = 24 - (((m.weight - minWeight) / range) * 20);
                            }
                            
                            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                          }).join(' ')}`
                        : '' // Empty if not enough data points
                      }
                      fill="none" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                
                <div className="mt-1 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(startDate, 'MMM d')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(endDate, 'MMM d')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No weight data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-poppins font-semibold mb-3">Body Fat %</h3>
            {isLoadingMeasurements ? (
              <Skeleton className="h-32 w-full" />
            ) : bodyMeasurements && bodyMeasurements.length > 0 ? (
              <div className="h-32 flex flex-col justify-end">
                <div className="relative w-full h-24 flex items-end">
                  <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between">
                    {bodyMeasurements.length > 0 && [0, 1, 2].map((i) => {
                      const fats = bodyMeasurements.map(m => m.bodyFat || 0).filter(f => f > 0);
                      const maxFat = Math.max(...fats);
                      const minFat = Math.min(...fats);
                      const range = maxFat - minFat;
                      const step = range > 0 ? range / 2 : 1;
                      const value = maxFat - (i * step);
                      
                      return (
                        <div key={i} className="border-t border-border relative">
                          <span className="absolute -top-3 right-0 text-xs text-muted-foreground">
                            {value.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 24">
                    <path 
                      d={bodyMeasurements.length > 1 
                        ? `M${bodyMeasurements.map((m, i) => {
                            const x = (i / (bodyMeasurements.length - 1)) * 100;
                            
                            const fats = bodyMeasurements.map(m => m.bodyFat || 0).filter(f => f > 0);
                            const maxFat = Math.max(...fats);
                            const minFat = Math.min(...fats);
                            const range = maxFat - minFat;
                            
                            // Calculate y position (0 = top, 24 = bottom)
                            let y = 12; // Default to middle if no body fat
                            if (m.bodyFat && range > 0) {
                              y = 24 - (((m.bodyFat - minFat) / range) * 20);
                            }
                            
                            return `${i === 0 ? 'M' : 'L'}${x},${y}`;
                          }).join(' ')}`
                        : '' // Empty if not enough data points
                      }
                      fill="none" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                
                <div className="mt-1 flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    {format(startDate, 'MMM d')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(endDate, 'MMM d')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No body fat data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Nutrition Overview Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Nutrition Overview</h2>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-poppins font-semibold mb-4">Weekly Macro Adherence</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Calories</span>
                  <span className="text-sm text-primary">{adherenceData.calories}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${adherenceData.calories}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Protein</span>
                  <span className="text-sm text-primary">{adherenceData.protein}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${adherenceData.protein}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Carbs</span>
                  <span className="text-sm text-primary">{adherenceData.carbs}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${adherenceData.carbs}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Fats</span>
                  <span className="text-sm text-primary">{adherenceData.fat}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${adherenceData.fat}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Photos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Progress Photos</h2>
          <Button variant="ghost" className="text-primary flex items-center">
            <CameraIcon className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
              <h3 className="font-poppins font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            
            {isLoadingPhotos ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {currentMonthPhotos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={photo.photoUrl} 
                      alt={`Progress ${format(new Date(photo.date), 'MMM d')}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Add photo button */}
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <PlusIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                
                {/* Add placeholder if less than 3 photos */}
                {Array(Math.max(0, 2 - currentMonthPhotos.length)).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg"></div>
                ))}
              </div>
            )}
            
            <Button variant="ghost" className="w-full mt-4 text-primary text-sm">View All Photos</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
