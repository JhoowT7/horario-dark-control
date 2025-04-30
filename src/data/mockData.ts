
import { v4 as uuidv4 } from "uuid";
import { Employee, TimeEntry, SystemSettings, ContractType } from "../types";

// Mock employee data
export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@empresa.com",
    phone: "(11) 98765-4321",
    position: "Desenvolvedor",
    department: "TI",
    registrationId: "EMP001",
    contractType: "Efetivado",
    scheduleType: "5x2",
    expectedMinutesPerDay: 480, // 8 horas
    workSchedule: {
      entry: "08:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "17:00",
    },
    isAdmin: true, // Admin user
    password: "admin123"
  },
  {
    id: "2",
    name: "Maria Souza",
    email: "maria.souza@empresa.com",
    phone: "(11) 91234-5678",
    position: "Designer",
    department: "Marketing",
    registrationId: "EMP002",
    contractType: "Efetivado",
    scheduleType: "6x1",
    expectedMinutesPerDay: 420, // 7 horas
    workSchedule: {
      entry: "09:00",
      lunchOut: "12:30",
      lunchIn: "13:30",
      exit: "17:00",
    },
    password: "senha"
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@empresa.com",
    phone: "(11) 97777-8888",
    position: "Contador",
    department: "Financeiro",
    registrationId: "EMP003",
    contractType: "Estagiário",
    scheduleType: "Personalizado",
    workDays: {
      0: false, // Domingo
      1: true,  // Segunda
      2: true,  // Terça
      3: true,  // Quarta
      4: true,  // Quinta
      5: true,  // Sexta
      6: false, // Sábado
    },
    expectedMinutesPerDay: 360, // 6 horas
    workSchedule: {
      entry: "10:00",
      lunchOut: "13:00",
      lunchIn: "14:00",
      exit: "17:00",
    },
    password: "senha"
  },
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
  vacationPeriods: [],
  transferBalances: false
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
    isVacation: false,
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
    isVacation: false,
    notes: "Compensação pelo atraso no retorno do almoço"
  }
];
