
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, 
  Trash, 
  ArrowUp, 
  ArrowDown,
  ArrowRight
} from "lucide-react";
import { minutesToTime } from "@/utils/timeUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/AppContext";

interface MonthSummaryProps {
  formattedMonth: string;
  monthSummary: {
    totalWorkedMinutes: number;
    totalExpectedMinutes: number;
    totalWorkingDays: number;
    filledDays: number;
  };
  previousMonthBalance: number;
  monthlyBalance: number;
  accumulatedBalance: number;
  resetMonthBalance: () => void;
  isCurrentMonth: boolean;
}

const MonthSummary: React.FC<MonthSummaryProps> = ({ 
  formattedMonth, 
  monthSummary, 
  previousMonthBalance, 
  monthlyBalance, 
  accumulatedBalance,
  resetMonthBalance,
  isCurrentMonth
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const { toggleTransferBalanceOption, isTransferBalanceEnabled } = useAppContext();
  const [transferEnabled, setTransferEnabled] = useState(isTransferBalanceEnabled());
  
  useEffect(() => {
    setTransferEnabled(isTransferBalanceEnabled());
  }, [isTransferBalanceEnabled]);
  
  const handleReset = () => {
    resetMonthBalance();
    setShowResetDialog(false);
  };

  const handleTransferOptionChange = (checked: boolean) => {
    setTransferEnabled(checked);
    toggleTransferBalanceOption(checked);
  };
  
  return (
    <Card className="mb-4 bg-gray-800/50 border-none">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Resumo do Mês: {formattedMonth}
          </h3>
          <div className="flex gap-2">
            {isCurrentMonth && (
              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <ArrowRight className="h-4 w-4 mr-1" /> Transferência
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transferência de Saldo</DialogTitle>
                    <DialogDescription>
                      Ative esta opção para transferir o saldo do mês atual para o próximo mês automaticamente quando o mês terminar.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2 py-4">
                    <Switch 
                      id="transfer-mode" 
                      checked={transferEnabled} 
                      onCheckedChange={handleTransferOptionChange} 
                    />
                    <label htmlFor="transfer-mode">
                      {transferEnabled ? "Transferência automática ativada" : "Transferência automática desativada"}
                    </label>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Fechar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8">
                  <Trash className="h-4 w-4 mr-1" /> Zerar Saldo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar reinicialização</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja zerar o saldo do mês atual? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleReset}>
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Dias úteis:</div>
            <div className="text-lg font-medium">{monthSummary.totalWorkingDays} dias</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Dias registrados:</div>
            <div className="text-lg font-medium">{monthSummary.filledDays} de {monthSummary.totalWorkingDays}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Horas trabalhadas:</div>
            <div className="text-lg font-medium">{minutesToTime(monthSummary.totalWorkedMinutes)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Horas esperadas:</div>
            <div className="text-lg font-medium">{minutesToTime(monthSummary.totalExpectedMinutes)}</div>
          </div>
          
          <div className="col-span-2 pt-2 border-t border-gray-700">
            <div className="text-sm text-gray-400">Saldo anterior:</div>
            <div className={`text-lg font-medium flex items-center ${previousMonthBalance > 0 ? 'text-positive' : previousMonthBalance < 0 ? 'text-negative' : ''}`}>
              {previousMonthBalance === 0 ? (
                <span>00:00</span>
              ) : previousMonthBalance > 0 ? (
                <span className="flex items-center">
                  <ArrowUp className="h-5 w-5 mr-1" /> {minutesToTime(previousMonthBalance)}
                </span>
              ) : (
                <span className="flex items-center">
                  <ArrowDown className="h-5 w-5 mr-1" /> {minutesToTime(Math.abs(previousMonthBalance))}
                </span>
              )}
            </div>
          </div>
          
          <div className="col-span-2 pt-2 border-t border-gray-700">
            <div className="text-sm text-gray-400">Saldo do mês:</div>
            <div className={`text-lg font-medium flex items-center ${monthlyBalance > 0 ? 'text-positive' : monthlyBalance < 0 ? 'text-negative' : ''}`}>
              {monthlyBalance === 0 ? (
                <span>00:00</span>
              ) : monthlyBalance > 0 ? (
                <span className="flex items-center">
                  <ArrowUp className="h-5 w-5 mr-1" /> {minutesToTime(monthlyBalance)}
                </span>
              ) : (
                <span className="flex items-center">
                  <ArrowDown className="h-5 w-5 mr-1" /> {minutesToTime(Math.abs(monthlyBalance))}
                </span>
              )}
              <span className="text-sm text-gray-400 ml-2">({monthlyBalance > 0 ? 'positivo' : monthlyBalance < 0 ? 'negativo' : 'neutro'})</span>
            </div>
          </div>
          
          <div className="col-span-2 pt-2 border-t border-gray-700">
            <div className="text-sm text-gray-400">Saldo acumulado:</div>
            <div className={`text-lg font-medium flex items-center ${accumulatedBalance > 0 ? 'text-positive' : accumulatedBalance < 0 ? 'text-negative' : ''}`}>
              {accumulatedBalance === 0 ? (
                <span>00:00</span>
              ) : accumulatedBalance > 0 ? (
                <span className="flex items-center">
                  <ArrowUp className="h-5 w-5 mr-1" /> {minutesToTime(accumulatedBalance)}
                </span>
              ) : (
                <span className="flex items-center">
                  <ArrowDown className="h-5 w-5 mr-1" /> {minutesToTime(Math.abs(accumulatedBalance))}
                </span>
              )}
              <span className="text-sm text-gray-400 ml-2">({accumulatedBalance > 0 ? 'positivo' : accumulatedBalance < 0 ? 'negativo' : 'neutro'})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthSummary;
