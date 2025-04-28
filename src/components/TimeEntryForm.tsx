
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Employee, TimeEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, ArrowDown, Calendar, Check, Copy, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime, timeToMinutes, minutesToTime, calculateWorkHours, calculateDayBalance, generateBalanceMessage } from "@/utils/timeUtils";

interface TimeEntryFormProps {
  employee: Employee;
  date: string;
  onBack: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ employee, date, onBack }) => {
  const { timeEntries, addTimeEntry, settings } = useAppContext();
  
  // Find existing entry for this employee and date
  const existingEntry = timeEntries.find(
    (entry) => entry.employeeId === employee.id && entry.date === date
  );
  
  // State for form fields
  const [entry, setEntry] = useState(existingEntry?.entry || "");
  const [lunchOut, setLunchOut] = useState(existingEntry?.lunchOut || "");
  const [lunchIn, setLunchIn] = useState(existingEntry?.lunchIn || "");
  const [exit, setExit] = useState(existingEntry?.exit || "");
  const [isHoliday, setIsHoliday] = useState(existingEntry?.isHoliday || settings.holidays.includes(date));
  const [notes, setNotes] = useState(existingEntry?.notes || "");
  
  // Default time values from employee schedule (for easy copy)
  const { workSchedule } = employee;
  
  // Calculate work hours and balance based on current inputs
  const [workedMinutes, setWorkedMinutes] = useState(existingEntry?.workedMinutes || 0);
  const [balanceMinutes, setBalanceMinutes] = useState(existingEntry?.balanceMinutes || 0);
  const [calculationMessage, setCalculationMessage] = useState("");
  
  // Format input when it loses focus
  const handleTimeBlur = (value: string, setter: (value: string) => void) => {
    setter(formatTime(value));
  };
  
  // Calculate worked hours when inputs change
  useEffect(() => {
    if (isHoliday) {
      // Holiday calculations based on schedule type
      let holidayBalance = 0;
      
      if (employee.scheduleType === "5x2") {
        // Get day of week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = new Date(date).getDay();
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Weekday holiday for 5x2: funcionário deve 50 minutos
          holidayBalance = -50;
          setCalculationMessage("Feriado durante a semana: -50 minutos no banco de horas");
        } else if (dayOfWeek === 6) {
          // Saturday holiday for 5x2: funcionário ganha 4 horas
          holidayBalance = 4 * 60;
          setCalculationMessage("Feriado no sábado: +4 horas no banco de horas");
        } else {
          // Sunday holiday: no effect
          holidayBalance = 0;
          setCalculationMessage("Feriado no domingo: sem impacto no banco de horas");
        }
      } else {
        // For 6x1 schedules: holiday just nullifies the day
        holidayBalance = 0;
        setCalculationMessage("Feriado: dia anulado (sem débito ou crédito)");
      }
      
      setWorkedMinutes(0);
      setBalanceMinutes(holidayBalance);
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
  }, [entry, lunchOut, lunchIn, exit, isHoliday, employee, date, settings]);
  
  // Save time entry
  const handleSave = () => {
    const timeEntryData: TimeEntry = {
      date,
      employeeId: employee.id,
      entry: formatTime(entry),
      lunchOut: formatTime(lunchOut),
      lunchIn: formatTime(lunchIn),
      exit: formatTime(exit),
      workedMinutes,
      balanceMinutes,
      isHoliday,
      notes
    };
    
    addTimeEntry(timeEntryData);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };
  
  // Copy default schedule values
  const copyDefaultSchedule = () => {
    setEntry(workSchedule.entry);
    setLunchOut(workSchedule.lunchOut);
    setLunchIn(workSchedule.lunchIn);
    setExit(workSchedule.exit);
  };
  
  return (
    <Card className="w-full card-gradient animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg md:text-xl">
              {employee.name}
            </CardTitle>
            <div className="text-sm text-gray-400">
              {formatDate(date)}
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
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="holiday" 
            checked={isHoliday} 
            onCheckedChange={setIsHoliday} 
          />
          <Label htmlFor="holiday">Marcar como Feriado</Label>
          {isHoliday && (
            <Badge variant="outline" className="ml-auto bg-gray-800 text-gray-400">
              Feriado
            </Badge>
          )}
        </div>
        
        {!isHoliday && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Entrada</Label>
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
              <Label htmlFor="lunch-out">Saída Almoço</Label>
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
              <Label htmlFor="lunch-in">Retorno Almoço</Label>
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
              <Label htmlFor="exit">Saída</Label>
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
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={copyDefaultSchedule}
          className="text-gray-400"
        >
          <Copy className="h-4 w-4 mr-2" /> Usar Horário Padrão
        </Button>
        <Button onClick={handleSave} className="bg-cyanBlue hover:bg-cyanBlue/90 text-black">
          <Save className="h-4 w-4 mr-2" /> Salvar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TimeEntryForm;
