
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { User, Key, Save } from "lucide-react";

const UserProfile: React.FC = () => {
  const { selectedEmployee, updateEmployee } = useAppContext();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  if (!selectedEmployee) return null;

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    
    if (newPassword.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres!");
      return;
    }
    
    const updatedEmployee = {
      ...selectedEmployee,
      password: newPassword
    };
    
    updateEmployee(updatedEmployee);
    toast.success("Senha alterada com sucesso!");
    
    // Reset form
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Card className="card-gradient animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" /> Alterar Senha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="user">Usuário</Label>
          <Input id="user" value={selectedEmployee.name} disabled className="bg-gray-800" />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="new-password">Nova Senha</Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="new-password"
              type="password"
              placeholder="Digite a nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="confirm-password">Confirme a Senha</Label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleChangePassword} 
          disabled={!newPassword || !confirmPassword}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" /> Salvar Nova Senha
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;
