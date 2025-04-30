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
  password?: string; // Add password field
  isAdmin?: boolean; // Add admin flag
  lastLoginDate?: string;
}

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
