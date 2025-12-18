
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { Employee, TimeEntry, WorkBreak } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Calendar, Copy, Save, X, Clock, CalendarClock, Plus, Trash2, HelpCircle, AlertCircle, Check, Keyboard } from "lucide-react";
import { formatTime, timeToMinutes, minutesToTime, calculateWorkHours, calculateDayBalance } from "@/utils/timeUtils";
import { parseISO, differenceInCalendarDays, getDay } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";
import Confetti from "@/components/ui/confetti";

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
  
  // State for form fields
  const [entry, setEntry] = useState(existingEntry?.entry || "");
  const [lunchOut, setLunchOut] = useState(existingEntry?.lunchOut || "");
  const [lunchIn, setLunchIn] = useState(existingEntry?.lunchIn || "");
  const [exit, setExit] = useState(existingEntry?.exit || "");
  const [breaks, setBreaks] = useState<WorkBreak[]>(existingEntry?.breaks || []);
  const [isHoliday, setIsHoliday] = useState(existingEntry?.isHoliday || settings.holidays.includes(date));
  const [isVacation, setIsVacation] = useState(existingEntry?.isVacation || isDateInVacation(employee.id, date));
  const [isAtestado, setIsAtestado] = useState(existingEntry?.isAtestado || false);
  const [notes, setNotes] = useState(existingEntry?.notes || "");
  
  // Default time values from employee schedule
  const { workSchedule } = employee;
  
  // Calculate work hours and balance
  const [workedMinutes, setWorkedMinutes] = useState(existingEntry?.workedMinutes || 0);
  const [balanceMinutes, setBalanceMinutes] = useState(existingEntry?.balanceMinutes || 0);
  const [calculationMessage, setCalculationMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  
  const isToday = date === getCurrentDate();
  const daysFromToday = differenceInCalendarDays(parseISO(date), parseISO(getCurrentDate()));
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      if (!isSaving && Object.keys(validationErrors).length === 0) {
        handleSave();
      }
    },
    onEscape: onBack,
    enabled: true
  });
  
  const handleTimeBlur = (value: string, setter: (value: string) => void) => {
    setter(formatTime(value));
    setHasUnsavedChanges(true);
  };
  
  // Validation function for break times
  const validateBreakTimes = useCallback((breakItem: WorkBreak): string | null => {
    if (!breakItem.exitTime || !breakItem.returnTime) return null;
    
    const exitMinutes = timeToMinutes(breakItem.exitTime);
    const returnMinutes = timeToMinutes(breakItem.returnTime);
    
    if (returnMinutes <= exitMinutes) {
      return "Retorno deve ser após a saída";
    }
    
    // Check if break is within work hours
    const entryMinutes = timeToMinutes(entry);
    const exitWorkMinutes = timeToMinutes(exit);
    
    if (entry && exitMinutes < entryMinutes) {
      return "Intervalo fora do horário de trabalho";
    }
    
    if (exit && returnMinutes > exitWorkMinutes) {
      return "Intervalo fora do horário de trabalho";
    }
    
    return null;
  }, [entry, exit]);
  
  // Check for overlapping breaks
  const checkOverlappingBreaks = useCallback((): string | null => {
    for (let i = 0; i < breaks.length; i++) {
      for (let j = i + 1; j < breaks.length; j++) {
        const b1 = breaks[i];
        const b2 = breaks[j];
        
        if (!b1.exitTime || !b1.returnTime || !b2.exitTime || !b2.returnTime) continue;
        
        const b1Exit = timeToMinutes(b1.exitTime);
        const b1Return = timeToMinutes(b1.returnTime);
        const b2Exit = timeToMinutes(b2.exitTime);
        const b2Return = timeToMinutes(b2.returnTime);
        
        // Check overlap
        if ((b2Exit >= b1Exit && b2Exit < b1Return) || (b1Exit >= b2Exit && b1Exit < b2Return)) {
          return `Intervalos ${i + 1} e ${j + 1} estão sobrepostos`;
        }
      }
    }
    return null;
  }, [breaks]);
  
  // Validate all breaks and update errors
  useEffect(() => {
    const errors: Record<string, string> = {};
    
    breaks.forEach((breakItem, index) => {
      const error = validateBreakTimes(breakItem);
      if (error) {
        errors[`break_${breakItem.id}`] = error;
      }
    });
    
    const overlapError = checkOverlappingBreaks();
    if (overlapError) {
      errors['overlap'] = overlapError;
    }
    
    setValidationErrors(errors);
  }, [breaks, validateBreakTimes, checkOverlappingBreaks]);
  
  // Add new break
  const addBreak = () => {
    setBreaks([...breaks, { id: uuidv4(), exitTime: "", returnTime: "", reason: "" }]);
    setHasUnsavedChanges(true);
  };
  
  // Remove break
  const removeBreak = (id: string) => {
    setBreaks(breaks.filter(b => b.id !== id));
    setHasUnsavedChanges(true);
  };
  
  // Update break field
  const updateBreak = (id: string, field: keyof WorkBreak, value: string) => {
    setBreaks(breaks.map(b => b.id === id ? { ...b, [field]: value } : b));
    setHasUnsavedChanges(true);
  };
  
  // Autosave functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    
    autosaveTimerRef.current = setTimeout(() => {
      // Store in localStorage as backup
      const backupData = {
        date,
        employeeId: employee.id,
        entry, lunchOut, lunchIn, exit,
        breaks, isHoliday, isVacation, isAtestado, notes,
        timestamp: Date.now()
      };
      localStorage.setItem(`timeentry_backup_${employee.id}_${date}`, JSON.stringify(backupData));
    }, 2000);
    
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [entry, lunchOut, lunchIn, exit, breaks, isHoliday, isVacation, isAtestado, notes, hasUnsavedChanges, date, employee.id]);
  
  // Calculate worked hours when inputs change
  useEffect(() => {
    if (isVacation) {
      setWorkedMinutes(0);
      setBalanceMinutes(0);
      setCalculationMessage("Férias: dia não contabilizado no banco de horas");
      return;
    }
    
    if (isAtestado) {
      setWorkedMinutes(0);
      setBalanceMinutes(0);
      setCalculationMessage("Atestado médico: dia não contabilizado no banco de horas");
      return;
    }
    
    if (isHoliday) {
      const dayOfWeek = getDay(new Date(date));
      
      if (dayOfWeek === 6) {
        setWorkedMinutes(0);
        setBalanceMinutes(240);
        setCalculationMessage("Feriado no sábado: +4 horas no banco de horas");
      } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        setWorkedMinutes(0);
        setBalanceMinutes(-50);
        setCalculationMessage("Feriado durante a semana: -50 minutos no banco de horas");
      } else {
        setWorkedMinutes(0);
        setBalanceMinutes(0);
        setCalculationMessage("Feriado no domingo: sem impacto no banco de horas");
      }
      return;
    }
    
    // Convert breaks to format expected by calculateWorkHours
    const breakIntervals = breaks
      .filter(b => b.exitTime && b.returnTime)
      .map(b => ({ exitTime: b.exitTime, returnTime: b.returnTime }));
    
    const result = calculateWorkHours(
      entry,
      lunchOut,
      lunchIn,
      exit,
      settings.toleranceMinutes,
      breakIntervals
    );
    
    setWorkedMinutes(result.workMinutes);
    
    if (result.workMinutes === 0 && result.message === "Ausência registrada") {
      setBalanceMinutes(-employee.expectedMinutesPerDay);
      setCalculationMessage("Ausência registrada: -" + minutesToTime(employee.expectedMinutesPerDay));
      return;
    }
    
    if (result.message !== "OK") {
      setCalculationMessage(result.message);
      return;
    }
    
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
      const breakCount = breakIntervals.length;
      setCalculationMessage(breakCount > 0 
        ? `Cálculo com ${breakCount} intervalo(s) adicional(is)` 
        : "Cálculo realizado normalmente");
    }
  }, [entry, lunchOut, lunchIn, exit, breaks, isHoliday, isVacation, isAtestado, employee, date, settings]);
  
  const fillCurrentTime = (field: 'entry' | 'lunchOut' | 'lunchIn' | 'exit') => {
    if (!isToday) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    switch (field) {
      case 'entry': setEntry(currentTime); break;
      case 'lunchOut': setLunchOut(currentTime); break;
      case 'lunchIn': setLunchIn(currentTime); break;
      case 'exit': setExit(currentTime); break;
    }
  };
  
  const fillBreakCurrentTime = (breakId: string, field: 'exitTime' | 'returnTime') => {
    if (!isToday) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    updateBreak(breakId, field, currentTime);
  };
  
  const handleSave = async () => {
    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Corrija os erros antes de salvar", {
        description: Object.values(validationErrors)[0]
      });
      return;
    }
    
    setIsSaving(true);
    
    let calculatedBalanceMinutes = balanceMinutes;
    
    if (isHoliday) {
      const dayOfWeek = getDay(new Date(date));
      if (dayOfWeek === 6) {
        calculatedBalanceMinutes = 240;
      } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        calculatedBalanceMinutes = -50;
      } else {
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
      breaks: breaks.map(b => ({
        ...b,
        exitTime: formatTime(b.exitTime),
        returnTime: formatTime(b.returnTime)
      })),
      workedMinutes,
      balanceMinutes: calculatedBalanceMinutes,
      isHoliday,
      isVacation,
      isAtestado,
      notes
    };
    
    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addTimeEntry(timeEntryData);
    
    // Clear backup after successful save
    localStorage.removeItem(`timeentry_backup_${employee.id}_${date}`);
    setHasUnsavedChanges(false);
    
    // Check for perfect 8h day (480 minutes = 8 hours, 0 balance)
    if (balanceMinutes === 0 && workedMinutes === employee.expectedMinutesPerDay) {
      setShowConfetti(true);
      toast.success("🎉 Jornada perfeita!", {
        description: `Exatamente ${minutesToTime(employee.expectedMinutesPerDay)} trabalhadas!`
      });
    } else {
      toast.success("Registro salvo", {
        description: `${formatDate(date)} - ${employee.name}`
      });
    }
    
    setIsSaving(false);
    
    // Delay onBack to show confetti
    setTimeout(() => {
      setShowConfetti(false);
      onBack();
    }, showConfetti ? 2000 : 300);
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateParts = dateString.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    return dateObj.toLocaleDateString('pt-BR', options);
  };
  
  const copyDefaultSchedule = () => {
    setEntry(workSchedule.entry);
    setLunchOut(workSchedule.lunchOut);
    setLunchIn(workSchedule.lunchIn);
    setExit(workSchedule.exit);
  };

  const dayOfWeek = getDay(new Date(date));
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
  
  // Perfect journey check (8h exactly)
  const isPerfectJourney = balanceMinutes === 0 && workedMinutes === employee.expectedMinutesPerDay;
  
  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full card-gradient">
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
          <>
            {/* Main time entries */}
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
                  <span>Saída Final</span>
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
            
            {/* Additional breaks section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-400">Intervalos Adicionais</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBreak}
                  className="text-cyanBlue border-cyanBlue/30 hover:bg-cyanBlue/10"
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Intervalo
                </Button>
              </div>
              
              {breaks.length === 0 && (
                <p className="text-xs text-gray-500 italic">
                  Nenhum intervalo adicional. Use para registrar saídas durante o expediente (banco, médico, etc.)
                </p>
              )}
              
              {breaks.map((breakItem, index) => {
                const breakError = validationErrors[`break_${breakItem.id}`];
                const hasError = !!breakError;
                
                return (
                  <div 
                    key={breakItem.id} 
                    className={`bg-gray-800/30 rounded-lg p-3 space-y-3 border transition-colors animate-fade-in ${
                      hasError ? 'border-negative/50 bg-negative/5' : 'border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">
                        Intervalo {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBreak(breakItem.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center justify-between">
                          <span>Saída</span>
                          {isToday && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => fillBreakCurrentTime(breakItem.id, 'exitTime')} 
                              className="h-5 px-1 text-xs"
                            >
                              <Clock className="h-3 w-3" />
                            </Button>
                          )}
                        </Label>
                        <Input
                          value={breakItem.exitTime}
                          onChange={(e) => updateBreak(breakItem.id, 'exitTime', e.target.value)}
                          onBlur={(e) => updateBreak(breakItem.id, 'exitTime', formatTime(e.target.value))}
                          placeholder="10:00"
                          className={`input-time h-8 text-sm ${hasError ? 'border-negative/50 focus:ring-negative' : ''}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center justify-between">
                          <span>Retorno</span>
                          {isToday && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => fillBreakCurrentTime(breakItem.id, 'returnTime')} 
                              className="h-5 px-1 text-xs"
                            >
                              <Clock className="h-3 w-3" />
                            </Button>
                          )}
                        </Label>
                        <Input
                          value={breakItem.returnTime}
                          onChange={(e) => updateBreak(breakItem.id, 'returnTime', e.target.value)}
                          onBlur={(e) => updateBreak(breakItem.id, 'returnTime', formatTime(e.target.value))}
                          placeholder="10:30"
                          className={`input-time h-8 text-sm ${hasError ? 'border-negative/50 focus:ring-negative' : ''}`}
                        />
                      </div>
                    </div>
                    
                    {hasError && (
                      <div className="flex items-center gap-1.5 text-xs text-negative">
                        <AlertCircle className="h-3 w-3" />
                        {breakError}
                      </div>
                    )}
                    
                    <Input
                      value={breakItem.reason || ""}
                      onChange={(e) => updateBreak(breakItem.id, 'reason', e.target.value)}
                      placeholder="Motivo (opcional): banco, médico, etc."
                      className="bg-gray-800/50 border-gray-700 h-8 text-sm"
                    />
                  </div>
                );
              })}
            </div>
          </>
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Horas trabalhadas:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">Total de horas no expediente, descontando almoço e intervalos adicionais.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span>{minutesToTime(workedMinutes)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Saldo do dia:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm mb-1"><strong>Positivo (+):</strong> Horas extras trabalhadas além da jornada.</p>
                    <p className="text-sm"><strong>Negativo (-):</strong> Horas que faltam para completar a jornada.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {balanceMinutes === 0 ? (
              <span className="flex items-center text-cyanBlue/70">
                <Check className="h-4 w-4 mr-1" /> Jornada completa
              </span>
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
          
          {hasUnsavedChanges && (
            <div className="text-xs text-cyanBlue/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyanBlue/60 rounded-full animate-pulse-slow"></span>
              Backup automático ativo
            </div>
          )}
        </div>
        
        {/* Validation errors summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-negative/10 border border-negative/30 rounded-lg p-3 animate-shake">
            <div className="flex items-center gap-2 text-negative text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Corrija os erros antes de salvar:</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-negative/80 pl-6 list-disc">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
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
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                ref={saveButtonRef}
                onClick={handleSave} 
                disabled={isSaving || Object.keys(validationErrors).length > 0}
                className={`bg-cyanBlue hover:bg-cyanBlue/90 text-black transition-all ripple ${isSaving ? 'animate-save-success' : ''}`}
                aria-label="Salvar registro (Ctrl+S)"
              >
                {isSaving ? (
                  <>
                    <Check className="h-4 w-4 mr-2 animate-fade-in" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Salvar
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Atalho: <Badge variant="outline" className="ml-1 text-xs">Ctrl+S</Badge></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
      </motion.div>
    </>
  );
};

export default TimeEntryForm;
