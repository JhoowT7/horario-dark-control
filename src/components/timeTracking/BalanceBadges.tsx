
import React from "react";
import { Badge } from "@/components/ui/badge";
import { minutesToTime } from "@/utils/timeUtils";
import { ArrowUp, ArrowDown } from "lucide-react";

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
    <div className="flex flex-wrap gap-2 justify-end">
      <Badge variant="outline" className="border-gray-600 text-xs">
        Anterior:&nbsp;
        {previousMonthBalance === 0 ? (
          "00:00"
        ) : previousMonthBalance > 0 ? (
          <span className="flex items-center text-positive">
            <ArrowUp className="h-3 w-3 mr-0.5" />
            {minutesToTime(previousMonthBalance)}
          </span>
        ) : (
          <span className="flex items-center text-negative">
            <ArrowDown className="h-3 w-3 mr-0.5" />
            {minutesToTime(Math.abs(previousMonthBalance))}
          </span>
        )}
      </Badge>
      
      <Badge variant="outline" className="border-gray-600 text-xs">
        Mês:&nbsp;
        {monthlyBalance === 0 ? (
          "00:00"
        ) : monthlyBalance > 0 ? (
          <span className="flex items-center text-positive">
            <ArrowUp className="h-3 w-3 mr-0.5" />
            {minutesToTime(monthlyBalance)}
          </span>
        ) : (
          <span className="flex items-center text-negative">
            <ArrowDown className="h-3 w-3 mr-0.5" />
            {minutesToTime(Math.abs(monthlyBalance))}
          </span>
        )}
      </Badge>
      
      <Badge 
        variant={accumulatedBalance > 0 ? "default" : accumulatedBalance < 0 ? "destructive" : "outline"}
        className={`${accumulatedBalance === 0 ? 'border-gray-600' : ''}`}
      >
        Saldo atual:&nbsp;
        {accumulatedBalance === 0 ? (
          "00:00"
        ) : accumulatedBalance > 0 ? (
          <span className="flex items-center">
            <ArrowUp className="h-3 w-3 mr-0.5" />
            {minutesToTime(accumulatedBalance)}
          </span>
        ) : (
          <span className="flex items-center">
            <ArrowDown className="h-3 w-3 mr-0.5" />
            {minutesToTime(Math.abs(accumulatedBalance))}
          </span>
        )}
      </Badge>
    </div>
  );
};

export default BalanceBadges;
