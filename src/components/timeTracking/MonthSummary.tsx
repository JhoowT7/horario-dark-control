
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Trash, 
  ArrowUp, 
  ArrowDown,
  ArrowRight,
  CalendarDays
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
import ProgressBar from "@/components/ui/progress-bar";

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
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setTransferEnabled(isTransferBalanceEnabled());
  }, [isTransferBalanceEnabled]);

  // Simulate loading for shimmer effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [formattedMonth]);
  
  const handleReset = () => {
    resetMonthBalance();
    setShowResetDialog(false);
  };

  // Update transfer option with immediate update to UI
  const handleTransferOptionChange = (checked: boolean) => {
    setTransferEnabled(checked);
    toggleTransferBalanceOption(checked);
  };

  const missingDays = monthSummary.totalWorkingDays - monthSummary.filledDays;
  const completionPercentage = monthSummary.totalWorkingDays > 0 
    ? (monthSummary.filledDays / monthSummary.totalWorkingDays) * 100 
    : 0;

  const ShimmerBlock = ({ className }: { className?: string }) => (
    <div className={`skeleton rounded ${className}`} />
  );
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 bg-gray-800/50 border-none overflow-hidden">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyanBlue" />
              <span>Resumo: {formattedMonth}</span>
              {missingDays > 0 && (
                <Badge variant="destructive" className="ml-2 animate-pulse-gentle">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {missingDays} pendente{missingDays > 1 ? 's' : ''}
                </Badge>
              )}
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

          {/* Progress bar for month completion */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ShimmerBlock className="h-6 w-full mb-4" />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4"
              >
                <ProgressBar 
                  value={monthSummary.filledDays}
                  max={monthSummary.totalWorkingDays}
                  label={`${monthSummary.filledDays} de ${monthSummary.totalWorkingDays} dias registrados`}
                  colorClass={completionPercentage === 100 ? "bg-positive" : "bg-cyanBlue"}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <ShimmerBlock className="h-4 w-20" />
                    <ShimmerBlock className="h-6 w-16" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-4"
              >
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
                  <motion.div 
                    className={`text-lg font-medium flex items-center ${previousMonthBalance > 0 ? 'text-positive' : previousMonthBalance < 0 ? 'text-negative' : ''}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
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
                  </motion.div>
                </div>
                
                <div className="col-span-2 pt-2 border-t border-gray-700">
                  <div className="text-sm text-gray-400">Saldo do mês:</div>
                  <motion.div 
                    className={`text-lg font-medium flex items-center ${monthlyBalance > 0 ? 'text-positive' : monthlyBalance < 0 ? 'text-negative' : ''}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
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
                  </motion.div>
                </div>
                
                <div className="col-span-2 pt-2 border-t border-gray-700">
                  <div className="text-sm text-gray-400">Saldo atual:</div>
                  <motion.div 
                    className={`text-lg font-medium flex items-center ${accumulatedBalance > 0 ? 'text-positive' : accumulatedBalance < 0 ? 'text-negative' : ''}`}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
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
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MonthSummary;
