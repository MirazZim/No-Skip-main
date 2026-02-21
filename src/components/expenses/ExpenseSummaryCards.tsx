import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Expense, Budget } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  expenses: Expense[];
  prevExpenses: Expense[];
  budgets: Budget[];
}

export function ExpenseSummaryCards({ expenses, prevExpenses, budgets }: Props) {
  const { formatAmount } = useCurrency();

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
  const changePercent = prevTotal ? Math.round(((totalSpend - prevTotal) / prevTotal) * 100) : 0;

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weeklySpend = expenses
    .filter((e) => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    })
    .reduce((s, e) => s + e.amount, 0);

  // Highest spending day
  const dayTotals: Record<string, number> = {};
  expenses.forEach((e) => { dayTotals[e.date] = (dayTotals[e.date] || 0) + e.amount; });
  const highestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];

  // Overall budget
  const overallBudget = budgets.find((b) => b.category === "Overall");
  const budgetProgress = overallBudget ? Math.min((totalSpend / overallBudget.amount) * 100, 100) : null;
  const budgetStatus = budgetProgress !== null
    ? budgetProgress >= 90 ? "destructive" : budgetProgress >= 70 ? "warning" : "success"
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Total Spend</p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold font-display mt-1">{formatAmount(totalSpend)}</p>
          <div className="flex items-center gap-1 mt-1">
            {changePercent > 0 ? (
              <TrendingUp className="h-3 w-3 text-destructive" />
            ) : changePercent < 0 ? (
              <TrendingDown className="h-3 w-3 text-success" />
            ) : (
              <Minus className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={cn("text-xs", changePercent > 0 ? "text-destructive" : changePercent < 0 ? "text-success" : "text-muted-foreground")}>
              {Math.abs(changePercent)}% vs last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">This Week</p>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold font-display mt-1">{formatAmount(weeklySpend)}</p>
          <p className="text-xs text-muted-foreground mt-1">{expenses.length} transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Highest Day</p>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          {highestDay ? (
            <>
              <p className="text-2xl font-bold font-display mt-1">{formatAmount(highestDay[1])}</p>
              <p className="text-xs text-muted-foreground mt-1">{format(parseISO(highestDay[0]), "MMM d")}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No data</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Budget</p>
          </div>
          {overallBudget ? (
            <>
              <p className="text-2xl font-bold font-display mt-1">
                {formatAmount(totalSpend)}{" "}
                <span className="text-sm font-normal text-muted-foreground">/ {formatAmount(overallBudget.amount)}</span>
              </p>
              <Progress
                value={budgetProgress!}
                className={cn("mt-2 h-2", 
                  budgetStatus === "destructive" && "[&>div]:bg-destructive",
                  budgetStatus === "warning" && "[&>div]:bg-warning",
                  budgetStatus === "success" && "[&>div]:bg-success"
                )}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No budget set</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
