
import React, { useState } from "react";
import { Employee } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import EmployeeForm from "./EmployeeForm";

interface EmployeeListProps {
  onAddNew: () => void;
  onSelect: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onAddNew, onSelect }) => {
  const { employees, deleteEmployee } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.registrationId && employee.registrationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle employee deletion
  const handleDelete = (id: string) => {
    deleteEmployee(id);
  };
  
  // Handle employee editing
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };
  
  // When edit form is closed
  const handleEditCancel = () => {
    setEditingEmployee(null);
  };
  
  return (
    <>
      {editingEmployee ? (
        <EmployeeForm initialData={editingEmployee} onCancel={handleEditCancel} />
      ) : (
        <Card className="w-full card-gradient animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Funcionários</CardTitle>
            <Button onClick={onAddNew} className="btn-primary">
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                placeholder="Buscar funcionário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700"
              />
            </div>
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhum funcionário encontrado</p>
                <Button onClick={onAddNew} variant="link" className="text-cyanBlue mt-2">
                  Cadastrar um novo funcionário
                </Button>
              </div>
            )}
            
            <ul className="space-y-2">
              {filteredEmployees.map((employee) => (
                <li key={employee.id} className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => onSelect(employee)}
                      className="text-left flex-1 focus:outline-none focus:ring-2 focus:ring-cyanBlue rounded-md p-1"
                    >
                      <h3 className="font-medium">{employee.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-400">
                        {employee.registrationId && <span>ID: {employee.registrationId}</span>}
                        <span>{employee.position}</span>
                        {employee.contractType && <span>{employee.contractType} • {employee.scheduleType}</span>}
                      </div>
                    </button>
                    
                    <div className="flex gap-1">
                      <Button onClick={() => handleEdit(employee)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Edit size={16} />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-negative">
                            <Trash size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover funcionário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o
                              funcionário "{employee.name}" e todos os registros de horas associados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(employee.id)}
                              className="bg-negative text-white hover:bg-negative/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EmployeeList;
