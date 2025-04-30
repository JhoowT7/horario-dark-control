
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  scheduleType: "5x2" | "6x1" | "Personalizado";
  workDays?: { [key: number]: boolean };
  expectedMinutesPerDay: number;
  workSchedule: {
    entry: string;
    lunchOut: string;
    lunchIn: string;
    exit: string;
  };
  password?: string;
  isAdmin?: boolean;
  lastLoginDate?: string;
  registrationId?: string;
  contractType?: ContractType;
}

export type ContractType = "Efetivado" | "Estagiário";
export type ScheduleType = "5x2" | "6x1" | "Personalizado";
export type WorkDay = { [key: number]: boolean };

export interface TimeEntry {
  date: string;
  employeeId: string;
  entry: string;
  lunchOut: string;
  lunchIn: string;
  exit: string;
  workedMinutes: number;
  balanceMinutes: number;
  isHoliday: boolean;
  isVacation: boolean;
  notes?: string;
}

export interface SystemSettings {
  holidays: string[];
  toleranceMinutes: number;
  maxExtraMinutes: number;
  vacationPeriods: VacationPeriod[];
  transferBalances?: boolean;
}

export interface VacationPeriod {
  employeeId: string;
  startDate: string;
  endDate: string;
}

export interface MonthlyBalance {
  month: string;
  employeeId: string;
  totalBalanceMinutes: number;
}
