import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { WorkoutProgram } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, { message: "Workout name must be at least 3 characters" }),
  targetMuscleGroups: z.string().min(3, { message: "Please specify target muscle groups" }),
  dayOfWeek: z.coerce.number().min(0).max(6),
  programId: z.coerce.number().positive(),
  order: z.coerce.number().default(0),
});

type FormData = z.infer<typeof formSchema>;

interface CreateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeProgram?: WorkoutProgram;
  defaultDayOfWeek?: number;
}

export function CreateWorkoutDialog({ 
  open, 
  onOpenChange, 
  activeProgram, 
  defaultDayOfWeek = new Date().getDay() 
}: CreateWorkoutDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      targetMuscleGroups: '',
      dayOfWeek: defaultDayOfWeek,
      programId: activeProgram?.id || 0,
      order: 0,
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;
  
  async function onSubmit(data: FormData) {
    if (!activeProgram?.id) {
      toast({
        title: "Error",
        description: "No active program selected",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create workout day
      const response = await apiRequest('POST', `/api/workout-programs/${activeProgram.id}/days`, data);
      const workoutDay = await response.json();
      
      // If successful, invalidate the workout days query cache
      queryClient.invalidateQueries({ queryKey: ['/api/workout-programs', activeProgram.id, 'days'] });
      
      // Close dialog and show success message
      onOpenChange(false);
      toast({
        title: "Success!",
        description: "Workout day has been added to your program.",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error("Error creating workout day:", error);
      toast({
        title: "Error",
        description: "Failed to create workout day. Please try again.",
        variant: "destructive",
      });
    }
  }
  
  const dayOptions = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Workout Day</DialogTitle>
          <DialogDescription>
            Create a new workout day for your program
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Chest Day, Leg Day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetMuscleGroups"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Muscle Groups</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Chest, Triceps, Shoulders" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dayOptions.map((day) => (
                        <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <input type="hidden" {...form.register("programId")} value={activeProgram?.id} />
            
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !activeProgram?.id}>
                {isSubmitting ? "Creating..." : "Add Workout"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}