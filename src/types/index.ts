
export type ContractType = "Efetivado" | "Estagiário";

export type ScheduleType = "5x2" | "6x1" | "Personalizado";

export interface WorkSchedule {
  entry: string; // Format HH:MM
  lunchOut: string; // Format HH:MM
  lunchIn: string; // Format HH:MM
  exit: string; // Format HH:MM
}

export type WorkDay = {
  [key: number]: boolean; // 0 = Sunday, 1 = Monday, etc.
};

export interface Employee {
  id: string;
  name: string;
  registrationId: string;
  position: string;
  contractType: ContractType;
  scheduleType: ScheduleType;
  workDays: WorkDay;
  workSchedule: WorkSchedule;
  expectedMinutesPerDay: number;
}

export interface TimeEntry {
  date: string; // YYYY-MM-DD
  employeeId: string;
  entry: string;
  lunchOut: string;
  lunchIn: string;
  exit: string;
  workedMinutes: number;
  balanceMinutes: number;
  isHoliday: boolean;
  notes?: string;
}

export interface SystemSettings {
  toleranceMinutes: number;
  maxExtraMinutes: number;
  holidays: string[]; // Array of dates in format YYYY-MM-DD
}

export interface MonthlyBalance {
  month: string; // YYYY-MM format
  employeeId: string;
  totalBalanceMinutes: number;
}
