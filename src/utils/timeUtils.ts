// Function to validate time format (HH:MM)
export const isValidTimeFormat = (time: string): boolean => {
  if (!time) return false;
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(time);
};

// Function to format time to HH:MM
export const formatTime = (time: string): string => {
  if (!time) return "";
  
  // If already in correct format, return as is
  if (isValidTimeFormat(time)) return time;
  
  // Remove any non-digit characters
  const digits = time.replace(/\D/g, "");
  
  // Handle different input cases
  if (digits.length === 2) {
    // If only 2 digits (like "08"), format as hours
    const hoursNum = parseInt(digits, 10);
    if (hoursNum <= 23) {
      return `${digits}:00`;
    }
  } else if (digits.length === 3) {
    // If 3 digits (like "130" for 1:30), format properly
    const hours = digits.substring(0, 1);
    const minutes = digits.substring(1, 3);
    
    // Validate hours and minutes
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (hoursNum >= 0 && hoursNum < 24 && minutesNum >= 0 && minutesNum < 60) {
      return `0${hours}:${minutes}`;
    }
  } else if (digits.length === 4) {
    // If 4 digits (like "0830" for 8:30), format properly
    const hours = digits.substring(0, 2);
    const minutes = digits.substring(2, 4);
    
    // Validate hours and minutes
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (hoursNum >= 0 && hoursNum < 24 && minutesNum >= 0 && minutesNum < 60) {
      return `${hours}:${minutes}`;
    }
  }
  
  // If we cannot format, try to insert colon after first 2 digits
  if (digits.length >= 2) {
    return `${digits.substring(0, 2)}:${digits.substring(2)}`;
  }
  
  return time;
};

// Function to convert time string to minutes
export const timeToMinutes = (time: string): number => {
  if (!isValidTimeFormat(time)) return 0;
  
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Function to convert minutes to time string (HH:MM)
export const minutesToTime = (minutes: number): string => {
  if (minutes === 0) return "00:00";
  
  // Handle negative minutes
  const isNegative = minutes < 0;
  const absMinutes = Math.abs(minutes);
  
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMins = mins.toString().padStart(2, "0");
  
  return `${isNegative ? "-" : ""}${formattedHours}:${formattedMins}`;
};

// Break/interval interface for calculation
interface BreakInterval {
  exitTime: string;
  returnTime: string;
}

// Calculate work hours for a day with support for multiple breaks
export const calculateWorkHours = (
  entry: string,
  lunchOut: string,
  lunchIn: string,
  exit: string,
  toleranceMinutes: number = 5,
  additionalBreaks?: BreakInterval[]
): { workMinutes: number; message: string } => {
  // If any field is empty, consider as absence
  if (!entry || !exit) {
    return { workMinutes: 0, message: "Ausência registrada" };
  }
  
  const entryMin = timeToMinutes(entry);
  const exitMin = timeToMinutes(exit);
  
  // Collect all breaks (lunch + additional)
  const allBreaks: { start: number; end: number }[] = [];
  
  // Add lunch break if provided
  if (lunchOut && lunchIn) {
    const lunchOutMin = timeToMinutes(lunchOut);
    const lunchInMin = timeToMinutes(lunchIn);
    
    // Validate lunch times
    if (lunchOutMin <= entryMin || lunchInMin >= exitMin || lunchInMin <= lunchOutMin) {
      return { workMinutes: 0, message: "Horários de almoço inválidos" };
    }
    
    allBreaks.push({ start: lunchOutMin, end: lunchInMin });
  }
  
  // Add additional breaks
  if (additionalBreaks && additionalBreaks.length > 0) {
    for (const breakItem of additionalBreaks) {
      if (breakItem.exitTime && breakItem.returnTime) {
        const breakStart = timeToMinutes(breakItem.exitTime);
        const breakEnd = timeToMinutes(breakItem.returnTime);
        
        // Validate break times
        if (breakStart < entryMin || breakEnd > exitMin || breakEnd <= breakStart) {
          return { workMinutes: 0, message: "Horários de intervalo inválidos" };
        }
        
        allBreaks.push({ start: breakStart, end: breakEnd });
      }
    }
  }
  
  // Sort breaks by start time
  allBreaks.sort((a, b) => a.start - b.start);
  
  // Check for overlapping breaks
  for (let i = 0; i < allBreaks.length - 1; i++) {
    if (allBreaks[i].end > allBreaks[i + 1].start) {
      return { workMinutes: 0, message: "Intervalos sobrepostos detectados" };
    }
  }
  
  // Calculate total break time
  const totalBreakMinutes = allBreaks.reduce((sum, b) => sum + (b.end - b.start), 0);
  
  // Calculate work minutes
  const totalMinutes = exitMin - entryMin;
  const workMinutes = totalMinutes - totalBreakMinutes;
  
  return { workMinutes, message: "OK" };
};

// Calculate balance for a day
export const calculateDayBalance = (
  workMinutes: number,
  expectedMinutes: number,
  toleranceMinutes: number = 5,
  maxExtraMinutes: number = 10
): { balanceMinutes: number; adjusted: boolean } => {
  const difference = workMinutes - expectedMinutes;
  
  // Within tolerance (slight delay)
  if (difference >= -toleranceMinutes && difference < 0) {
    return { balanceMinutes: 0, adjusted: true };
  }
  
  // Limit extra minutes if configured
  if (difference > 0 && difference <= maxExtraMinutes) {
    return { balanceMinutes: 0, adjusted: true };
  }
  
  return { balanceMinutes: difference, adjusted: false };
};

// Generate a helpful message based on the hour balance
export const generateBalanceMessage = (balanceMinutes: number): string => {
  if (balanceMinutes === 0) {
    return "Seus horários estão equilibrados.";
  }
  
  if (balanceMinutes > 0) {
    const hours = Math.floor(balanceMinutes / 60);
    const minutes = balanceMinutes % 60;
    
    if (hours > 0) {
      return `Você possui ${hours}h${minutes > 0 ? ` e ${minutes}min` : ''} de saldo positivo que pode ser utilizado para compensações.`;
    }
    
    return `Você possui ${minutes}min de saldo positivo que pode ser utilizado para compensações.`;
  }
  
  const absMinutes = Math.abs(balanceMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  
  if (hours > 0) {
    return `Você deve ${hours}h${minutes > 0 ? ` e ${minutes}min` : ''}, que pode ser pago realizando hora extra nos próximos dias.`;
  }
  
  return `Você deve ${minutes}min, que pode ser pago realizando hora extra nos próximos dias.`;
};

// Format month string as readable text
export const formatMonthToText = (monthString: string): string => {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

// Calculate work days in a month for an employee based on schedule type
export const calculateWorkDaysInMonth = (
  year: number, 
  month: number, 
  scheduleType: string, 
  customWorkDays?: { [key: number]: boolean }
): number => {
  // First day of month
  const startDate = new Date(year, month, 1);
  // Last day of month
  const endDate = new Date(year, month + 1, 0);
  
  let workDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    if (scheduleType === "5x2") {
      // Monday to Friday
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workDays++;
      }
    } else if (scheduleType === "6x1") {
      // Monday to Saturday
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        workDays++;
      }
    } else if (scheduleType === "Personalizado" && customWorkDays) {
      // Custom work days
      if (customWorkDays[dayOfWeek]) {
        workDays++;
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workDays;
};
