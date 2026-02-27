import { Course, ElearningStats } from "../domain/entities";

const courses: Course[] = [
  {
    id: 1,
    name: "Seguridad en Operaciones de Perforacion",
    category: "Seguridad",
    enrolled: 45,
    completed: 38,
    progress: 84,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-SEC-101",
    status: "active",
  },
  {
    id: 2,
    name: "Manejo de Equipos de Alta Presion",
    category: "Operaciones",
    enrolled: 32,
    completed: 28,
    progress: 87,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-OPS-204",
    status: "active",
  },
  {
    id: 3,
    name: "Certificacion HSE Nivel II",
    category: "Certificaciones",
    enrolled: 60,
    completed: 42,
    progress: 70,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-HSE-302",
    status: "active",
  },
  {
    id: 4,
    name: "Procedimientos de Emergencia en Plataformas",
    category: "Seguridad",
    enrolled: 55,
    completed: 55,
    progress: 100,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-SEC-105",
    status: "completed",
  },
  {
    id: 5,
    name: "Introduccion a Orometria Digital",
    category: "Tecnico",
    enrolled: 20,
    completed: 5,
    progress: 25,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-TEC-110",
    status: "active",
  },
  {
    id: 6,
    name: "Gestion Ambiental en Operaciones Petroleras",
    category: "Ambiental",
    enrolled: 40,
    completed: 0,
    progress: 0,
    lastSync: "Hace 15 min",
    moodleId: "MOODLE-AMB-201",
    status: "upcoming",
  },
];

export interface IElearningRepository {
  getCourses(): Promise<Course[]>;
  getStats(): Promise<ElearningStats>;
}

export class MockElearningRepository implements IElearningRepository {
  async getCourses(): Promise<Course[]> {
    return courses;
  }

  async getStats(): Promise<ElearningStats> {
    return {
      totalCourses: courses.length,
      activeStudents: 152,
      completionRate: 78,
      certifications: 42,
    };
  }
}
