import { useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { eachDayOfInterval, startOfMonth, endOfMonth, format, parseISO, isBefore } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, CATEGORY_COLORS, type ExpenseCategory } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
  expenses: Expense[];
  month: Date;
}

export function ExpenseCharts({ expenses, month }: Props) {
  const { formatAmount } = useCurrency();

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const dailyData = useMemo(() => {
    const start = startOfMonth(month);
    const end = isBefore(endOfMonth(month), new Date()) ? endOfMonth(month) : new Date();
    const days = eachDayOfInterval({ start, end });
    const dayTotals: Record<string, number> = {};
    expenses.forEach((e) => { dayTotals[e.date] = (dayTotals[e.date] || 0) + e.amount; });
    return days.map((d) => ({
      day: format(d, "d"),
      amount: dayTotals[format(d, "yyyy-MM-dd")] || 0,
    }));
  }, [expenses, month]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Category</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {categoryData.length > 0 ? (
            <>
              <div className="w-[140px] h-[140px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                    >
                      {categoryData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name as ExpenseCategory] || CATEGORY_COLORS.Other}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat.name as ExpenseCategory] || CATEGORY_COLORS.Other }}
                      />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">{formatAmount(cat.value)}</span>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {total ? Math.round((cat.value / total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center w-full">No data yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Daily Spending</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length > 0 ? (
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md">
                          <span className="font-medium">{formatAmount(payload[0].value as number)}</span>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
