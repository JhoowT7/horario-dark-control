
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Lock, User } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { employees, setSelectedEmployee } = useAppContext();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    
    // Simple timeout to simulate authentication check
    setTimeout(() => {
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      
      if (employee) {
        // If employee is admin, accept any password for demo purposes
        if (employee.isAdmin) {
          setSelectedEmployee(employee);
          toast.success(`Bem-vindo, Administrador ${employee.name}!`);
          onLoginSuccess();
          return;
        }
        
        // Check password - default is "senha" if not set
        const correctPassword = employee.password || "senha";
        
        if (password === correctPassword) {
          setSelectedEmployee(employee);
          toast.success(`Bem-vindo, ${employee.name}!`);
          onLoginSuccess();
        } else {
          toast.error("Senha incorreta!");
        }
      } else {
        toast.error("Funcionário não encontrado!");
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="w-full max-w-md mx-auto card-gradient animate-slide-up">
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-center">
          <Clock className="mr-2" /> Sistema de Controle de Ponto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee">Funcionário</Label>
          <select 
            id="employee" 
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="">Selecione um funcionário</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.isAdmin ? ' (Admin)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-gray-400">
            * A senha padrão é "senha" se não tiver sido alterada.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleLogin} 
          disabled={!selectedEmployeeId || !password || isLoading}
          className="w-full bg-cyanBlue hover:bg-cyanBlue/90 text-black"
        >
          {isLoading ? "Autenticando..." : "Entrar"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
