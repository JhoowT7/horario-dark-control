
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
  
  // If we have 4 digits, format as HH:MM
  if (digits.length === 4) {
    const hours = digits.substring(0, 2);
    const minutes = digits.substring(2, 4);
    
    // Validate hours and minutes
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (hoursNum >= 0 && hoursNum < 24 && minutesNum >= 0 && minutesNum < 60) {
      return `${hours}:${minutes}`;
    }
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

// Calculate work hours for a day
export const calculateWorkHours = (
  entry: string,
  lunchOut: string,
  lunchIn: string,
  exit: string,
  toleranceMinutes: number = 5
): { workMinutes: number; message: string } => {
  // If any field is empty, consider as absence
  if (!entry || !exit) {
    return { workMinutes: 0, message: "Ausência registrada" };
  }
  
  let entryMin = timeToMinutes(entry);
  const exitMin = timeToMinutes(exit);
  
  // If lunch times are provided, calculate with lunch break
  if (lunchOut && lunchIn) {
    const lunchOutMin = timeToMinutes(lunchOut);
    const lunchInMin = timeToMinutes(lunchIn);
    
    // Validate lunch times
    if (lunchOutMin <= entryMin || lunchInMin >= exitMin || lunchInMin <= lunchOutMin) {
      return { workMinutes: 0, message: "Horários de almoço inválidos" };
    }
    
    const morningMinutes = lunchOutMin - entryMin;
    const afternoonMinutes = exitMin - lunchInMin;
    return { workMinutes: morningMinutes + afternoonMinutes, message: "OK" };
  }
  
  // Calculate without lunch break
  return { workMinutes: exitMin - entryMin, message: "OK" };
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
