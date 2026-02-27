import { useState, useEffect, useMemo } from "react";
import { Course, ElearningStats } from "../../domain/entities";
import { MockElearningRepository } from "../../infrastructure/repository";

export function useElearning() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<ElearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  const repository = useMemo(() => new MockElearningRepository(), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [coursesData, statsData] = await Promise.all([
        repository.getCourses(),
        repository.getStats(),
      ]);
      setCourses(coursesData);
      setStats(statsData);
      setLoading(false);
    };

    fetchData();
  }, [repository]);

  return {
    courses,
    stats,
    loading,
  };
}
