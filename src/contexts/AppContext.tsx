import React, { createContext, useContext, useState, useEffect } from "react";
import { Employee, SystemSettings, TimeEntry, MonthlyBalance, VacationPeriod } from "../types";
import { mockEmployees, mockTimeEntries, defaultSettings } from "../data/mockData";
import { toast } from "@/components/ui/sonner";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO, isWithinInterval } from "date-fns";

interface AppContextType {
  employees: Employee[];
  timeEntries: TimeEntry[];
  settings: SystemSettings;
  selectedEmployee: Employee | null;
  selectedDate: string;
  monthlyBalances: MonthlyBalance[];
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedDate: (date: string) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
  updateSettings: (settings: SystemSettings) => void;
  addHoliday: (date: string) => void;
  removeHoliday: (date: string) => void;
  addVacationPeriod: (vacationPeriod: VacationPeriod) => void;
  removeVacationPeriod: (employeeId: string, startDate: string) => void;
  getCurrentDate: () => string;
  getMonthBalanceForEmployee: (employeeId: string, month: string) => number;
  getAccumulatedBalance: (employeeId: string) => number;
  isDateInVacation: (employeeId: string, date: string) => boolean;
  resetMonthBalance: (employeeId: string, month: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage keys
const EMPLOYEES_KEY = "timeTracker_employees";
const TIME_ENTRIES_KEY = "timeTracker_timeEntries";
const SETTINGS_KEY = "timeTracker_settings";
const MONTHLY_BALANCES_KEY = "timeTracker_monthlyBalances";

// Helper to format today's date as YYYY-MM-DD
const getTodayFormatted = () => {
  const date = new Date();
  return format(date, "yyyy-MM-dd");
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage or use mock data
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const storedEmployees = localStorage.getItem(EMPLOYEES_KEY);
    return storedEmployees ? JSON.parse(storedEmployees) : mockEmployees;
  });
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const storedEntries = localStorage.getItem(TIME_ENTRIES_KEY);
    return storedEntries ? JSON.parse(storedEntries) : mockTimeEntries;
  });
  
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    const parsedSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    // Make sure vacationPeriods exists
    if (!parsedSettings.vacationPeriods) {
      parsedSettings.vacationPeriods = [];
    }
    return parsedSettings;
  });

  const [monthlyBalances, setMonthlyBalances] = useState<MonthlyBalance[]>(() => {
    const storedBalances = localStorage.getItem(MONTHLY_BALANCES_KEY);
    return storedBalances ? JSON.parse(storedBalances) : [];
  });
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayFormatted());
  
  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  }, [employees]);
  
  useEffect(() => {
    localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(timeEntries));
  }, [timeEntries]);
  
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    localStorage.setItem(MONTHLY_BALANCES_KEY, JSON.stringify(monthlyBalances));
  }, [monthlyBalances]);

  // Calculate monthly balances when time entries change
  useEffect(() => {
    calculateMonthlyBalances();
  }, [timeEntries]);
  
  // Calculate monthly balances for all employees
  const calculateMonthlyBalances = () => {
    const newMonthlyBalances: MonthlyBalance[] = [];
    
    // Get unique employee IDs from time entries
    const employeeIds = [...new Set(timeEntries.map(entry => entry.employeeId))];
    
    // Get unique months from time entries
    const months = [...new Set(timeEntries.map(entry => entry.date.substring(0, 7)))];
    
    // Calculate balance for each employee and month
    employeeIds.forEach(employeeId => {
      months.forEach(month => {
        const entriesForMonth = timeEntries.filter(
          entry => entry.employeeId === employeeId && entry.date.startsWith(month)
        );
        
        const totalBalanceMinutes = entriesForMonth.reduce(
          (sum, entry) => sum + entry.balanceMinutes, 
          0
        );
        
        newMonthlyBalances.push({
          month,
          employeeId,
          totalBalanceMinutes
        });
      });
    });
    
    setMonthlyBalances(newMonthlyBalances);
  };
  
  // Get current computer date - Fixed to ensure it gets the current date properly
  const getCurrentDate = () => {
    const now = new Date();
    return format(now, "yyyy-MM-dd");
  };
  
  // Check if a date is within an employee's vacation period
  const isDateInVacation = (employeeId: string, date: string) => {
    return settings.vacationPeriods.some(
      period => period.employeeId === employeeId && 
                isWithinInterval(parseISO(date), {
                  start: parseISO(period.startDate),
                  end: parseISO(period.endDate)
                })
    );
  };
  
  // Get monthly balance for an employee
  const getMonthBalanceForEmployee = (employeeId: string, month: string) => {
    const monthBalance = monthlyBalances.find(
      balance => balance.employeeId === employeeId && balance.month === month
    );
    
    return monthBalance ? monthBalance.totalBalanceMinutes : 0;
  };
  
  // Get accumulated balance for an employee (all months)
  const getAccumulatedBalance = (employeeId: string) => {
    return monthlyBalances
      .filter(balance => balance.employeeId === employeeId)
      .reduce((sum, balance) => sum + balance.totalBalanceMinutes, 0);
  };
  
  // Reset the monthly balance for an employee
  const resetMonthBalance = (employeeId: string, month: string) => {
    const updatedBalances = monthlyBalances.map(balance => {
      if (balance.employeeId === employeeId && balance.month === month) {
        return { ...balance, totalBalanceMinutes: 0 };
      }
      return balance;
    });
    
    setMonthlyBalances(updatedBalances);
    toast.success("Saldo do mês zerado com sucesso!");
  };
  
  // Employee CRUD operations
  const addEmployee = (employee: Employee) => {
    setEmployees((prev) => [...prev, employee]);
    toast.success("Funcionário adicionado com sucesso!");
  };
  
  const updateEmployee = (employee: Employee) => {
    setEmployees((prev) => 
      prev.map((emp) => (emp.id === employee.id ? employee : emp))
    );
    toast.success("Dados do funcionário atualizados!");
  };
  
  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    // Also remove all time entries for this employee
    setTimeEntries((prev) => prev.filter((entry) => entry.employeeId !== id));
    toast.info("Funcionário removido do sistema");
  };
  
  // Time entry operations
  const addTimeEntry = (entry: TimeEntry) => {
    // Check if entry for this employee and date already exists
    const existingEntryIndex = timeEntries.findIndex(
      (e) => e.employeeId === entry.employeeId && e.date === entry.date
    );
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      setTimeEntries((prev) => [
        ...prev.slice(0, existingEntryIndex),
        entry,
        ...prev.slice(existingEntryIndex + 1)
      ]);
      toast.success("Registro de horas atualizado!");
    } else {
      // Add new entry
      setTimeEntries((prev) => [...prev, entry]);
      toast.success("Registro de horas adicionado!");
    }
  };
  
  const updateTimeEntry = (entry: TimeEntry) => {
    setTimeEntries((prev) =>
      prev.map((e) =>
        e.employeeId === entry.employeeId && e.date === entry.date ? entry : e
      )
    );
    toast.success("Registro de horas atualizado!");
  };
  
  // Settings operations
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
    toast.success("Configurações atualizadas!");
  };
  
  const addHoliday = (date: string) => {
    if (!settings.holidays.includes(date)) {
      setSettings((prev) => ({
        ...prev,
        holidays: [...prev.holidays, date].sort()
      }));
      toast.success(`${date} adicionado como feriado!`);
    }
  };
  
  const removeHoliday = (date: string) => {
    setSettings((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((h) => h !== date)
    }));
    toast.info(`${date} removido dos feriados`);
  };
  
  // Vacation period operations
  const addVacationPeriod = (vacationPeriod: VacationPeriod) => {
    setSettings(prev => ({
      ...prev,
      vacationPeriods: [...prev.vacationPeriods, vacationPeriod]
    }));
    toast.success(`Período de férias adicionado para ${format(parseISO(vacationPeriod.startDate), "dd/MM/yyyy")} até ${format(parseISO(vacationPeriod.endDate), "dd/MM/yyyy")}`);
  };
  
  const removeVacationPeriod = (employeeId: string, startDate: string) => {
    setSettings(prev => ({
      ...prev,
      vacationPeriods: prev.vacationPeriods.filter(
        period => !(period.employeeId === employeeId && period.startDate === startDate)
      )
    }));
    toast.info(`Período de férias removido`);
  };
  
  const value = {
    employees,
    timeEntries,
    settings,
    selectedEmployee,
    selectedDate,
    monthlyBalances,
    setSelectedEmployee,
    setSelectedDate,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addTimeEntry,
    updateTimeEntry,
    updateSettings,
    addHoliday,
    removeHoliday,
    addVacationPeriod,
    removeVacationPeriod,
    getCurrentDate,
    getMonthBalanceForEmployee,
    getAccumulatedBalance,
    isDateInVacation,
    resetMonthBalance
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
