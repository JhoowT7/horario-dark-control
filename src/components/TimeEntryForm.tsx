
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Employee, TimeEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, ArrowDown, Calendar, Check, Copy, Save, X, Clock, CalendarClock, Palmtree, FileText, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime, timeToMinutes, minutesToTime, calculateWorkHours, calculateDayBalance, generateBalanceMessage } from "@/utils/timeUtils";
import { parseISO, format, differenceInCalendarDays, getDay } from "date-fns";

interface TimeEntryFormProps {
  employee: Employee;
  date: string;
  onBack: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ employee, date, onBack }) => {
  const { timeEntries, addTimeEntry, settings, getCurrentDate, isDateInVacation } = useAppContext();
  
  // Find existing entry for this employee and date
  const existingEntry = timeEntries.find(
    (entry) => entry.employeeId === employee.id && entry.date === date
  );
  
  // State for form fields - don't prefill with schedule values
  const [entry, setEntry] = useState(existingEntry?.entry || "");
  const [lunchOut, setLunchOut] = useState(existingEntry?.lunchOut || "");
  const [lunchIn, setLunchIn] = useState(existingEntry?.lunchIn || "");
  const [exit, setExit] = useState(existingEntry?.exit || "");
  const [isHoliday, setIsHoliday] = useState(existingEntry?.isHoliday || settings.holidays.includes(date));
  const [isVacation, setIsVacation] = useState(existingEntry?.isVacation || isDateInVacation(employee.id, date));
  const [isAtestado, setIsAtestado] = useState(existingEntry?.isAtestado || false);
  const [notes, setNotes] = useState(existingEntry?.notes || "");
  
  // Default time values from employee schedule (for easy copy)
  const { workSchedule } = employee;
  
  // Calculate work hours and balance based on current inputs
  const [workedMinutes, setWorkedMinutes] = useState(existingEntry?.workedMinutes || 0);
  const [balanceMinutes, setBalanceMinutes] = useState(existingEntry?.balanceMinutes || 0);
  const [calculationMessage, setCalculationMessage] = useState("");
  
  // Check if the date is today
  const isToday = date === getCurrentDate();
  
  // Calculate how many days in the past or future
  const daysFromToday = differenceInCalendarDays(parseISO(date), parseISO(getCurrentDate()));
  
  // Format input when it loses focus
  const handleTimeBlur = (value: string, setter: (value: string) => void) => {
    setter(formatTime(value));
  };
  
  // Calculate worked hours when inputs change
  useEffect(() => {
    if (isVacation) {
      // Vacation days are neutral - no balance impact
      setWorkedMinutes(0);
      setBalanceMinutes(0);
      setCalculationMessage("Férias: dia não contabilizado no banco de horas");
      return;
    }
    
    if (isAtestado) {
      // Atestado days are neutral - no balance impact
      setWorkedMinutes(0);
      setBalanceMinutes(0);
      setCalculationMessage("Atestado médico: dia não contabilizado no banco de horas");
      return;
    }
    
    if (isHoliday) {
      // Get day of week (0 = Sunday, 6 = Saturday)
      const dayOfWeek = getDay(new Date(date));
      
      if (dayOfWeek === 6) {  // Saturday
        // Saturday holiday: +4 hours (240 minutes)
        setWorkedMinutes(0);
        setBalanceMinutes(240); // +4 hours
        setCalculationMessage("Feriado no sábado: +4 horas no banco de horas");
      } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {  // Monday to Friday
        // Weekday holiday: -50 minutes
        setWorkedMinutes(0);
        setBalanceMinutes(-50);
        setCalculationMessage("Feriado durante a semana: -50 minutos no banco de horas");
      } else {  // Sunday
        // Sunday holiday: no effect
        setWorkedMinutes(0);
        setBalanceMinutes(0);
        setCalculationMessage("Feriado no domingo: sem impacto no banco de horas");
      }
      return;
    }
    
    // Regular day calculation
    const result = calculateWorkHours(
      entry,
      lunchOut,
      lunchIn,
      exit,
      settings.toleranceMinutes
    );
    
    setWorkedMinutes(result.workMinutes);
    
    if (result.workMinutes === 0 && result.message === "Ausência registrada") {
      // Missing entries = absent
      setBalanceMinutes(-employee.expectedMinutesPerDay);
      setCalculationMessage("Ausência registrada: -" + minutesToTime(employee.expectedMinutesPerDay));
      return;
    }
    
    if (result.message !== "OK") {
      setCalculationMessage(result.message);
      return;
    }
    
    // Calculate balance
    const balanceResult = calculateDayBalance(
      result.workMinutes,
      employee.expectedMinutesPerDay,
      settings.toleranceMinutes,
      settings.maxExtraMinutes
    );
    
    setBalanceMinutes(balanceResult.balanceMinutes);
    
    if (balanceResult.adjusted) {
      if (result.workMinutes < employee.expectedMinutesPerDay) {
        setCalculationMessage(`Atraso dentro da tolerância (${settings.toleranceMinutes} min): sem desconto`);
      } else if (result.workMinutes > employee.expectedMinutesPerDay) {
        setCalculationMessage(`Extra dentro do limite (${settings.maxExtraMinutes} min): sem adicional`);
      }
    } else {
      setCalculationMessage("Cálculo realizado normalmente");
    }
  }, [entry, lunchOut, lunchIn, exit, isHoliday, isVacation, isAtestado, employee, date, settings]);
  
  // Fill current time for today's entry
  const fillCurrentTime = (field: 'entry' | 'lunchOut' | 'lunchIn' | 'exit') => {
    if (!isToday) return; // Only works for today
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    switch (field) {
      case 'entry':
        setEntry(currentTime);
        break;
      case 'lunchOut':
        setLunchOut(currentTime);
        break;
      case 'lunchIn':
        setLunchIn(currentTime);
        break;
      case 'exit':
        setExit(currentTime);
        break;
    }
  };
  
  // Save time entry
  const handleSave = () => {
    // For holiday on Saturday, special case of +4 hours
    let calculatedBalanceMinutes = balanceMinutes;
    
    if (isHoliday) {
      const dayOfWeek = getDay(new Date(date));
      if (dayOfWeek === 6) { // Saturday
        calculatedBalanceMinutes = 240; // +4 hours
      } else if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekday
        calculatedBalanceMinutes = -50; // -50 minutes
      } else { // Sunday
        calculatedBalanceMinutes = 0;
      }
    }
    
    const timeEntryData: TimeEntry = {
      date,
      employeeId: employee.id,
      entry: formatTime(entry),
      lunchOut: formatTime(lunchOut),
      lunchIn: formatTime(lunchIn),
      exit: formatTime(exit),
      workedMinutes,
      balanceMinutes: calculatedBalanceMinutes,
      isHoliday,
      isVacation,
      isAtestado,
      notes
    };
    
    addTimeEntry(timeEntryData);
    onBack();
  };
  
  // Format date for display - fixing date display issue
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    // Create a proper Date object from the string
    const dateParts = dateString.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    return dateObj.toLocaleDateString('pt-BR', options);
  };
  
  // Copy default schedule values
  const copyDefaultSchedule = () => {
    setEntry(workSchedule.entry);
    setLunchOut(workSchedule.lunchOut);
    setLunchIn(workSchedule.lunchIn);
    setExit(workSchedule.exit);
  };

  // Get day of week to check if it's a working day or weekend
  const dayOfWeek = getDay(new Date(date));
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // Sunday or Saturday
  
  return (
    <Card className="w-full card-gradient animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg md:text-xl flex items-center">
              {employee.name}
              {isToday && (
                <Badge className="ml-2 bg-cyanBlue text-black">Hoje</Badge>
              )}
            </CardTitle>
            <div className="text-sm text-gray-400 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(date)}
              {!isToday && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {daysFromToday < 0 
                    ? `${Math.abs(daysFromToday)} dia${Math.abs(daysFromToday) !== 1 ? 's' : ''} atrás` 
                    : `${daysFromToday} dia${daysFromToday !== 1 ? 's' : ''} à frente`}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>
            <X className="h-4 w-4 mr-1" /> Voltar
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 bg-gray-800/40 p-3 rounded-lg">
          <Calendar className="text-gray-400" size={18} />
          <div className="text-sm">
            Horário padrão: {workSchedule.entry} - {workSchedule.lunchOut} / {workSchedule.lunchIn} - {workSchedule.exit}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto text-cyanBlue hover:text-cyanBlue/80"
            onClick={copyDefaultSchedule}
          >
            <Copy className="h-4 w-4 mr-1" /> Copiar
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <Switch 
              id="holiday" 
              checked={isHoliday} 
              onCheckedChange={(checked) => {
                setIsHoliday(checked);
                if (checked) { setIsVacation(false); setIsAtestado(false); }
              }} 
            />
            <Label htmlFor="holiday">Feriado</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="vacation" 
              checked={isVacation} 
              onCheckedChange={(checked) => {
                setIsVacation(checked);
                if (checked) { setIsHoliday(false); setIsAtestado(false); }
              }} 
            />
            <Label htmlFor="vacation">Férias</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="atestado" 
              checked={isAtestado} 
              onCheckedChange={(checked) => {
                setIsAtestado(checked);
                if (checked) { setIsHoliday(false); setIsVacation(false); }
              }} 
            />
            <Label htmlFor="atestado">Atestado</Label>
          </div>
          
          {(isHoliday || isVacation || isAtestado) && (
            <Badge variant="outline" className="ml-auto bg-gray-800 text-gray-400">
              {isVacation ? "Férias" : isAtestado ? "Atestado" : "Feriado"}
            </Badge>
          )}
        </div>
        
        {!isHoliday && !isVacation && !isAtestado && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry" className="flex items-center justify-between">
                <span>Entrada</span>
                {isToday && (
                  <Button variant="ghost" size="sm" onClick={() => fillCurrentTime('entry')} className="h-6 px-2">
                    <Clock className="h-3 w-3 mr-1" /> Agora
                  </Button>
                )}
              </Label>
              <Input
                id="entry"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                onBlur={(e) => handleTimeBlur(e.target.value, setEntry)}
                placeholder="08:00"
                className="input-time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunch-out" className="flex items-center justify-between">
                <span>Saída Almoço</span>
                {isToday && (
                  <Button variant="ghost" size="sm" onClick={() => fillCurrentTime('lunchOut')} className="h-6 px-2">
                    <Clock className="h-3 w-3 mr-1" /> Agora
                  </Button>
                )}
              </Label>
              <Input
                id="lunch-out"
                value={lunchOut}
                onChange={(e) => setLunchOut(e.target.value)}
                onBlur={(e) => handleTimeBlur(e.target.value, setLunchOut)}
                placeholder="12:00"
                className="input-time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lunch-in" className="flex items-center justify-between">
                <span>Retorno Almoço</span>
                {isToday && (
                  <Button variant="ghost" size="sm" onClick={() => fillCurrentTime('lunchIn')} className="h-6 px-2">
                    <Clock className="h-3 w-3 mr-1" /> Agora
                  </Button>
                )}
              </Label>
              <Input
                id="lunch-in"
                value={lunchIn}
                onChange={(e) => setLunchIn(e.target.value)}
                onBlur={(e) => handleTimeBlur(e.target.value, setLunchIn)}
                placeholder="13:00"
                className="input-time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exit" className="flex items-center justify-between">
                <span>Saída</span>
                {isToday && (
                  <Button variant="ghost" size="sm" onClick={() => fillCurrentTime('exit')} className="h-6 px-2">
                    <Clock className="h-3 w-3 mr-1" /> Agora
                  </Button>
                )}
              </Label>
              <Input
                id="exit"
                value={exit}
                onChange={(e) => setExit(e.target.value)}
                onBlur={(e) => handleTimeBlur(e.target.value, setExit)}
                placeholder="17:00"
                className="input-time"
              />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre este dia (opcional)"
            className="bg-gray-800 border-gray-700"
          />
        </div>
        
        <div className="bg-gray-800/40 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Horas trabalhadas:</span>
            <span>{minutesToTime(workedMinutes)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Saldo do dia:</span>
            {balanceMinutes === 0 ? (
              <span>00:00</span>
            ) : balanceMinutes > 0 ? (
              <span className="balance-positive flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(balanceMinutes)}
              </span>
            ) : (
              <span className="balance-negative flex items-center">
                <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(balanceMinutes))}
              </span>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            {calculationMessage}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={copyDefaultSchedule}
            className="text-gray-400"
          >
            <Copy className="h-4 w-4 mr-2" /> Usar Horário Padrão
          </Button>
          
          {isToday && (
            <Button 
              variant="outline" 
              onClick={() => {
                fillCurrentTime('entry');
                fillCurrentTime('lunchOut');
                fillCurrentTime('lunchIn');
                fillCurrentTime('exit');
              }}
              className="text-gray-400"
            >
              <CalendarClock className="h-4 w-4 mr-2" /> Preencher Horário Atual
            </Button>
          )}
        </div>
        
        <Button onClick={handleSave} className="bg-cyanBlue hover:bg-cyanBlue/90 text-black">
          <Save className="h-4 w-4 mr-2" /> Salvar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TimeEntryForm;
