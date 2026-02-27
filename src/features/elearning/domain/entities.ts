export interface Course {
  id: number;
  name: string;
  category: string;
  enrolled: number;
  completed: number;
  progress: number;
  lastSync: string;
  moodleId: string;
  status: "active" | "completed" | "upcoming";
}

export interface ElearningStats {
  totalCourses: number;
  activeStudents: number;
  completionRate: number;
  certifications: number;
}
