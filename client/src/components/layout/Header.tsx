import React from 'react';
import { format } from 'date-fns';
import { BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-user';

export function Header() {
  const { user } = useUser();
  const currentDate = new Date();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  // Format date as "Weekday, Month Day"
  const formattedDate = format(currentDate, 'EEEE, MMMM d');
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.fullName) return user?.username?.charAt(0).toUpperCase() || 'U';
    
    const names = user.fullName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <header className="p-6 pb-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-poppins font-semibold text-primary">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || user?.username || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-background/20 backdrop-blur-sm">
            <BellIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
