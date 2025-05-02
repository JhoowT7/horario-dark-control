import React, { useState } from "react";
import { Employee, ContractType, ScheduleType, WorkDay } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppContext } from "@/contexts/AppContext";

interface EmployeeFormProps {
  initialData?: Employee;
  onCancel: () => void;
}

const defaultWorkDays: WorkDay = {
  0: false, // Sunday
  1: true,  // Monday
  2: true,  // Tuesday
  3: true,  // Wednesday
  4: true,  // Thursday
  5: true,  // Friday
  6: false  // Saturday
};

const weekdays = [
  { day: 0, name: "Domingo" },
  { day: 1, name: "Segunda" },
  { day: 2, name: "Terça" },
  { day: 3, name: "Quarta" },
  { day: 4, name: "Quinta" },
  { day: 5, name: "Sexta" },
  { day: 6, name: "Sábado" },
];

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onCancel }) => {
  const { addEmployee, updateEmployee } = useAppContext();
  
  // Initialize form state with initial data or defaults
  const [name, setName] = useState(initialData?.name || "");
  const [registrationId, setRegistrationId] = useState(initialData?.registrationId || "");
  const [position, setPosition] = useState(initialData?.position || "");
  const [contractType, setContractType] = useState<ContractType>(initialData?.contractType || "CLT");
  const [scheduleType, setScheduleType] = useState<ScheduleType>(initialData?.scheduleType || "5x2");
  const [workDays, setWorkDays] = useState<WorkDay>(initialData?.workDays || defaultWorkDays);
  const [entryTime, setEntryTime] = useState(initialData?.workSchedule.entry || "08:00");
  const [lunchOutTime, setLunchOutTime] = useState(initialData?.workSchedule.lunchOut || "12:00");
  const [lunchInTime, setLunchInTime] = useState(initialData?.workSchedule.lunchIn || "13:00");
  const [exitTime, setExitTime] = useState(initialData?.workSchedule.exit || "17:00");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [password, setPassword] = useState(initialData?.password || "senha123");
  const [isAdmin, setIsAdmin] = useState(initialData?.isAdmin || false);
  
  // Handle schedule type change to update work days automatically
  const handleScheduleTypeChange = (value: ScheduleType) => {
    setScheduleType(value);
    
    if (value === "5x2") {
      setWorkDays({
        0: false, // Sunday
        1: true,  // Monday
        2: true,  // Tuesday
        3: true,  // Wednesday
        4: true,  // Thursday
        5: true,  // Friday
        6: false  // Saturday
      });
    } else if (value === "6x1") {
      setWorkDays({
        0: false, // Sunday
        1: true,  // Monday
        2: true,  // Tuesday
        3: true,  // Wednesday
        4: true,  // Thursday
        5: true,  // Friday
        6: true   // Saturday
      });
    }
    // If "Personalizado", keep current workDays
  };
  
  // Calculate expected minutes based on times
  const calculateExpectedMinutes = () => {
    if (!entryTime || !exitTime) return 0;
    
    const entryParts = entryTime.split(":").map(Number);
    const exitParts = exitTime.split(":").map(Number);
    
    const entryMinutes = entryParts[0] * 60 + entryParts[1];
    const exitMinutes = exitParts[0] * 60 + exitParts[1];
    
    let totalMinutes = exitMinutes - entryMinutes;
    
    // Subtract lunch break if it exists
    if (lunchOutTime && lunchInTime) {
      const lunchOutParts = lunchOutTime.split(":").map(Number);
      const lunchInParts = lunchInTime.split(":").map(Number);
      
      const lunchOutMinutes = lunchOutParts[0] * 60 + lunchOutParts[1];
      const lunchInMinutes = lunchInParts[0] * 60 + lunchInParts[1];
      
      totalMinutes -= (lunchInMinutes - lunchOutMinutes);
    }
    
    return totalMinutes;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expectedMinutesPerDay = calculateExpectedMinutes();
    
    const employeeData: Employee = {
      id: initialData?.id || Math.random().toString(36).substring(2, 9),
      name,
      email,
      phone,
      position,
      department,
      contractType,
      registrationId,
      scheduleType,
      workDays,
      workSchedule: {
        entry: entryTime,
        lunchOut: lunchOutTime,
        lunchIn: lunchInTime,
        exit: exitTime
      },
      expectedMinutesPerDay,
      password,
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      isAdmin
    };
    
    if (initialData) {
      updateEmployee(employeeData);
    } else {
      addEmployee(employeeData);
    }
    
    onCancel(); // Close form
  };
  
  const handleWorkDayChange = (day: number, checked: boolean) => {
    setWorkDays(prev => ({
      ...prev,
      [day]: checked
    }));
    // When changing work days, set to "Personalizado"
    setScheduleType("Personalizado");
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto card-gradient animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {initialData ? "Editar Funcionário" : "Cadastrar Novo Funcionário"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nome do funcionário"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationId">Matrícula/ID</Label>
              <Input 
                id="registrationId"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                required
                placeholder="ID interno"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email do funcionário"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefone do funcionário"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input 
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                placeholder="Cargo do funcionário"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input 
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                placeholder="Departamento"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Contrato</Label>
            <RadioGroup 
              value={contractType}
              onValueChange={(value) => setContractType(value as ContractType)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CLT" id="clt" />
                <Label htmlFor="clt">CLT</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PJ" id="pj" />
                <Label htmlFor="pj">PJ</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Escala</Label>
            <Select
              value={scheduleType}
              onValueChange={(value) => handleScheduleTypeChange(value as ScheduleType)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Selecione a escala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5x2">5x2 (trabalha 5, folga 2)</SelectItem>
                <SelectItem value="6x1">6x1 (trabalha 6, folga 1)</SelectItem>
                <SelectItem value="Personalizado">Personalizar dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {scheduleType === "Personalizado" && (
            <div className="space-y-2">
              <Label>Dias de Trabalho</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weekdays.map((weekday) => (
                  <div key={weekday.day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${weekday.day}`}
                      checked={workDays[weekday.day]}
                      onCheckedChange={(checked) => 
                        handleWorkDayChange(weekday.day, checked === true)
                      }
                    />
                    <Label htmlFor={`day-${weekday.day}`}>{weekday.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Jornada de Trabalho</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label htmlFor="entry-time" className="text-xs">Entrada</Label>
                <Input 
                  id="entry-time"
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lunch-out" className="text-xs">Saída Almoço</Label>
                <Input 
                  id="lunch-out"
                  type="time"
                  value={lunchOutTime}
                  onChange={(e) => setLunchOutTime(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lunch-in" className="text-xs">Retorno Almoço</Label>
                <Input 
                  id="lunch-in"
                  type="time"
                  value={lunchInTime}
                  onChange={(e) => setLunchInTime(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="exit-time" className="text-xs">Saída</Label>
                <Input 
                  id="exit-time"
                  type="time"
                  value={exitTime}
                  onChange={(e) => setExitTime(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-md">
            <p className="text-sm text-gray-400">
              Jornada calculada: <span className="text-white font-medium">
                {Math.floor(calculateExpectedMinutes() / 60)}h{calculateExpectedMinutes() % 60}min
              </span> por dia
            </p>
          </div>

          <div className="space-y-2 border-t border-gray-700 pt-4">
            <Label>Configurações de Acesso</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Senha para acesso"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="flex items-center space-x-2 mt-7">
                <Checkbox
                  id="is-admin"
                  checked={isAdmin}
                  onCheckedChange={(checked) => setIsAdmin(checked === true)}
                />
                <Label htmlFor="is-admin">Administrador do sistema</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-cyanBlue hover:bg-cyanBlue/90 text-black">
            {initialData ? "Atualizar" : "Cadastrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmployeeForm;
