
import React, { createContext, useContext, useState, useEffect } from "react";
import { Employee, SystemSettings, TimeEntry } from "../types";
import { mockEmployees, mockTimeEntries, defaultSettings } from "../data/mockData";
import { toast } from "@/components/ui/sonner";

interface AppContextType {
  employees: Employee[];
  timeEntries: TimeEntry[];
  settings: SystemSettings;
  selectedEmployee: Employee | null;
  selectedDate: string;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage keys
const EMPLOYEES_KEY = "timeTracker_employees";
const TIME_ENTRIES_KEY = "timeTracker_timeEntries";
const SETTINGS_KEY = "timeTracker_settings";

// Helper to format today's date as YYYY-MM-DD
const getTodayFormatted = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
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
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
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
  
  const value = {
    employees,
    timeEntries,
    settings,
    selectedEmployee,
    selectedDate,
    setSelectedEmployee,
    setSelectedDate,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addTimeEntry,
    updateTimeEntry,
    updateSettings,
    addHoliday,
    removeHoliday
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
