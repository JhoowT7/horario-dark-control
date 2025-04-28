
import { ContractType, Employee, ScheduleType, SystemSettings, TimeEntry } from "../types";

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Create some mock employees
export const mockEmployees: Employee[] = [
  {
    id: generateId(),
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
    expectedMinutesPerDay: 8 * 60 - 10 // 8 hours - 10 minutes (7h50m)
  },
  {
    id: generateId(),
    name: "Maria Oliveira",
    registrationId: "EMP002",
    position: "Designer",
    contractType: "Efetivado",
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
      exit: "18:00"
    },
    expectedMinutesPerDay: 8 * 60 // 8 hours
  },
  {
    id: generateId(),
    name: "Pedro Santos",
    registrationId: "EST001",
    position: "Estagiário de Marketing",
    contractType: "Estagiário",
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
      entry: "10:00",
      lunchOut: "13:00",
      lunchIn: "14:00",
      exit: "17:00"
    },
    expectedMinutesPerDay: 6 * 60 // 6 hours
  }
];

// Create mock time entries
export const mockTimeEntries: TimeEntry[] = [
  {
    date: "2024-04-25",
    employeeId: mockEmployees[0].id,
    entry: "08:05",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:55",
    workedMinutes: 7 * 60 + 50, // 7h50m
    balanceMinutes: 0,
    isHoliday: false
  },
  {
    date: "2024-04-26",
    employeeId: mockEmployees[0].id,
    entry: "08:10",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:30",
    workedMinutes: 7 * 60 + 20, // 7h20m
    balanceMinutes: -20,
    isHoliday: false
  },
  {
    date: "2024-04-25",
    employeeId: mockEmployees[1].id,
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:30",
    workedMinutes: 8 * 60 + 30, // 8h30m
    balanceMinutes: 30,
    isHoliday: false
  }
];

// Default system settings
export const defaultSettings: SystemSettings = {
  toleranceMinutes: 5,
  maxExtraMinutes: 10,
  holidays: ["2024-05-01", "2024-09-07", "2024-12-25"]
};
