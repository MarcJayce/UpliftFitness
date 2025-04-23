import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProfileSetupForm as ProfileFormType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  age: z.number().min(13, { message: 'You must be at least 13 years old' }).max(120),
  gender: z.string().min(1, { message: 'Please select your gender' }),
  height: z.number().min(50, { message: 'Height must be at least 50cm' }).max(300),
  weight: z.number().min(30, { message: 'Weight must be at least 30kg' }).max(300),
  goal: z.string().min(1, { message: 'Please select your primary goal' }),
  activityLevel: z.string().min(1, { message: 'Please select your activity level' }),
  units: z.string().default('metric'),
  notifications: z.boolean().default(true),
});

interface ProfileSetupFormProps {
  onSubmit: (data: ProfileFormType) => void;
  isLoading: boolean;
}

export function ProfileSetupForm({ onSubmit, isLoading }: ProfileSetupFormProps) {
  const form = useForm<ProfileFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      age: undefined,
      gender: '',
      height: undefined,
      weight: undefined,
      goal: '',
      activityLevel: '',
      units: 'metric',
      notifications: true,
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-poppins mb-2">Complete Your Profile</h1>
      <p className="text-muted-foreground mb-6">We need some info to personalize your experience</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-background/80 backdrop-blur-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-xl font-poppins">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your full name" 
                        {...field} 
                        className="bg-background/50 border-border/50 focus:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="25" 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                          className="bg-background/50 border-border/50 focus:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="175" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                            className="bg-background/50 border-border/50 focus:border-primary rounded-r-none"
                          />
                        </FormControl>
                        <span className="bg-muted text-muted-foreground px-3 py-2 border border-l-0 border-border/50 rounded-r-md flex items-center">
                          cm
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="70" 
                            step="0.1"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                            className="bg-background/50 border-border/50 focus:border-primary rounded-r-none"
                          />
                        </FormControl>
                        <span className="bg-muted text-muted-foreground px-3 py-2 border border-l-0 border-border/50 rounded-r-md flex items-center">
                          kg
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/80 backdrop-blur-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-xl font-poppins">Fitness Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Primary Goal</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-3"
                      >
                        <Label
                          htmlFor="weight-loss"
                          className="relative bg-muted rounded-lg p-4 border border-border cursor-pointer transition hover:border-primary-light flex flex-col items-center"
                        >
                          <RadioGroupItem value="weight-loss" id="weight-loss" className="sr-only" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-primary">
                            <path d="M23 18l-3-3-3 3"></path>
                            <path d="M1 6l3 3 3-3"></path>
                            <path d="m16 15-4-8-4 8"></path>
                            <path d="M4 9v9"></path>
                            <path d="M20 6v9"></path>
                          </svg>
                          <span className="font-medium">Weight Loss</span>
                        </Label>
                        
                        <Label
                          htmlFor="muscle-gain"
                          className="relative bg-muted rounded-lg p-4 border border-border cursor-pointer transition hover:border-primary-light flex flex-col items-center"
                        >
                          <RadioGroupItem value="muscle-gain" id="muscle-gain" className="sr-only" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-primary">
                            <path d="M6 18L18 6"></path>
                            <path d="m9 6 9 9"></path>
                            <path d="M6 12h12"></path>
                          </svg>
                          <span className="font-medium">Muscle Gain</span>
                        </Label>
                        
                        <Label
                          htmlFor="strength"
                          className="relative bg-muted rounded-lg p-4 border border-border cursor-pointer transition hover:border-primary-light flex flex-col items-center"
                        >
                          <RadioGroupItem value="strength" id="strength" className="sr-only" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-primary">
                            <path d="M9 6 6 9H2l9 9 9-9h-4l-3-3z"></path>
                            <path d="m13 14 4 4"></path>
                            <path d="M7 18 5 20"></path>
                            <path d="m19 4-1 1"></path>
                          </svg>
                          <span className="font-medium">Strength</span>
                        </Label>
                        
                        <Label
                          htmlFor="maintenance"
                          className="relative bg-muted rounded-lg p-4 border border-border cursor-pointer transition hover:border-primary-light flex flex-col items-center"
                        >
                          <RadioGroupItem value="maintenance" id="maintenance" className="sr-only" />
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1 text-primary">
                            <rect width="16" height="16" x="4" y="4" rx="2"></rect>
                            <path d="m9 9 6 6"></path>
                            <path d="m15 9-6 6"></path>
                          </svg>
                          <span className="font-medium">Maintenance</span>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select your activity level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                        <SelectItem value="light">Lightly active (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderately active (3-5 days/week)</SelectItem>
                        <SelectItem value="very">Very active (6-7 days/week)</SelectItem>
                        <SelectItem value="extreme">Extremely active (2x per day)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card className="bg-background/80 backdrop-blur-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-xl font-poppins">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Units</FormLabel>
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem className="flex gap-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <Label
                            htmlFor="metric"
                            className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
                              field.value === 'metric' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <RadioGroupItem value="metric" id="metric" className="sr-only" />
                            Metric
                          </Label>
                          <Label
                            htmlFor="imperial"
                            className={`px-3 py-1 rounded-md font-medium cursor-pointer ${
                              field.value === 'imperial' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <RadioGroupItem value="imperial" id="imperial" className="sr-only" />
                            Imperial
                          </Label>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <FormLabel>Notifications</FormLabel>
                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground font-medium py-6"
            disabled={isLoading}
          >
            {isLoading ? "Saving Profile..." : "Complete Setup"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
