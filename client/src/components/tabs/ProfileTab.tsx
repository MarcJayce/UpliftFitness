import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  SettingsIcon, 
  MessageCircleIcon, 
  ShieldIcon, 
  InfoIcon, 
  LogOutIcon, 
  ChevronRightIcon
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { BodyMeasurement } from '@/lib/types';

export function ProfileTab() {
  const { user, logout, isLoggingOut } = useUser();
  const { toast } = useToast();
  
  // Fetch the most recent body measurement
  const { data: recentMeasurement, isLoading: isLoadingMeasurement } = useQuery({
    queryKey: ['/api/body-measurements/recent'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/body-measurements/recent');
        const measurements = await res.json() as BodyMeasurement[];
        return measurements.length > 0 ? measurements[0] : null;
      } catch (error) {
        return null;
      }
    }
  });
  
  // Format weight as number with 1 decimal place
  const formatWeight = (weight?: number) => {
    if (!weight) return '--';
    return weight.toFixed(1);
  };
  
  // Format body fat percentage
  const formatBodyFat = (bodyFat?: number) => {
    if (!bodyFat) return '--';
    return bodyFat.toFixed(1) + '%';
  };
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.fullName) return user?.username?.charAt(0).toUpperCase() || 'U';
    
    const names = user.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="pb-20">
      <div className="flex items-center mb-8">
        <Avatar className="h-20 w-20 bg-primary text-primary-foreground text-3xl mr-4">
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-poppins font-semibold">
            {user?.fullName || user?.username || 'User'}
          </h2>
          <p className="text-muted-foreground">
            {user?.goal === 'weight-loss' ? 'Weight Loss' : 
             user?.goal === 'muscle-gain' ? 'Muscle Gain' : 
             user?.goal === 'strength' ? 'Strength' : 
             user?.goal === 'maintenance' ? 'Maintenance' : 
             'Fitness Enthusiast'}
          </p>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-poppins">Personal Stats</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          {isLoadingMeasurement ? (
            <>
              <div>
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <div className="text-muted-foreground text-sm">Weight</div>
              </div>
              <div>
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <div className="text-muted-foreground text-sm">Height</div>
              </div>
              <div>
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <div className="text-muted-foreground text-sm">Body Fat</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-xl font-medium mb-1">
                  {formatWeight(recentMeasurement?.weight || user?.weight)}kg
                </div>
                <div className="text-muted-foreground text-sm">Weight</div>
              </div>
              
              <div>
                <div className="text-xl font-medium mb-1">
                  {user?.height ? `${user.height}cm` : '--'}
                </div>
                <div className="text-muted-foreground text-sm">Height</div>
              </div>
              
              <div>
                <div className="text-xl font-medium mb-1">
                  {formatBodyFat(recentMeasurement?.bodyFat || user?.bodyFat)}
                </div>
                <div className="text-muted-foreground text-sm">Body Fat</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-poppins">Goals & Progress</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Weight Goal</span>
              <span className="text-primary">
                {user?.goal === 'weight-loss' && recentMeasurement?.weight && user?.weight
                  ? `${(user?.weight * 0.9).toFixed(1)}kg (${(recentMeasurement.weight - user.weight * 0.9).toFixed(1)}kg to go)`
                  : user?.goal === 'muscle-gain' && recentMeasurement?.weight && user?.weight
                  ? `${(user?.weight * 1.1).toFixed(1)}kg (${(user.weight * 1.1 - recentMeasurement.weight).toFixed(1)}kg to go)`
                  : '--'}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: '65%' }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Body Fat Goal</span>
              <span className="text-primary">
                {user?.goal === 'weight-loss' && recentMeasurement?.bodyFat && user?.bodyFat
                  ? `${(user?.bodyFat * 0.8).toFixed(1)}% (${(recentMeasurement.bodyFat - user.bodyFat * 0.8).toFixed(1)}% to go)`
                  : '--'}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: '55%' }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Muscle Mass Goal</span>
              <span className="text-primary">
                {user?.goal === 'muscle-gain' && user?.weight
                  ? `${(user?.weight * 0.8).toFixed(1)}kg (3.2kg to go)`
                  : '--'}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: '70%' }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <Card>
          <Button variant="ghost" className="w-full p-4 text-left flex items-center justify-between">
            <div className="flex items-center">
              <SettingsIcon className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </div>
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </Card>
        
        <Card>
          <Button variant="ghost" className="w-full p-4 text-left flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircleIcon className="mr-3 h-5 w-5" />
              <span>Help & Support</span>
            </div>
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </Card>
        
        <Card>
          <Button variant="ghost" className="w-full p-4 text-left flex items-center justify-between">
            <div className="flex items-center">
              <ShieldIcon className="mr-3 h-5 w-5" />
              <span>Privacy Policy</span>
            </div>
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </Card>
        
        <Card>
          <Button variant="ghost" className="w-full p-4 text-left flex items-center justify-between">
            <div className="flex items-center">
              <InfoIcon className="mr-3 h-5 w-5" />
              <span>Terms of Service</span>
            </div>
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </Card>
        
        <Card>
          <Button 
            variant="ghost" 
            className="w-full p-4 text-left flex items-center text-destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOutIcon className="mr-3 h-5 w-5" />
            <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </Button>
        </Card>
      </div>
    </div>
  );
}
