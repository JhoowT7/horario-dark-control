
import React, { useState, useEffect } from "react";
import { Employee, TimeEntry } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { generateBalanceMessage } from "@/utils/timeUtils";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, parseISO, isSameMonth
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import component files
import BalanceBadges from "./timeTracking/BalanceBadges";
import CalendarView from "./timeTracking/CalendarView";
import EntriesList from "./timeTracking/EntriesList";
import MissingEntriesList from "./timeTracking/MissingEntriesList";
import MonthSummary from "./timeTracking/MonthSummary";
import { formatDateString, isWorkingDay } from "./timeTracking/DateUtils";

interface TimeTrackingSummaryProps {
  employee: Employee;
  onSelectDate: (date: string) => void;
}

const TimeTrackingSummary: React.FC<TimeTrackingSummaryProps> = ({ employee, onSelectDate }) => {
  const { 
    timeEntries, settings, getCurrentDate, getMonthBalanceForEmployee, 
    getAccumulatedBalance, isDateInVacation, resetMonthBalance
  } = useAppContext();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [previousMonthBalance, setPreviousMonthBalance] = useState(0);
  const [accumulatedBalance, setAccumulatedBalance] = useState(0);
  const [missingEntries, setMissingEntries] = useState<string[]>([]);
  const [monthSummary, setMonthSummary] = useState({
    totalWorkedMinutes: 0,
    totalExpectedMinutes: 0,
    totalWorkingDays: 0,
    filledDays: 0,
  });
  
  // Get current date properly
  const today = new Date();
  
  // Check if current visible month is the actual current month
  const isCurrentMonthVisible = isSameMonth(currentMonth, today);
  
  // Get employee's time entries
  const employeeEntries = timeEntries.filter((entry) => entry.employeeId === employee.id);
  
  // Initialize with the current month
  useEffect(() => {
    // Set current month to today's date
    setCurrentMonth(today);
  }, []);
  
  // Calculate balances and missing entries
  useEffect(() => {
    // Monthly balance
    const monthString = format(currentMonth, "yyyy-MM");
    const monthlyBalanceMinutes = getMonthBalanceForEmployee(employee.id, monthString);
    setMonthlyBalance(monthlyBalanceMinutes);
    
    // Previous month balance
    const prevMonth = subMonths(currentMonth, 1);
    const prevMonthString = format(prevMonth, "yyyy-MM");
    const prevMonthBalance = getMonthBalanceForEmployee(employee.id, prevMonthString);
    setPreviousMonthBalance(prevMonthBalance);
    
    // Total accumulated balance
    const accumulatedBalanceMinutes = getAccumulatedBalance(employee.id);
    setAccumulatedBalance(accumulatedBalanceMinutes);
    
    // Current visible month entries
    const currentMonthEntries = employeeEntries.filter(
      entry => {
        const entryDate = parseISO(entry.date);
        return isSameMonth(entryDate, currentMonth);
      }
    );
    
    const currentMonthBalance = currentMonthEntries.reduce(
      (sum, entry) => sum + entry.balanceMinutes, 0
    );
    
    setTotalBalance(currentMonthBalance);
    
    // Find missing entries
    const daysInThisMonth = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
    
    // Calculate month summary
    let totalWorkedMin = 0;
    let totalExpectedMin = 0;
    let totalWorkDays = 0;
    let filledDays = 0;
    
    const missingDays: string[] = [];
    
    daysInThisMonth.forEach(day => {
      // Skip future days
      if (day > today) return;
      
      // Skip non-working days based on schedule type
      if (!isWorkingDay(day, employee)) return;
      
      // Count as a working day
      totalWorkDays++;
      totalExpectedMin += employee.expectedMinutesPerDay;
      
      // Skip holidays
      if (isHolidayDate(day)) return;
      
      // Skip vacation days
      const dateStr = format(day, "yyyy-MM-dd");
      if (isDateInVacation(employee.id, dateStr)) return;
      
      // Check if entry exists
      const entry = currentMonthEntries.find(entry => entry.date === dateStr);
      
      if (entry) {
        filledDays++;
        totalWorkedMin += entry.workedMinutes;
      } else {
        missingDays.push(dateStr);
      }
    });
    
    // Update states
    setMissingEntries(missingDays);
    setMonthSummary({
      totalWorkedMinutes: totalWorkedMin,
      totalExpectedMinutes: totalExpectedMin,
      totalWorkingDays: totalWorkDays,
      filledDays: filledDays
    });
    
  }, [currentMonth, employeeEntries, employee.id, getMonthBalanceForEmployee, getAccumulatedBalance]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };
  
  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(today);
  };
  
  // Format the month title
  const formattedMonth = format(currentMonth, "MMMM yyyy", { locale: ptBR });
  
  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Find entry for a specific date
  const getEntryForDate = (date: Date) => {
    return employeeEntries.find((entry) => entry.date === formatDateString(date));
  };
  
  // Check if a date is a holiday
  const isHolidayDate = (date: Date) => {
    const dateString = formatDateString(date);
    return settings.holidays.includes(dateString) || employeeEntries.some(
      entry => entry.date === dateString && entry.isHoliday
    );
  };
  
  // Check if a date is within vacation period
  const isVacationDate = (date: Date) => {
    const dateString = formatDateString(date);
    return isDateInVacation(employee.id, dateString) || employeeEntries.some(
      entry => entry.date === dateString && entry.isVacation
    );
  };

  // Handle reset month balance
  const handleResetMonthBalance = () => {
    const monthString = format(currentMonth, "yyyy-MM");
    resetMonthBalance(employee.id, monthString);
  };
  
  return (
    <TooltipProvider>
      <Card className="w-full card-gradient animate-slide-up">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg md:text-xl">
              {employee.name}
            </CardTitle>
            <BalanceBadges 
              previousMonthBalance={previousMonthBalance}
              monthlyBalance={monthlyBalance}
              accumulatedBalance={accumulatedBalance}
            />
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {generateBalanceMessage(accumulatedBalance)}
          </p>
        </CardHeader>
        <CardContent>
          {missingEntries.length > 0 && (
            <Alert variant="destructive" className="mb-4 bg-negative/10 border-negative/20 text-white">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Existem {missingEntries.length} dia(s) sem registro neste mês. Dias não registrados serão contabilizados como ausência.
              </AlertDescription>
            </Alert>
          )}

          <MonthSummary 
            formattedMonth={formattedMonth}
            monthSummary={monthSummary}
            previousMonthBalance={previousMonthBalance}
            monthlyBalance={monthlyBalance}
            accumulatedBalance={accumulatedBalance}
            resetMonthBalance={handleResetMonthBalance}
            isCurrentMonth={isCurrentMonthVisible}
          />
        
          <Tabs defaultValue="month">
            <TabsList className="mb-4">
              <TabsTrigger value="month">Visão Mensal</TabsTrigger>
              <TabsTrigger value="list">Lista de Registros</TabsTrigger>
              <TabsTrigger value="missing">Pendentes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="month">
              <CalendarView 
                currentMonth={currentMonth}
                goToPreviousMonth={goToPreviousMonth}
                goToNextMonth={goToNextMonth}
                goToCurrentMonth={goToCurrentMonth}
                daysInMonth={daysInMonth}
                getEntryForDate={getEntryForDate}
                isWorkingDay={(date) => isWorkingDay(date, employee)}
                isHolidayDate={isHolidayDate}
                isVacationDate={isVacationDate}
                missingEntries={missingEntries}
                formatDateString={formatDateString}
                onSelectDate={onSelectDate}
              />
            </TabsContent>
            
            <TabsContent value="list">
              <EntriesList 
                entries={employeeEntries}
                currentMonth={currentMonth}
                onSelectDate={onSelectDate}
              />
            </TabsContent>
            
            <TabsContent value="missing">
              <MissingEntriesList 
                missingEntries={missingEntries}
                formattedMonth={formattedMonth}
                onSelectDate={onSelectDate}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default TimeTrackingSummary;
