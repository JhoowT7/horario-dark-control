
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useAppContext } from "./contexts/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Components
import TimeTrackingSummary from "./components/TimeTrackingSummary";
import TimeEntryForm from "./components/TimeEntryForm";
import EmployeeList from "./components/EmployeeList";
import EmployeeForm from "./components/EmployeeForm";
import SystemSettings from "./components/SystemSettings";
import LoginForm from "./components/LoginForm";
import UserProfile from "./components/UserProfile";

const AppContent = () => {
  const { 
    selectedEmployee, 
    selectedDate, 
    setSelectedDate, 
    getCurrentDate, 
    setSelectedEmployee,
    employees
  } = useAppContext();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("timeTracking");
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
  
  // Always reset to today's date on load
  useEffect(() => {
    setSelectedDate(getCurrentDate());
  }, []);
  
  // Reset entry form view when employee or date changes
  useEffect(() => {
    setShowEntryForm(false);
  }, [selectedEmployee, selectedDate]);
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setShowEntryForm(true);
  };
  
  const handleBackFromEntryForm = () => {
    setShowEntryForm(false);
  };
  
  const handleLogout = () => {
    setSelectedEmployee(null);
    setIsLoggedIn(false);
  };

  const handleAddNewEmployee = () => {
    setShowNewEmployeeForm(true);
  };

  const handleCancelEmployeeForm = () => {
    setShowNewEmployeeForm(false);
  };

  const handleSelectEmployee = (employee: any) => {
    setSelectedEmployee(employee);
  };
  
  // If not logged in, show login form
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  }
  
  // If no employee is selected, handle according to role
  if (!selectedEmployee) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Erro: Nenhum funcionário selecionado</h1>
        <button 
          onClick={() => setIsLoggedIn(false)}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Voltar para Login
        </button>
      </div>
    );
  }
  
  // Check if user is admin
  const isAdmin = selectedEmployee.isAdmin === true;
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Controle de Ponto</h1>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-cyanBlue/20 rounded-full text-sm">
            {selectedEmployee.name} {isAdmin ? "(Admin)" : ""}
          </span>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500/30 rounded-full text-sm hover:bg-red-500/50"
          >
            Sair
          </button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="timeTracking">Registro de Horas</TabsTrigger>
          {isAdmin && <TabsTrigger value="employees">Funcionários</TabsTrigger>}
          {isAdmin && <TabsTrigger value="settings">Configurações</TabsTrigger>}
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeTracking" className="space-y-6">
          {!showEntryForm ? (
            selectedEmployee && (
              <TimeTrackingSummary
                employee={selectedEmployee}
                onSelectDate={handleSelectDate}
              />
            )
          ) : (
            selectedEmployee && (
              <TimeEntryForm
                employee={selectedEmployee}
                date={selectedDate}
                onBack={handleBackFromEntryForm}
              />
            )
          )}
        </TabsContent>
        
        <TabsContent value="employees">
          {isAdmin && (
            showNewEmployeeForm ? (
              <EmployeeForm onCancel={handleCancelEmployeeForm} />
            ) : (
              <EmployeeList 
                onAddNew={handleAddNewEmployee}
                onSelect={handleSelectEmployee}
              />
            )
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          {isAdmin && <SystemSettings />}
        </TabsContent>
        
        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AppProvider>
  );
}

export default App;
