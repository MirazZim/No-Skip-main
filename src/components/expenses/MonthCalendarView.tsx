import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isToday,
  isFuture,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, CATEGORY_COLORS, type ExpenseCategory } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

interface Props {
  expenses: Expense[];
  month: Date;
  onDayClick?: (date: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthCalendarView({ expenses, month, onDayClick }: Props) {
  const { formatAmount } = useCurrency();

  const { days, leadingBlanks, dayExpenseMap } = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const allDays = eachDayOfInterval({ start, end });

    // Monday = 0
    const firstDow = (getDay(start) + 6) % 7;

    const map: Record<string, { total: number; categories: Record<string, number> }> = {};
    expenses.forEach((e) => {
      if (!map[e.date]) map[e.date] = { total: 0, categories: {} };
      map[e.date].total += e.amount;
      map[e.date].categories[e.category] = (map[e.date].categories[e.category] || 0) + e.amount;
    });

    return { days: allDays, leadingBlanks: firstDow, dayExpenseMap: map };
  }, [expenses, month]);

  const maxDayTotal = useMemo(() => {
    return Math.max(1, ...Object.values(dayExpenseMap).map((d) => d.total));
  }, [dayExpenseMap]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-[10px] text-muted-foreground text-center font-medium pb-1">
              {d}
            </div>
          ))}

          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}

          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const data = dayExpenseMap[dateStr];
            const today = isToday(day);
            const future = isFuture(day);
            const intensity = data ? Math.min(data.total / maxDayTotal, 1) : 0;

            // Top category for the dot color
            const topCategory = data
              ? Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0]?.[0]
              : null;

            return (
              <button
                key={dateStr}
                onClick={() => onDayClick?.(dateStr)}
                disabled={future}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg p-1 min-h-[52px] transition-colors text-xs",
                  "hover:bg-muted/80 focus-visible:ring-1 focus-visible:ring-ring",
                  today && "ring-1 ring-primary",
                  future && "opacity-40 cursor-default"
                )}
              >
                <span className={cn("text-[11px] tabular-nums", today && "font-bold text-primary")}>
                  {format(day, "d")}
                </span>
                {data ? (
                  <>
                    <span className="text-[10px] font-semibold tabular-nums mt-0.5 text-foreground">
                      {formatAmount(data.total)}
                    </span>
                    <div
                      className="absolute bottom-1 h-1 w-4 rounded-full"
                      style={{
                        backgroundColor: topCategory
                          ? CATEGORY_COLORS[topCategory as ExpenseCategory] || CATEGORY_COLORS.Other
                          : "hsl(var(--primary))",
                        opacity: 0.4 + intensity * 0.6,
                      }}
                    />
                  </>
                ) : !future ? (
                  <span className="text-[10px] text-muted-foreground/50 mt-0.5">—</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
