// Import necessary types
import { v4 as uuidv4 } from "uuid";
import { Employee, TimeEntry, SystemSettings, WorkDay, ContractType, ScheduleType, VacationPeriod, UserProfile } from "../types";

// Fix the contract type error by ensuring we use the correct contract types
export const mockEmployees: Employee[] = [
  {
    id: "e001",
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "(11) 98765-4321",
    department: "Desenvolvimento",
    position: "Desenvolvedor Full-Stack",
    contractType: "CLT" as ContractType,
    scheduleType: "5x2" as ScheduleType,
    workDays: {
      0: false, // Sunday
      1: true,  // Monday
      2: true,  // Tuesday
      3: true,  // Wednesday
      4: true,  // Thursday
      5: true,  // Friday
      6: false  // Saturday
    },
    expectedMinutesPerDay: 480, // 8 hours
    workSchedule: {
      entry: "08:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "17:00"
    },
    startDate: "2023-01-15",
    registrationId: "12345",
    password: "senha",
    isAdmin: false
  },
  {
    id: "e002",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    phone: "(11) 91234-5678",
    department: "Recursos Humanos",
    position: "Gerente de RH",
    contractType: "CLT" as ContractType,
    scheduleType: "5x2" as ScheduleType,
    workDays: {
      0: false, // Sunday
      1: true,  // Monday
      2: true,  // Tuesday
      3: true,  // Wednesday
      4: true,  // Thursday
      5: true,  // Friday
      6: false  // Saturday
    },
    expectedMinutesPerDay: 480, // 8 hours
    workSchedule: {
      entry: "09:00",
      lunchOut: "12:30",
      lunchIn: "13:30",
      exit: "18:00"
    },
    startDate: "2022-03-10",
    registrationId: "23456",
    password: "senha",
    isAdmin: false
  },
  {
    id: "e003",
    name: "Pedro Santos",
    email: "pedro.santos@example.com",
    phone: "(11) 98877-6655",
    department: "Marketing",
    position: "Designer Gráfico",
    contractType: "PJ" as ContractType,
    scheduleType: "Personalizado" as ScheduleType,
    workDays: {
      0: false, // Sunday
      1: true,  // Monday
      2: false, // Tuesday
      3: true,  // Wednesday
      4: false, // Thursday
      5: true,  // Friday
      6: false  // Saturday
    },
    expectedMinutesPerDay: 420, // 7 hours
    workSchedule: {
      entry: "10:00",
      lunchOut: "13:00",
      lunchIn: "14:00",
      exit: "18:00"
    },
    startDate: "2023-05-22",
    registrationId: "34567",
    password: "senha",
    isAdmin: false
  },
  {
    id: "admin",
    name: "Administrador",
    email: "admin@example.com",
    phone: "(11) 99999-9999",
    department: "Administração",
    position: "Administrador do Sistema",
    contractType: "CLT" as ContractType,
    scheduleType: "5x2" as ScheduleType,
    workDays: {
      0: false, // Sunday
      1: true,  // Monday
      2: true,  // Tuesday
      3: true,  // Wednesday
      4: true,  // Thursday
      5: true,  // Friday
      6: false  // Saturday
    },
    expectedMinutesPerDay: 480, // 8 hours
    workSchedule: {
      entry: "08:00",
      lunchOut: "12:00",
      lunchIn: "13:00",
      exit: "17:00"
    },
    startDate: "2022-01-01",
    registrationId: "00000",
    password: "admin",
    isAdmin: true
  }
];

// Fix the TimeEntry type
export const mockTimeEntries: TimeEntry[] = [
  {
    date: "2023-09-11",
    employeeId: "e001",
    entry: "08:05",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:10",
    workedMinutes: 485,
    balanceMinutes: 5,
    isHoliday: false,
    isVacation: false,
    isAtestado: false,
    notes: ""
  },
  {
    date: "2023-09-12",
    employeeId: "e001",
    entry: "08:00",
    lunchOut: "12:00",
    lunchIn: "13:00",
    exit: "17:00",
    workedMinutes: 480,
    balanceMinutes: 0,
    isHoliday: false,
    isVacation: false,
    isAtestado: false,
    notes: ""
  }
];

// Default system settings
export const defaultSettings: SystemSettings = {
  companyName: "Ejemplo Tecnologia",
  companyLogo: "",
  toleranceMinutes: 10,
  maxExtraMinutes: 20,
  holidays: [
    "2023-01-01", // Ano Novo
    "2023-04-07", // Sexta-feira Santa
    "2023-04-21", // Tiradentes
    "2023-05-01", // Dia do Trabalho
    "2023-09-07", // Independência do Brasil
    "2023-10-12", // Nossa Senhora Aparecida
    "2023-11-02", // Finados
    "2023-11-15", // Proclamação da República
    "2023-12-25"  // Natal
  ],
  vacationPeriods: [
    {
      employeeId: "e001",
      startDate: "2023-07-10",
      endDate: "2023-07-21"
    }
  ]
};

// Add user profiles data with admin user
export const mockUsers: UserProfile[] = [
  {
    id: "admin",
    name: "Administrator",
    username: "admin",
    email: "admin@example.com",
    password: "admin",
    role: "admin",
    employeeId: "admin",
    lastLogin: "2023-09-01T10:00:00Z"
  },
  {
    id: "e001",
    name: "João Silva",
    username: "joao.silva",
    email: "joao.silva@example.com",
    password: "senha",
    role: "user",
    employeeId: "e001", 
    lastLogin: "2023-09-10T14:30:00Z"
  },
  {
    id: "e002",
    name: "Maria Oliveira",
    username: "maria.oliveira",
    email: "maria.oliveira@example.com",
    password: "senha",
    role: "user",
    employeeId: "e002",
    lastLogin: "2023-09-09T11:15:00Z"
  },
  {
    id: "e003",
    name: "Pedro Santos",
    username: "pedro.santos",
    email: "pedro.santos@example.com",
    password: "senha",
    role: "user",
    employeeId: "e003",
    lastLogin: "2023-09-08T09:45:00Z"
  }
];
