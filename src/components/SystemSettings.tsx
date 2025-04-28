import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { VacationPeriod } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, Trash, Save, Plus, Palmtree } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SystemSettings: React.FC = () => {
  const { settings, employees, updateSettings, addHoliday, removeHoliday, addVacationPeriod, removeVacationPeriod } = useAppContext();
  
  const [toleranceMinutes, setToleranceMinutes] = useState(settings.toleranceMinutes.toString());
  const [maxExtraMinutes, setMaxExtraMinutes] = useState(settings.maxExtraMinutes.toString());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const [vacationEmployeeId, setVacationEmployeeId] = useState<string>("");
  const [vacationStartDate, setVacationStartDate] = useState<Date | undefined>(undefined);
  const [vacationEndDate, setVacationEndDate] = useState<Date | undefined>(undefined);
  const [vacationCalendarOpen, setVacationCalendarOpen] = useState<'start' | 'end' | null>(null);
  
  useEffect(() => {
    setToleranceMinutes(settings.toleranceMinutes.toString());
    setMaxExtraMinutes(settings.maxExtraMinutes.toString());
  }, [settings]);
  
  const handleSaveSettings = () => {
    updateSettings({
      ...settings,
      toleranceMinutes: parseInt(toleranceMinutes) || 5,
      maxExtraMinutes: parseInt(maxExtraMinutes) || 10
    });
  };
  
  const handleAddHoliday = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      addHoliday(formattedDate);
      setSelectedDate(undefined);
      setCalendarOpen(false);
    }
  };
  
  const handleRemoveHoliday = (date: string) => {
    removeHoliday(date);
  };
  
  const handleAddVacationPeriod = () => {
    if (vacationEmployeeId && vacationStartDate && vacationEndDate) {
      const vacationPeriod: VacationPeriod = {
        employeeId: vacationEmployeeId,
        startDate: format(vacationStartDate, "yyyy-MM-dd"),
        endDate: format(vacationEndDate, "yyyy-MM-dd")
      };
      
      addVacationPeriod(vacationPeriod);
      
      setVacationEmployeeId("");
      setVacationStartDate(undefined);
      setVacationEndDate(undefined);
    }
  };
  
  const handleRemoveVacationPeriod = (employeeId: string, startDate: string) => {
    removeVacationPeriod(employeeId, startDate);
  };
  
  const formatHolidayDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  const getHolidayName = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth();
    const day = date.getDate();
    
    if (month === 0 && day === 1) return "Ano Novo";
    if (month === 4 && day === 1) return "Dia do Trabalho";
    if (month === 8 && day === 7) return "Independência do Brasil";
    if (month === 9 && day === 12) return "Nossa Senhora Aparecida";
    if (month === 10 && day === 2) return "Finados";
    if (month === 10 && day === 15) return "Proclamação da República";
    if (month === 11 && day === 25) return "Natal";
    
    return "";
  };
  
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Funcionário desconhecido";
  };
  
  return (
    <Card className="w-full card-gradient animate-slide-up">
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="holidays">Feriados</TabsTrigger>
            <TabsTrigger value="vacations">Férias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tolerance">Tolerância de Atraso (minutos)</Label>
                <Input
                  id="tolerance"
                  type="number"
                  min="0"
                  max="60"
                  value={toleranceMinutes}
                  onChange={(e) => setToleranceMinutes(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400">
                  Minutos de atraso que serão tolerados sem desconto.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max-extra">Hora Extra Aceitável (minutos)</Label>
                <Input
                  id="max-extra"
                  type="number"
                  min="0"
                  max="60"
                  value={maxExtraMinutes}
                  onChange={(e) => setMaxExtraMinutes(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400">
                  Minutos extras que serão tolerados sem adicionar ao banco de horas.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} className="bg-cyanBlue hover:bg-cyanBlue/90 text-black">
                <Save className="h-4 w-4 mr-2" /> Salvar Configurações
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="holidays" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Feriados</h3>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-gray-800 border-gray-700">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800" align="end">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => {
                        return settings.holidays.includes(format(date, "yyyy-MM-dd"));
                      }}
                      className="rounded-md"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleAddHoliday}
                        disabled={!selectedDate}
                        className="bg-cyanBlue hover:bg-cyanBlue/90 text-black"
                        size="sm"
                      >
                        Confirmar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              {settings.holidays.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <CalendarIcon className="mx-auto h-6 w-6 opacity-30 mb-2" />
                  <p>Nenhum feriado cadastrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settings.holidays.sort().map((holiday) => (
                    <div
                      key={holiday}
                      className="flex justify-between items-center bg-gray-800/40 p-3 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{formatHolidayDate(holiday)}</div>
                        {getHolidayName(holiday) && (
                          <div className="text-sm text-gray-400">{getHolidayName(holiday)}</div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveHoliday(holiday)}
                        className="text-gray-400 hover:text-negative"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="vacations" className="space-y-6">
            <div className="bg-gray-800/40 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium mb-4">Adicionar Período de Férias</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Funcionário</Label>
                  <Select 
                    value={vacationEmployeeId} 
                    onValueChange={setVacationEmployeeId}
                  >
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Selecione um funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Data Início</Label>
                  <Popover 
                    open={vacationCalendarOpen === 'start'} 
                    onOpenChange={(open) => {
                      if (open) setVacationCalendarOpen('start');
                      else setVacationCalendarOpen(null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-gray-800 border-gray-700 ${
                          !vacationStartDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {vacationStartDate ? (
                          format(vacationStartDate, "dd/MM/yyyy")
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800" align="start">
                      <Calendar
                        mode="single"
                        selected={vacationStartDate}
                        onSelect={setVacationStartDate}
                        className="rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Popover 
                    open={vacationCalendarOpen === 'end'} 
                    onOpenChange={(open) => {
                      if (open) setVacationCalendarOpen('end');
                      else setVacationCalendarOpen(null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-gray-800 border-gray-700 ${
                          !vacationEndDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {vacationEndDate ? (
                          format(vacationEndDate, "dd/MM/yyyy")
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-800" align="start">
                      <Calendar
                        mode="single"
                        selected={vacationEndDate}
                        onSelect={setVacationEndDate}
                        disabled={(date) => 
                          vacationStartDate ? date < vacationStartDate : false
                        }
                        className="rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleAddVacationPeriod}
                  disabled={!vacationEmployeeId || !vacationStartDate || !vacationEndDate}
                  className="bg-cyanBlue hover:bg-cyanBlue/90 text-black"
                >
                  <Palmtree className="h-4 w-4 mr-2" /> Adicionar Férias
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Períodos de Férias Cadastrados</h3>
              
              {settings.vacationPeriods && settings.vacationPeriods.length > 0 ? (
                <div className="space-y-2">
                  {settings.vacationPeriods.map((period) => (
                    <div
                      key={`${period.employeeId}-${period.startDate}`}
                      className="flex justify-between items-center bg-gray-800/40 p-3 rounded-md"
                    >
                      <div>
                        <div className="font-medium">{getEmployeeName(period.employeeId)}</div>
                        <div className="text-sm text-gray-400">
                          {format(new Date(period.startDate), "dd/MM/yyyy")} até {format(new Date(period.endDate), "dd/MM/yyyy")}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveVacationPeriod(period.employeeId, period.startDate)}
                        className="text-gray-400 hover:text-negative"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <Palmtree className="mx-auto h-6 w-6 opacity-30 mb-2" />
                  <p>Nenhum período de férias cadastrado</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
