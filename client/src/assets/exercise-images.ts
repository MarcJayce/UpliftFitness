interface ExerciseImage {
  id: string;
  name: string;
  muscleGroup: string;
  url: string;
}

export const exerciseImages: ExerciseImage[] = [
  {
    id: "bench-press",
    name: "Bench Press",
    muscleGroup: "Chest",
    url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "deadlift",
    name: "Deadlift",
    muscleGroup: "Back",
    url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "squat",
    name: "Squat",
    muscleGroup: "Legs",
    url: "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    muscleGroup: "Shoulders",
    url: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "pull-up",
    name: "Pull Up",
    muscleGroup: "Back",
    url: "https://images.unsplash.com/photo-1598971639058-fab03a3f0fb3?auto=format&q=75&fit=crop&w=500"
  },
  {
    id: "dumbbell-curl",
    name: "Dumbbell Curl",
    muscleGroup: "Biceps",
    url: "https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&q=75&fit=crop&w=500"
  }
];

export function getExerciseImageByName(name: string): string {
  const exercise = exerciseImages.find(ex => 
    ex.name.toLowerCase() === name.toLowerCase()
  );
  
  return exercise?.url || exerciseImages[0].url;
}

export function getExerciseImageByMuscleGroup(muscleGroup: string): string {
  const exercise = exerciseImages.find(ex => 
    ex.muscleGroup.toLowerCase() === muscleGroup.toLowerCase()
  );
  
  return exercise?.url || exerciseImages[0].url;
}
