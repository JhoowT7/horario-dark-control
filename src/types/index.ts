
// Allow existing types
export type ContractType = "CLT" | "PJ";
export type ScheduleType = "5x2" | "6x1" | "Personalizado";

// WorkDays type represents days of the week (0 = Sunday, 6 = Saturday)
export type WorkDay = {
  [key: number]: boolean;
};

// Employee type
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  contractType: ContractType;
  scheduleType: ScheduleType;
  workDays?: WorkDay;
  expectedMinutesPerDay: number;
  workSchedule: {
    entry: string;
    lunchOut: string;
    lunchIn: string;
    exit: string;
  };
  startDate: string;
  registrationId: string;
  password: string;
  isAdmin?: boolean; // Add isAdmin property
}

// Break/interval during work day
export interface WorkBreak {
  id: string;
  exitTime: string;
  returnTime: string;
  reason?: string;
}

// Time entry for daily time tracking
export interface TimeEntry {
  date: string;
  employeeId: string;
  entry: string;
  lunchOut: string;
  lunchIn: string;
  exit: string;
  breaks?: WorkBreak[]; // Additional breaks/exits during the day
  workedMinutes: number;
  balanceMinutes: number;
  isHoliday: boolean;
  isVacation: boolean;
  isAtestado: boolean;
  notes: string;
}

// Document request type
export interface DocumentRequest {
  id: string;
  employeeId: string;
  type: "atestado" | "documento" | "outro";
  title: string;
  description: string;
  date: string;
  createdAt: string;
  status: "pendente" | "aprovado" | "rejeitado";
  files: DocumentFile[];
}

// Document file type
export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  uploadedAt: string;
}

// Monthly balance record
export interface MonthlyBalance {
  month: string; // Format: YYYY-MM
  employeeId: string;
  totalBalanceMinutes: number;
}

// System settings
export interface SystemSettings {
  companyName: string;
  companyLogo: string;
  toleranceMinutes: number;
  maxExtraMinutes: number;
  holidays: string[];
  vacationPeriods: VacationPeriod[];
}

// Vacation period
export interface VacationPeriod {
  employeeId: string;
  startDate: string;
  endDate: string;
}

// User profile for authentication
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  employeeId?: string;
  lastLogin: string;
}
