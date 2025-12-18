
import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Employee } from "@/types";
import { minutesToTime } from "@/utils/timeUtils";
import MissingEntriesListSkeleton from "./MissingEntriesListSkeleton";

interface MissingEntriesListProps {
  missingEntries: string[];
  formattedMonth: string;
  onSelectDate: (date: string) => void;
  employee: Employee;
}

const MissingEntriesList: React.FC<MissingEntriesListProps> = ({
  missingEntries,
  formattedMonth,
  onSelectDate,
  employee,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(t);
  }, [formattedMonth]);

  const sorted = useMemo(() => {
    return [...missingEntries].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [missingEntries]);

  const handleMissingEntryClick = (dateStr: string, e: React.MouseEvent) => {
    e.preventDefault();
    onSelectDate(dateStr);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="font-medium">Registros Pendentes</div>
        <div className="text-sm text-gray-400">{formattedMonth}</div>
      </div>

      {isLoading ? (
        <MissingEntriesListSkeleton />
      ) : sorted.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <CheckCircle className="mx-auto h-8 w-8 opacity-30 mb-2" />
          <p>Todos os dias deste mês estão registrados!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((dateStr) => (
            <button
              key={dateStr}
              className="w-full text-left bg-negative/5 hover:bg-negative/10 p-3 rounded-md transition-colors border border-negative/20"
              onClick={(e) => handleMissingEntryClick(dateStr, e)}
              type="button"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {format(new Date(dateStr), "dd/MM/yyyy")}
                    <Badge variant="destructive" className="bg-negative/20 text-negative border-none">
                      Pendente
                    </Badge>
                  </div>
                  <div className="text-sm text-negative/80">
                    Saldo: -{minutesToTime(employee.expectedMinutesPerDay)} (Clique para registrar este dia)
                  </div>
                </div>
                <AlertCircle className="text-negative h-5 w-5" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MissingEntriesList;

