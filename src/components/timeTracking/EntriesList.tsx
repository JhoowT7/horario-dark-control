
import React, { useEffect, useMemo, useState } from "react";
import { TimeEntry } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ArrowUp, ArrowDown } from "lucide-react";
import { format, parseISO, isSameMonth } from "date-fns";
import { minutesToTime } from "@/utils/timeUtils";
import EntriesListSkeleton from "./EntriesListSkeleton";

interface EntriesListProps {
  entries: TimeEntry[];
  currentMonth: Date;
  onSelectDate: (date: string) => void;
}

const EntriesList: React.FC<EntriesListProps> = ({ entries, currentMonth, onSelectDate }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(t);
  }, [currentMonth]);

  const currentMonthEntries = useMemo(() => {
    return entries
      .filter((entry) => isSameMonth(parseISO(entry.date), currentMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, currentMonth]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-medium">Registros do Mês</div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <EntriesListSkeleton />
      ) : currentMonthEntries.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="mx-auto h-8 w-8 opacity-30 mb-2" />
          <p>Nenhum registro de horas encontrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentMonthEntries.map((entry) => (
            <button
              key={entry.date}
              className="w-full text-left bg-gray-800/40 hover:bg-gray-800/60 p-3 rounded-md transition-colors"
              onClick={() => onSelectDate(entry.date)}
              type="button"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {format(new Date(entry.date), "dd/MM/yyyy")}
                    {entry.isHoliday && <Badge variant="outline">Feriado</Badge>}
                    {entry.isVacation && (
                      <Badge
                        variant="outline"
                        className="bg-cyanBlue/10 text-cyanBlue border-cyanBlue/20"
                      >
                        Férias
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {entry.isHoliday ? (
                      "Feriado"
                    ) : entry.isVacation ? (
                      "Férias"
                    ) : entry.entry && entry.exit ? (
                      <>
                        {entry.entry} - {entry.lunchOut || "-"} / {entry.lunchIn || "-"} - {entry.exit}
                      </>
                    ) : (
                      "Ausência"
                    )}
                  </div>
                </div>
                <div
                  className={`text-right ${
                    entry.balanceMinutes > 0
                      ? "text-positive"
                      : entry.balanceMinutes < 0
                        ? "text-negative"
                        : ""
                  }`}
                >
                  {entry.balanceMinutes === 0 ? (
                    <span>00:00</span>
                  ) : entry.balanceMinutes > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp className="h-4 w-4 mr-1" /> {minutesToTime(entry.balanceMinutes)}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ArrowDown className="h-4 w-4 mr-1" /> {minutesToTime(Math.abs(entry.balanceMinutes))}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntriesList;

