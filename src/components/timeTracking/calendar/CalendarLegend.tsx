
import React from "react";

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
        <div className="w-3 h-3 rounded-full bg-gray-800/50 mr-1"></div>
        <span className="text-gray-400">Feriado</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-cyanBlue/10 mr-1"></div>
        <span className="text-gray-400">Férias</span>
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
