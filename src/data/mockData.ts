
import { Employee, TimeEntry, SystemSettings } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Mock employees
export const mockEmployees: Employee[] = [
  {
    id: "admin-123",
    name: "Admin",
    email: "admin@empresa.com",
    position: "Administrador",
    expectedMinutesPerDay: 480, // 8 hours
    isAdmin: true,
    password: "admin",
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
      exit: "17:00"
    },
    registrationId: "ADM001", // Registration ID
    contractType: "CLT"
  },
  {
    id: "emp-123",
    name: "João Silva",
    email: "joao.silva@empresa.com",
    position: "Desenvolvedor",
    expectedMinutesPerDay: 480, // 8 hours
    isAdmin: false,
    password: "senha",
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
      exit: "17:00"
    },
    registrationId: "DEV001", // Registration ID
    contractType: "CLT"
  },
  {
    id: "emp-456",
    name: "Maria Santos",
    email: "maria.santos@empresa.com",
    position: "Designer",
    expectedMinutesPerDay: 480, // 8 hours
    isAdmin: false,
    password: "senha",
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
      entry: "09:00",
      lunchOut: "12:30",
      lunchIn: "13:30",
      exit: "18:00"
    },
    registrationId: "DES001", // Registration ID
    contractType: "PJ"
  }
];

// Generate some mock time entries for the current and previous month
export const mockTimeEntries: TimeEntry[] = [];

// Helper to get random minutes (-30 to +30)
const getRandomMinutes = () => Math.floor(Math.random() * 60) - 30;

// Generate dates - 30 days before today, up to today
const today = new Date();
for (let i = 30; i >= 0; i--) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  
  // Skip weekends for 5x2 employees
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) continue;
  
  const dateString = date.toISOString().split('T')[0];
  
  // Add entries for João Silva
  mockTimeEntries.push({
    date: dateString,
    employeeId: "emp-123",
    entry: "08:05",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:00",
    workedMinutes: 475, // 7h55min
    balanceMinutes: -5,
    isHoliday: false,
    isVacation: false,
    notes: ""
  });
  
  // Add entries for Maria Santos
  mockTimeEntries.push({
    date: dateString,
    employeeId: "emp-456",
    entry: "09:00",
    lunchOut: "12:30",
    lunchIn: "13:30",
    exit: "18:15",
    workedMinutes: 495, // 8h15min
    balanceMinutes: 15,
    isHoliday: false,
    isVacation: false,
    notes: ""
  });
}

// Default system settings
export const defaultSettings: SystemSettings = {
  toleranceMinutes: 5,
  maxExtraMinutes: 10,
  holidays: [
    "2025-01-01", // New Year's Day
    "2025-04-18", // Good Friday
    "2025-04-21", // Easter Monday
    "2025-05-01", // Labor Day
    "2025-12-25", // Christmas
    "2025-12-31"  // New Year's Eve
  ],
  vacationPeriods: []
};
