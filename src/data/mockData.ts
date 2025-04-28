
import { Employee, SystemSettings, TimeEntry } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Mock employees
export const mockEmployees: Employee[] = [
  {
    id: uuidv4(),
    name: "João Silva",
    registrationId: "EMP001",
    position: "Desenvolvedor",
    contractType: "Efetivado",
    scheduleType: "5x2",
    workDays: {
      0: false, // Sunday
      1: true,  // Monday
      2: true,  // Tuesday
      3: true,  // Wednesday
      4: true,  // Thursday
      5: true,  // Friday
      6: false  // Saturday
    },
    workSchedule: {
      entry: "08:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "17:50"
    },
    expectedMinutesPerDay: 530 // 8 hours and 50 minutes
  },
  {
    id: uuidv4(),
    name: "Maria Oliveira",
    registrationId: "EMP002",
    position: "Designer",
    contractType: "Estagiário",
    scheduleType: "6x1",
    workDays: {
      0: false, // Sunday
      1: true,  // Monday
      2: true,  // Tuesday
      3: true,  // Wednesday
      4: true,  // Thursday
      5: true,  // Friday
      6: true   // Saturday
    },
    workSchedule: {
      entry: "09:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "17:00"
    },
    expectedMinutesPerDay: 420 // 7 hours
  }
];

// Default system settings
export const defaultSettings: SystemSettings = {
  toleranceMinutes: 5,
  maxExtraMinutes: 10,
  holidays: [
    "2025-01-01", // New Year's Day
    "2025-04-21", // Tiradentes Day
    "2025-05-01", // Labor Day
    "2025-09-07", // Independence Day
    "2025-10-12", // Our Lady of Aparecida
    "2025-11-02", // All Souls' Day
    "2025-11-15", // Republic Proclamation Day
    "2025-12-25"  // Christmas Day
  ],
  vacationPeriods: []
};

// Mock time entries
export const mockTimeEntries: TimeEntry[] = [
  {
    date: "2025-04-28", // Example: Current date
    employeeId: mockEmployees[0].id,
    entry: "08:05",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:55",
    workedMinutes: 530,
    balanceMinutes: 0,
    isHoliday: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-04-25", // Previous week
    employeeId: mockEmployees[0].id,
    entry: "08:00",
    lunchOut: "12:00",
    lunchIn: "13:10", // Returned 10 min late from lunch
    exit: "18:10", // Stayed 20 min extra to compensate
    workedMinutes: 540,
    balanceMinutes: 10,
    isHoliday: false,
    notes: "Compensação pelo atraso no retorno do almoço"
  }
];
