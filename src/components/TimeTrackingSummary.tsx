
import React, { useState, useEffect } from "react";
import { Employee, TimeEntry } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, 
  Info, AlertCircle, CheckCircle, Calendar as CalendarCheck, 
  Palmtree, Clock, FileText, Trash, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { minutesToTime, generateBalanceMessage } from "@/utils/timeUtils";
import { 
  format, isToday, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, getMonth, getYear, parseISO, isSameMonth,
  isWithinInterval, isWeekend, getDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [monthSummary, setMonthSummary] = useState({
    totalWorkedMinutes: 0,
    totalExpectedMinutes: 0,
    totalWorkingDays: 0,
    filledDays: 0,
  });
  
  // Get current date properly
  const today = new Date();
  
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
      if (!isWorkingDay(day)) return;
      
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
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = getDay(date);
    
    // For 5x2 schedule - work days are Monday (1) to Friday (5)
    if (employee.scheduleType === "5x2") {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    
    // For 6x1 schedule - only Sunday (0) is a non-working day
    if (employee.scheduleType === "6x1") {
      return dayOfWeek !== 0;
    }
    
    // For custom schedule, check the employee's workDays
    return employee.workDays[dayOfWeek] === true;
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
    setShowResetDialog(false);
  };
  
  return (
    <Card className="w-full card-gradient animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl">
            {employee.name}
          </CardTitle>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 ${previousMonthBalance > 0 ? 'bg-positive/10 text-positive' : previousMonthBalance < 0 ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-gray-400'}`}
                >
                  <span className="flex items-center">
                    Ant: {previousMonthBalance === 0 ? (
                      <span>00:00</span>
                    ) : previousMonthBalance > 0 ? (
                      <span className="flex items-center">
                        <ArrowUp className="h-4 w-4 ml-1 mr-1" /> {minutesToTime(previousMonthBalance)}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <ArrowDown className="h-4 w-4 ml-1 mr-1" /> {minutesToTime(Math.abs(previousMonthBalance))}
                      </span>
                    )}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saldo do mês anterior</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 ${monthlyBalance > 0 ? 'bg-positive/10 text-positive' : monthlyBalance < 0 ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-gray-400'}`}
                >
                  {monthlyBalance === 0 ? (
                    <span>Mês: 00:00</span>
                  ) : monthlyBalance > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(monthlyBalance)}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(monthlyBalance))}
                    </span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saldo do mês atual</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className={`px-3 py-1 ${accumulatedBalance > 0 ? 'bg-positive/10 text-positive' : accumulatedBalance < 0 ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-gray-400'}`}
                >
                  {accumulatedBalance === 0 ? (
                    <span>Acumulado: 00:00</span>
                  ) : accumulatedBalance > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(accumulatedBalance)}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(accumulatedBalance))}
                    </span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saldo acumulado de todos os meses</p>
              </TooltipContent>
            </Tooltip>
          </div>
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

        {/* Monthly Summary Card */}
        <Card className="mb-4 bg-gray-800/50 border-none">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Resumo do Mês: {formattedMonth}
              </h3>
              <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-8">
                    <Trash className="h-4 w-4 mr-1" /> Zerar Saldo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar reinicialização</DialogTitle>
                    <DialogDescription>
                      Tem certeza que deseja zerar o saldo do mês atual? Esta ação não pode ser desfeita.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleResetMonthBalance}>
                      Confirmar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Dias úteis:</div>
                <div className="text-lg font-medium">{monthSummary.totalWorkingDays} dias</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Dias registrados:</div>
                <div className="text-lg font-medium">{monthSummary.filledDays} de {monthSummary.totalWorkingDays}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Horas trabalhadas:</div>
                <div className="text-lg font-medium">{minutesToTime(monthSummary.totalWorkedMinutes)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-400">Horas esperadas:</div>
                <div className="text-lg font-medium">{minutesToTime(monthSummary.totalExpectedMinutes)}</div>
              </div>
              
              <div className="col-span-2 pt-2 border-t border-gray-700">
                <div className="text-sm text-gray-400">Saldo anterior:</div>
                <div className={`text-lg font-medium flex items-center ${previousMonthBalance > 0 ? 'text-positive' : previousMonthBalance < 0 ? 'text-negative' : ''}`}>
                  {previousMonthBalance === 0 ? (
                    <span>00:00</span>
                  ) : previousMonthBalance > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp className="h-5 w-5 mr-1" /> {minutesToTime(previousMonthBalance)}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ArrowDown className="h-5 w-5 mr-1" /> {minutesToTime(Math.abs(previousMonthBalance))}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="col-span-2 pt-2 border-t border-gray-700">
                <div className="text-sm text-gray-400">Saldo do mês:</div>
                <div className={`text-lg font-medium flex items-center ${monthlyBalance > 0 ? 'text-positive' : monthlyBalance < 0 ? 'text-negative' : ''}`}>
                  {monthlyBalance === 0 ? (
                    <span>00:00</span>
                  ) : monthlyBalance > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp className="h-5 w-5 mr-1" /> {minutesToTime(monthlyBalance)}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ArrowDown className="h-5 w-5 mr-1" /> {minutesToTime(Math.abs(monthlyBalance))}
                    </span>
                  )}
                  <span className="text-sm text-gray-400 ml-2">({monthlyBalance > 0 ? 'positivo' : monthlyBalance < 0 ? 'negativo' : 'neutro'})</span>
                </div>
              </div>
              
              <div className="col-span-2 pt-2 border-t border-gray-700">
                <div className="text-sm text-gray-400">Saldo acumulado:</div>
                <div className={`text-lg font-medium flex items-center ${accumulatedBalance > 0 ? 'text-positive' : accumulatedBalance < 0 ? 'text-negative' : ''}`}>
                  {accumulatedBalance === 0 ? (
                    <span>00:00</span>
                  ) : accumulatedBalance > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp className="h-5 w-5 mr-1" /> {minutesToTime(accumulatedBalance)}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ArrowDown className="h-5 w-5 mr-1" /> {minutesToTime(Math.abs(accumulatedBalance))}
                    </span>
                  )}
                  <span className="text-sm text-gray-400 ml-2">({accumulatedBalance > 0 ? 'positivo' : accumulatedBalance < 0 ? 'negativo' : 'neutro'})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        <Tabs defaultValue="month">
          <TabsList className="mb-4">
            <TabsTrigger value="month">Visão Mensal</TabsTrigger>
            <TabsTrigger value="list">Lista de Registros</TabsTrigger>
            <TabsTrigger value="missing">Pendentes</TabsTrigger>
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
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium capitalize">{formattedMonth}</h3>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={goToCurrentMonth} 
                  className="text-xs text-gray-400"
                >
                  Ir para mês atual
                </Button>
              </div>
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
                const isVacation = isVacationDate(day);
                const isMissingEntry = missingEntries.includes(dateStr);
                
                // Determine day styling
                let dayClass = "p-2 rounded-md transition-colors";
                
                if (!isWorkDay) {
                  dayClass += " text-gray-600 bg-transparent cursor-default";
                } else if (isToday(day)) {
                  dayClass += " border border-cyanBlue/50";
                } else {
                  dayClass += " hover:bg-gray-800 cursor-pointer";
                }
                
                if (isVacation) {
                  dayClass += " bg-cyanBlue/10";
                } else if (isHoliday) {
                  dayClass += " bg-gray-800/50";
                } else if (entry) {
                  if (entry.balanceMinutes > 0) {
                    dayClass += " bg-positive/10";
                  } else if (entry.balanceMinutes < 0) {
                    dayClass += " bg-negative/10";
                  } else {
                    dayClass += " bg-gray-800/30";
                  }
                } else if (isMissingEntry) {
                  dayClass += " bg-negative/5 border border-negative/20";
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
                    
                    {isVacation && (
                      <div className="text-xs mt-1 text-cyanBlue/80">
                        Férias
                      </div>
                    )}
                    
                    {isMissingEntry && !entry && (
                      <div className="text-xs mt-1 text-negative">
                        Pendente
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
                <div className="w-3 h-3 rounded-full bg-cyanBlue/10 mr-1"></div>
                <span className="text-gray-400">Férias</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-negative/5 border border-negative/20 mr-1"></div>
                <span className="text-gray-400">Pendente</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full border border-cyanBlue/50 mr-1"></div>
                <span className="text-gray-400">Hoje</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium">Registros do Mês</div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </div>
            </div>
            {employeeEntries.filter(entry => {
              const entryDate = parseISO(entry.date);
              return isSameMonth(entryDate, currentMonth);
            }).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="mx-auto h-8 w-8 opacity-30 mb-2" />
                <p>Nenhum registro de horas encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {employeeEntries
                  .filter(entry => {
                    const entryDate = parseISO(entry.date);
                    return isSameMonth(entryDate, currentMonth);
                  })
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry) => (
                    <button
                      key={entry.date}
                      className="w-full text-left bg-gray-800/40 hover:bg-gray-800/60 p-3 rounded-md transition-colors"
                      onClick={() => onSelectDate(entry.date)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {format(new Date(entry.date), "dd/MM/yyyy")}
                            {entry.isHoliday && <Badge variant="outline">Feriado</Badge>}
                            {entry.isVacation && <Badge variant="outline" className="bg-cyanBlue/10 text-cyanBlue border-cyanBlue/20">Férias</Badge>}
                          </div>
                          <div className="text-sm text-gray-400">
                            {entry.isHoliday ? (
                              "Feriado"
                            ) : entry.isVacation ? (
                              "Férias"
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
          
          <TabsContent value="missing">
            <div className="mb-4 flex justify-between items-center">
              <div className="font-medium">Registros Pendentes</div>
              <div className="text-sm text-gray-400">{formattedMonth}</div>
            </div>
            
            {missingEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="mx-auto h-8 w-8 opacity-30 mb-2" />
                <p>Todos os dias deste mês estão registrados!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {missingEntries
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                  .map((dateStr) => (
                    <button
                      key={dateStr}
                      className="w-full text-left bg-negative/5 hover:bg-negative/10 p-3 rounded-md transition-colors border border-negative/20"
                      onClick={() => onSelectDate(dateStr)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {format(new Date(dateStr), "dd/MM/yyyy")}
                            <Badge variant="destructive" className="bg-negative/20 text-negative border-none">Pendente</Badge>
                          </div>
                          <div className="text-sm text-negative/80">
                            Clique para registrar este dia
                          </div>
                        </div>
                        <AlertCircle className="text-negative h-5 w-5" />
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
