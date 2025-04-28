
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, Trash, Save, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

const SystemSettings: React.FC = () => {
  const { settings, updateSettings, addHoliday, removeHoliday } = useAppContext();
  
  const [toleranceMinutes, setToleranceMinutes] = useState(settings.toleranceMinutes.toString());
  const [maxExtraMinutes, setMaxExtraMinutes] = useState(settings.maxExtraMinutes.toString());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    setToleranceMinutes(settings.toleranceMinutes.toString());
    setMaxExtraMinutes(settings.maxExtraMinutes.toString());
  }, [settings]);
  
  // Save settings
  const handleSaveSettings = () => {
    updateSettings({
      ...settings,
      toleranceMinutes: parseInt(toleranceMinutes) || 5,
      maxExtraMinutes: parseInt(maxExtraMinutes) || 10
    });
  };
  
  // Add holiday
  const handleAddHoliday = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      addHoliday(formattedDate);
      setSelectedDate(undefined);
      setCalendarOpen(false);
    }
  };
  
  // Remove holiday
  const handleRemoveHoliday = (date: string) => {
    removeHoliday(date);
  };
  
  // Format date for display
  const formatHolidayDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  // Get holiday name if applicable
  const getHolidayName = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth();
    const day = date.getDate();
    
    // Common Brazilian holidays
    if (month === 0 && day === 1) return "Ano Novo";
    if (month === 4 && day === 1) return "Dia do Trabalho";
    if (month === 8 && day === 7) return "Independência do Brasil";
    if (month === 9 && day === 12) return "Nossa Senhora Aparecida";
    if (month === 10 && day === 2) return "Finados";
    if (month === 10 && day === 15) return "Proclamação da República";
    if (month === 11 && day === 25) return "Natal";
    
    return "";
  };
  
  return (
    <Card className="w-full card-gradient animate-slide-up">
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
        
        <Separator />
        
        <div className="space-y-4">
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
                      // Disable dates that are already holidays
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
