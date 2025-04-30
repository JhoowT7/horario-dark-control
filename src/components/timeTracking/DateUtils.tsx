
import { format, parseISO, isWithinInterval, getDay } from "date-fns";
import { Employee } from "@/types";

// Format date to YYYY-MM-DD without timezone adjustments
export const formatDateString = (date: Date): string => {
  // Using direct string manipulation to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Determine if a date is a working day for the employee
export const isWorkingDay = (date: Date, employee: Employee): boolean => {
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = getDay(date);
  
  // For 5x2 schedule - work days are Monday (1) to Friday (5)
  // Weekend days are Saturday (6) and Sunday (0)
  if (employee.scheduleType === "5x2") {
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday only
  }
  
  // For 6x1 schedule - only Sunday (0) is a non-working day
  if (employee.scheduleType === "6x1") {
    return dayOfWeek !== 0; // All days except Sunday
  }
  
  // For custom schedule, check the employee's workDays
  if (employee.scheduleType === "Personalizado") {
    return employee.workDays[dayOfWeek] === true;
  }
  
  return false;
};
