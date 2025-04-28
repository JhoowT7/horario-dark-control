
import { useState } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { Employee } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeList from "@/components/EmployeeList";
import EmployeeForm from "@/components/EmployeeForm";
import TimeEntryForm from "@/components/TimeEntryForm";
import TimeTrackingSummary from "@/components/TimeTrackingSummary";
import SystemSettings from "@/components/SystemSettings";
import { Button } from "@/components/ui/button";
import { Calendar, User, Settings } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("employees");
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // Handle adding a new employee
  const handleAddNewEmployee = () => {
    setShowNewEmployeeForm(true);
  };
  
  // Handle canceling employee form
  const handleCancelEmployeeForm = () => {
    setShowNewEmployeeForm(false);
  };
  
  // Handle selecting an employee
  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    // Get today's date
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
    setActiveTab("timetracking");
  };
  
  // Handle selecting a date
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };
  
  // Handle back button from time entry form
  const handleBackFromTimeEntry = () => {
    setSelectedDate("");
  };
  
  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-dark text-white p-4 md:p-6 flex flex-col">
        <header className="container mx-auto max-w-6xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyanBlue to-positive bg-clip-text text-transparent">
                Horario Control
              </h1>
              <p className="text-gray-400">Sistema de Controle de Banco de Horas</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "employees" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("employees");
                  setSelectedEmployee(null);
                }}
                className={activeTab === "employees" ? "bg-cyanBlue hover:bg-cyanBlue/90 text-black" : ""}
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Funcionários</span>
              </Button>
              
              <Button 
                variant={activeTab === "timetracking" ? "default" : "outline"}
                onClick={() => setActiveTab("timetracking")}
                disabled={!selectedEmployee}
                className={activeTab === "timetracking" ? "bg-cyanBlue hover:bg-cyanBlue/90 text-black" : ""}
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Registro de Horas</span>
              </Button>
              
              <Button 
                variant={activeTab === "settings" ? "default" : "outline"}
                onClick={() => setActiveTab("settings")}
                className={activeTab === "settings" ? "bg-cyanBlue hover:bg-cyanBlue/90 text-black" : ""}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Configurações</span>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto max-w-6xl flex-grow">
          <div className="flex flex-col gap-6">
            <div className="w-full">
              {activeTab === "employees" && (
                <>
                  {showNewEmployeeForm ? (
                    <EmployeeForm onCancel={handleCancelEmployeeForm} />
                  ) : (
                    <EmployeeList 
                      onAddNew={handleAddNewEmployee}
                      onSelect={handleSelectEmployee}
                    />
                  )}
                </>
              )}
              
              {activeTab === "timetracking" && selectedEmployee && (
                <>
                  {selectedDate ? (
                    <TimeEntryForm 
                      employee={selectedEmployee}
                      date={selectedDate}
                      onBack={handleBackFromTimeEntry}
                    />
                  ) : (
                    <TimeTrackingSummary 
                      employee={selectedEmployee}
                      onSelectDate={handleSelectDate}
                    />
                  )}
                </>
              )}
              
              {activeTab === "settings" && (
                <SystemSettings />
              )}
            </div>
          </div>
        </main>
        
        <footer className="container mx-auto max-w-6xl mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 Horario Control · Controle de Banco de Horas</p>
        </footer>
      </div>
    </AppProvider>
  );
};

export default Index;
