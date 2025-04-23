import React from 'react';
import { ProfileSetupForm } from '@/components/auth/ProfileSetupForm';
import { useUser } from '@/hooks/use-user';
import { ProfileSetupForm as ProfileFormType } from '@/lib/types';

export default function ProfileSetup() {
  const { setupProfile, isSettingUpProfile } = useUser();

  const handleProfileSetup = (data: ProfileFormType) => {
    setupProfile(data);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-background to-background/90">
      <div className="flex-1 py-8">
        <ProfileSetupForm 
          onSubmit={handleProfileSetup} 
          isLoading={isSettingUpProfile} 
        />
      </div>
    </div>
  );
}
