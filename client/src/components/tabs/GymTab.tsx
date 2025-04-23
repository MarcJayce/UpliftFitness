import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, ChevronRightIcon, BoltIcon, DumbbellIcon, TimerIcon } from 'lucide-react';
import { exerciseImages } from '@/assets/exercise-images';
import { apiRequest } from '@/lib/queryClient';
import { Exercise, WorkoutProgram, WorkoutDay } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateProgramDialog } from '@/components/gym/CreateProgramDialog';

export function GymTab() {
  // State for CreateProgramDialog
  const [createProgramDialogOpen, setCreateProgramDialogOpen] = useState(false);
  
  // Fetch exercises
  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['/api/exercises'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/exercises');
      return await res.json() as Exercise[];
    }
  });

  // Fetch user's workout programs
  const { data: programs, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['/api/workout-programs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/workout-programs');
      return await res.json() as WorkoutProgram[];
    }
  });

  // Get current program if there's an active one
  const activeProgram = programs?.find(program => program.active);

  // Fetch workout days for active program if exists
  const { data: workoutDays, isLoading: isLoadingDays } = useQuery({
    queryKey: ['/api/workout-programs', activeProgram?.id, 'days'],
    queryFn: async () => {
      if (!activeProgram) return [];
      const res = await apiRequest('GET', `/api/workout-programs/${activeProgram.id}/days`);
      return await res.json() as WorkoutDay[];
    },
    enabled: !!activeProgram
  });

  // Get today's workout based on day of week
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const todaysWorkout = workoutDays?.find(day => day.dayOfWeek === today);

  // Sample preset programs data
  const presetPrograms = [
    {
      name: "Full Body Workout",
      description: "3 days/week • Beginner",
      icon: <BoltIcon className="text-black" />,
    },
    {
      name: "Push Pull Legs",
      description: "6 days/week • Intermediate",
      icon: <DumbbellIcon className="text-black" />,
    },
    {
      name: "HIIT Challenge",
      description: "4 days/week • All levels",
      icon: <TimerIcon className="text-black" />,
    }
  ];

  // Day name array for displaying workout schedule
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="pb-20">
      {/* Today's Workout Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Today's Workout</h2>
          <Button variant="ghost" className="text-primary flex items-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {isLoadingDays ? (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>
        ) : todaysWorkout ? (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-poppins font-semibold text-lg">{todaysWorkout.name}</h3>
                  <p className="text-muted-foreground text-sm">{todaysWorkout.targetMuscleGroups}</p>
                </div>
                <Button>Start</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-poppins font-semibold text-lg">Rest Day</h3>
                  <p className="text-muted-foreground text-sm">No workout scheduled for today</p>
                </div>
                <Button variant="outline">Add Workout</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Current Program */}
        <Card>
          <div className="p-4 border-b border-border">
            <h3 className="font-poppins font-semibold">Current Program</h3>
          </div>
          
          {isLoadingPrograms ? (
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Skeleton className="w-12 h-12 rounded-lg mr-3" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              
              <div className="flex gap-2">
                {Array(7).fill(0).map((_, index) => (
                  <div key={index} className="flex-1 text-center">
                    <Skeleton className="w-8 h-8 mb-1 rounded-full mx-auto" />
                    <Skeleton className="h-3 w-8 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          ) : activeProgram ? (
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/80 flex items-center justify-center mr-3">
                    <DumbbellIcon className="text-black" />
                  </div>
                  <div>
                    <h4 className="font-medium">{activeProgram.name}</h4>
                    <p className="text-muted-foreground text-sm">
                      {activeProgram.frequency} days/week
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  {activeProgram.level}
                </span>
              </div>
              
              <div className="flex gap-2">
                {weekdays.map((day, i) => {
                  const dayProgram = workoutDays?.find(wd => wd.dayOfWeek === i);
                  const isToday = i === today;
                  
                  return (
                    <div key={i} className="flex-1 text-center">
                      <div className={`w-8 h-8 mb-1 rounded-full flex items-center justify-center mx-auto font-medium ${
                        isToday 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {day}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {dayProgram?.name?.split(' ')[0] || 'Rest'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-4">
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No active program</p>
                <Button variant="outline" onClick={() => setCreateProgramDialogOpen(true)}>Create Program</Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      
      {/* Create Program Dialog */}
      <CreateProgramDialog
        open={createProgramDialogOpen}
        onOpenChange={setCreateProgramDialogOpen}
      />
      
      {/* Exercise Library Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Exercise Library</h2>
          <Button variant="link" className="text-muted-foreground">See all</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {isLoadingExercises ? (
            Array(4).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden transition duration-300 hover:-translate-y-1">
                <div className="h-32 bg-muted relative">
                  <Skeleton className="w-full h-full" />
                </div>
              </Card>
            ))
          ) : (
            exercises?.slice(0, 4).map((exercise) => (
              <Card 
                key={exercise.id}
                className="overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="h-32 bg-muted relative">
                  <img 
                    src={exercise.imageUrl || exerciseImages[exercise.id % exerciseImages.length].url} 
                    alt={exercise.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-2">
                    <p className="font-medium text-sm">{exercise.name}</p>
                    <p className="text-muted-foreground text-xs">{exercise.muscleGroup}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Preset Programs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-poppins font-semibold">Preset Programs</h2>
          <Button variant="link" className="text-muted-foreground">Browse</Button>
        </div>
        
        <div className="space-y-4">
          {presetPrograms.map((program, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center">
                <div className="w-12 h-12 rounded-lg bg-primary/80 flex items-center justify-center mr-3">
                  {program.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{program.name}</h3>
                  <p className="text-muted-foreground text-sm">{program.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-primary">
                  <ChevronRightIcon />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
