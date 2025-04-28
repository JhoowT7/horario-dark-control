
import React, { useState, useEffect } from "react";
import { Employee, TimeEntry } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { minutesToTime, generateBalanceMessage } from "@/utils/timeUtils";
import { format, isToday, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimeTrackingSummaryProps {
  employee: Employee;
  onSelectDate: (date: string) => void;
}

const TimeTrackingSummary: React.FC<TimeTrackingSummaryProps> = ({ employee, onSelectDate }) => {
  const { timeEntries, settings } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [totalBalance, setTotalBalance] = useState(0);
  
  // Get employee's time entries
  const employeeEntries = timeEntries.filter((entry) => entry.employeeId === employee.id);
  
  // Calculate total balance from all entries
  useEffect(() => {
    const totalBalanceMinutes = employeeEntries.reduce(
      (sum, entry) => sum + entry.balanceMinutes,
      0
    );
    setTotalBalance(totalBalanceMinutes);
  }, [employeeEntries]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };
  
  // Format the month title
  const formattedMonth = format(currentMonth, "MMMM yyyy", { locale: ptBR });
  
  // Get all days in the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Format date to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };
  
  // Find entry for a specific date
  const getEntryForDate = (date: Date) => {
    return employeeEntries.find((entry) => entry.date === formatDateString(date));
  };
  
  // Determine if a date is a working day for the employee
  const isWorkingDay = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return employee.workDays[dayOfWeek] === true;
  };
  
  // Check if a date is a holiday
  const isHolidayDate = (date: Date) => {
    const dateString = formatDateString(date);
    return settings.holidays.includes(dateString) || employeeEntries.some(
      entry => entry.date === dateString && entry.isHoliday
    );
  };
  
  return (
    <Card className="w-full card-gradient animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">
            {employee.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 ${totalBalance > 0 ? 'bg-positive/10 text-positive' : totalBalance < 0 ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-gray-400'}`}
          >
            {totalBalance === 0 ? (
              <span>Banco de Horas: 00:00</span>
            ) : totalBalance > 0 ? (
              <span className="flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(totalBalance)}
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(totalBalance))}
              </span>
            )}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          {generateBalanceMessage(totalBalance)}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="month">
          <TabsList className="mb-4">
            <TabsTrigger value="month">Visão Mensal</TabsTrigger>
            <TabsTrigger value="list">Lista de Registros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="month" className="space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToPreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium capitalize">{formattedMonth}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                <div key={i} className="py-2 text-sm font-medium text-gray-400">
                  {day}
                </div>
              ))}
              
              {daysInMonth.map((day, i) => {
                const dateStr = formatDateString(day);
                const entry = getEntryForDate(day);
                const isWorkDay = isWorkingDay(day);
                const isHoliday = isHolidayDate(day);
                
                // Determine day styling
                let dayClass = "p-2 rounded-md transition-colors";
                
                if (!isWorkDay && !entry) {
                  dayClass += " text-gray-600 bg-transparent cursor-default";
                } else if (isToday(day)) {
                  dayClass += " border border-cyanBlue/50";
                } else {
                  dayClass += " hover:bg-gray-800 cursor-pointer";
                }
                
                if (isHoliday) {
                  dayClass += " bg-gray-800/50";
                } else if (entry) {
                  if (entry.balanceMinutes > 0) {
                    dayClass += " bg-positive/10";
                  } else if (entry.balanceMinutes < 0) {
                    dayClass += " bg-negative/10";
                  } else {
                    dayClass += " bg-gray-800/30";
                  }
                }
                
                return (
                  <button
                    key={i}
                    className={dayClass}
                    onClick={() => isWorkDay || entry ? onSelectDate(dateStr) : null}
                    disabled={!isWorkDay && !entry}
                  >
                    <div className="text-sm">{format(day, "d")}</div>
                    
                    {entry && (
                      <div className={`text-xs mt-1 ${entry.balanceMinutes > 0 ? 'text-positive' : entry.balanceMinutes < 0 ? 'text-negative' : ''}`}>
                        {entry.balanceMinutes !== 0 && (
                          entry.balanceMinutes > 0 ? "+" : "-"
                        )}
                        {entry.balanceMinutes !== 0 && minutesToTime(Math.abs(entry.balanceMinutes))}
                      </div>
                    )}
                    
                    {isHoliday && (
                      <div className="text-xs mt-1 text-gray-400">
                        Feriado
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-positive/10 mr-1"></div>
                <span className="text-gray-400">Saldo positivo</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-negative/10 mr-1"></div>
                <span className="text-gray-400">Saldo negativo</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-800/50 mr-1"></div>
                <span className="text-gray-400">Feriado</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full border border-cyanBlue/50 mr-1"></div>
                <span className="text-gray-400">Hoje</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            {employeeEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="mx-auto h-8 w-8 opacity-30 mb-2" />
                <p>Nenhum registro de horas encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {employeeEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <button
                      key={entry.date}
                      className="w-full text-left bg-gray-800/40 hover:bg-gray-800/60 p-3 rounded-md transition-colors"
                      onClick={() => onSelectDate(entry.date)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {format(new Date(entry.date), "dd/MM/yyyy")} {entry.isHoliday && "(Feriado)"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {entry.isHoliday ? (
                              "Feriado"
                            ) : entry.entry && entry.exit ? (
                              <>
                                {entry.entry} - {entry.lunchOut || "-"} / {entry.lunchIn || "-"} - {entry.exit}
                              </>
                            ) : (
                              "Ausência"
                            )}
                          </div>
                        </div>
                        <div className={`text-right ${entry.balanceMinutes > 0 ? 'text-positive' : entry.balanceMinutes < 0 ? 'text-negative' : ''}`}>
                          {entry.balanceMinutes === 0 ? (
                            <span>00:00</span>
                          ) : entry.balanceMinutes > 0 ? (
                            <span className="flex items-center">
                              <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(entry.balanceMinutes)}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(entry.balanceMinutes))}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingSummary;
