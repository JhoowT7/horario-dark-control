
import React from "react";
import { Check } from "lucide-react";

const CalendarLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 mt-2 text-xs">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-positive/10 mr-1"></div>
        <span className="text-gray-400">Saldo positivo</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-negative/10 mr-1"></div>
        <span className="text-gray-400">Saldo negativo</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-cyanBlue/5 border border-cyanBlue/20 mr-1 flex items-center justify-center">
          <Check className="w-2 h-2 text-cyanBlue/70" />
        </div>
        <span className="text-gray-400">Jornada completa</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-gray-800/50 mr-1"></div>
        <span className="text-gray-400">Feriado</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-cyanBlue/10 mr-1"></div>
        <span className="text-gray-400">Férias</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-orange-500/10 mr-1"></div>
        <span className="text-gray-400">Atestado</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-negative/5 border border-negative/20 mr-1"></div>
        <span className="text-gray-400">Pendente</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full border border-cyanBlue/50 mr-1"></div>
        <span className="text-gray-400">Hoje</span>
      </div>
    </div>
  );
};

export default CalendarLegend;
