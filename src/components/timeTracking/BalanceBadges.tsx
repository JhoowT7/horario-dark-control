
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import { minutesToTime } from "@/utils/timeUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BalanceBadgesProps {
  previousMonthBalance: number;
  monthlyBalance: number;
  accumulatedBalance: number;
}

const BalanceBadges: React.FC<BalanceBadgesProps> = ({
  previousMonthBalance,
  monthlyBalance,
  accumulatedBalance
}) => {
  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 ${previousMonthBalance > 0 ? 'bg-positive/10 text-positive' : previousMonthBalance < 0 ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-gray-400'}`}
          >
            <span className="flex items-center">
              Ant: {previousMonthBalance === 0 ? (
                <span>00:00</span>
              ) : previousMonthBalance > 0 ? (
                <span className="flex items-center">
                  <ArrowUp className="h-4 w-4 ml-1 mr-1" /> {minutesToTime(previousMonthBalance)}
                </span>
              ) : (
                <span className="flex items-center">
                  <ArrowDown className="h-4 w-4 ml-1 mr-1" /> {minutesToTime(Math.abs(previousMonthBalance))}
                </span>
              )}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Saldo do mês anterior</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 ${monthlyBalance > 0 ? 'bg-positive/10 text-positive' : monthlyBalance < 0 ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-gray-400'}`}
          >
            {monthlyBalance === 0 ? (
              <span>Mês: 00:00</span>
            ) : monthlyBalance > 0 ? (
              <span className="flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(monthlyBalance)}
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(monthlyBalance))}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Saldo do mês atual</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 ${accumulatedBalance > 0 ? 'bg-positive/10 text-positive' : accumulatedBalance < 0 ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-gray-400'}`}
          >
            {accumulatedBalance === 0 ? (
              <span>Acumulado: 00:00</span>
            ) : accumulatedBalance > 0 ? (
              <span className="flex items-center">
                <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(accumulatedBalance)}
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(accumulatedBalance))}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Saldo acumulado de todos os meses</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default BalanceBadges;
