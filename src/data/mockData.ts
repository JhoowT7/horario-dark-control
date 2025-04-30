import { Employee, TimeEntry, SystemSettings } from "@/types";

// Mock data for employees
export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Admin",
    email: "admin@example.com",
    phone: "11 99999-9999",
    position: "Administrador do Sistema",
    department: "TI",
    scheduleType: "5x2",
    workDays: {
      0: false, // Domingo
      1: true,  // Segunda
      2: true,  // Terça
      3: true,  // Quarta
      4: true,  // Quinta
      5: true,  // Sexta
      6: false, // Sábado
    },
    expectedMinutesPerDay: 480, // 8 hours
    workSchedule: {
      entry: "08:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "17:00",
    },
    password: "admin",
    isAdmin: true,
    lastLoginDate: new Date().toISOString().split('T')[0],
    registrationId: "ADMIN001",
    contractType: "Efetivado"
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "11 98888-7777",
    position: "Desenvolvedor",
    department: "TI",
    scheduleType: "5x2",
    workDays: {
      0: false, // Domingo
      1: true,  // Segunda
      2: true,  // Terça
      3: true,  // Quarta
      4: true,  // Quinta
      5: true,  // Sexta
      6: false, // Sábado
    },
    expectedMinutesPerDay: 480, // 8 hours
    workSchedule: {
      entry: "09:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "18:00",
    },
    password: "senha",
    isAdmin: false,
    registrationId: "DEV001",
    contractType: "Efetivado"
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    phone: "11 97777-6666",
    position: "Analista de RH",
    department: "RH",
    scheduleType: "6x1",
    workDays: {
      0: false, // Domingo
      1: true,  // Segunda
      2: true,  // Terça
      3: true,  // Quarta
      4: true,  // Quinta
      5: true,  // Sexta
      6: true  // Sábado
    },
    expectedMinutesPerDay: 480, // 8 hours
    workSchedule: {
      entry: "08:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "17:00",
    },
    isAdmin: false,
    registrationId: "RH001",
    contractType: "Efetivado"
  },
  {
    id: "4",
    name: "Carlos Pereira",
    email: "carlos.pereira@example.com",
    phone: "11 96666-5555",
    position: "Estagiário",
    department: "Marketing",
    scheduleType: "5x2",
    workDays: {
      0: false, // Domingo
      1: true,  // Segunda
      2: true,  // Terça
      3: true,  // Quarta
      4: true,  // Quinta
      5: true,  // Sexta
      6: false // Sábado
    },
    expectedMinutesPerDay: 360, // 6 hours
    workSchedule: {
      entry: "10:00",
      lunchOut: "13:00",
      lunchIn: "14:00",
      exit: "17:00",
    },
    isAdmin: false,
    registrationId: "EST001",
    contractType: "Estagiário"
  },
];

// Mock data for time entries
export const mockTimeEntries: TimeEntry[] = [
  {
    date: "2025-04-01",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-04-02",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-04-15",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-04-03",
    employeeId: "3",
    entry: "08:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-04-01",
    employeeId: "4",
    entry: "10:00",
    lunchOut: "13:00",
    lunchIn: "14:00",
    exit: "17:00",
    workedMinutes: 360,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-05-10",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-05-10",
    employeeId: "3",
    entry: "08:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-05-11",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-05-12",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-05-13",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-05-14",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-06-15",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-06-16",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-06-17",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-06-18",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-06-19",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-07-20",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-07-21",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-07-22",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-07-23",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
  {
    date: "2025-07-24",
    employeeId: "2",
    entry: "09:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "18:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    notes: "Dia normal de trabalho"
  },
];

// Mock system settings
export const defaultSettings: SystemSettings = {
  holidays: ["2024-01-01", "2024-04-21", "2024-05-01", "2024-09-07", "2024-11-15", "2024-12-25"],
  toleranceMinutes: 10,
  maxExtraMinutes: 60,
  vacationPeriods: [],
  transferBalances: false
};
