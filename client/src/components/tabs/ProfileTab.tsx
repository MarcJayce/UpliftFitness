import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { BodyMeasurement } from '@/lib/types';
import { TermsDialog } from '@/components/profile/TermsDialog';
import { PrivacyPolicyDialog } from '@/components/profile/PrivacyPolicyDialog';

export function ProfileTab() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const { user, logout, isLoggingOut } = useUser();
  const { toast } = useToast();
  
  // Fetch the most recent body measurement
  const { data: recentMeasurement, isLoading: isLoadingMeasurement, error: measurementError } = useQuery({
    queryKey: ['/api/body-measurements/recent'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/body-measurements/recent');
        const measurements = await res.json() as BodyMeasurement[];
        return measurements.length > 0 ? measurements[0] : null;
      } catch (error) {
        throw new Error('Failed to fetch measurements');
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

  // Calculate progress percentage for goals
  const calculateProgress = (current: number | undefined, target: number | undefined) => {
    if (!current || !target) return 0;
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  // Add error boundary for the component
  try {
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
            ) : measurementError ? (
              <div className="col-span-3 text-destructive">
                Failed to load measurements
              </div>
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
                  style={{ 
                    width: `${calculateProgress(
                      recentMeasurement?.weight, 
                      user?.goal === 'weight-loss' ? user?.weight * 0.9 : user?.goal === 'muscle-gain' ? user?.weight * 1.1 : 0
                    )}%` 
                  }}
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
                  style={{ 
                    width: `${calculateProgress(
                      recentMeasurement?.bodyFat, 
                      user?.goal === 'weight-loss' ? user?.bodyFat * 0.8 : 0
                    )}%` 
                  }}
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
                  style={{ 
                    width: `${calculateProgress(
                      recentMeasurement?.weight, 
                      user?.goal === 'muscle-gain' ? user?.weight * 0.8 : 0
                    )}%` 
                  }}
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
            <Button 
              variant="ghost" 
              className="w-full p-4 text-left flex items-center justify-between"
              onClick={() => setPrivacyOpen(true)}
            >
              <div className="flex items-center">
                <ShieldIcon className="mr-3 h-5 w-5" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </Card>
          
          <Card>
            <Button 
              variant="ghost" 
              className="w-full p-4 text-left flex items-center justify-between"
              onClick={() => setTermsOpen(true)}
            >
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
        <TermsDialog open={termsOpen} onOpenChange={setTermsOpen} />
        <PrivacyPolicyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
      </div>
    );
  } catch (error) {
    console.error('Error in ProfileTab:', error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    );
  }
}

