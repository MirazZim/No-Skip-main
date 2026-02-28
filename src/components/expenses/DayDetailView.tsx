import { format } from "date-fns";
import { ArrowLeft, Plus,Pencil,Trash2 } from "lucide-react";
import { Expense, CATEGORY_COLORS, type ExpenseCategory } from "@/hooks/useExpenses";
import { Income, INCOME_SOURCE_COLORS, type IncomeSource } from "@/hooks/useIncomes";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useDeleteExpense } from "@/hooks/useExpenses";
import { useDeleteIncome } from "@/hooks/useIncomes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DayDetailViewProps {
  date: string;
  expenses: Expense[];
  incomes: Income[];
  onBack: () => void;
  onAddExpense: (date: string) => void;
  onAddIncome: (date: string) => void;
  onEditExpense?: (expense: Expense) => void;
  onEditIncome?: (income: Income) => void;
}

type TabType = "expenses" | "income";

export function DayDetailView({ date, expenses, incomes, onBack, onAddExpense, onAddIncome, onEditExpense, onEditIncome }: DayDetailViewProps) {
  const { formatAmount } = useCurrency();
  const deleteExpense = useDeleteExpense();
  const deleteIncome = useDeleteIncome();
  const [activeTab, setActiveTab] = useState<TabType>("expenses");

  const dayExpenses = expenses.filter((e) => e.date === date);
  const dayIncomes = incomes.filter((i) => i.date === date);
  const expenseTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);
  const incomeTotal = dayIncomes.reduce((s, i) => s + i.amount, 0);
  const displayDate = format(new Date(date + "T00:00:00"), "EEEE, MMMM d, yyyy");

  const categoryBreakdown = dayExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const sourceBreakdown = dayIncomes.reduce<Record<string, number>>((acc, i) => {
    acc[i.source] = (acc[i.source] || 0) + i.amount;
    return acc;
  }, {});

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome.mutateAsync(id);
      toast.success("Income deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold font-display">{displayDate}</h2>
            <p className="text-sm text-muted-foreground">
              {dayExpenses.length + dayIncomes.length} transaction{dayExpenses.length + dayIncomes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-1 rounded-2xl bg-muted/50 border border-border/40 p-1">
          <button
            onClick={() => setActiveTab("expenses")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200",
              activeTab === "expenses"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>💸</span>
            <span>Expenses</span>
            {dayExpenses.length > 0 && (
              <span className={cn(
                "text-[10px] tabular-nums px-1.5 py-0.5 rounded-full font-bold",
                activeTab === "expenses" ? "bg-muted text-foreground" : "bg-muted/60 text-muted-foreground"
              )}>
                {dayExpenses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("income")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200",
              activeTab === "income"
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>💰</span>
            <span>Income</span>
            {dayIncomes.length > 0 && (
              <span className={cn(
                "text-[10px] tabular-nums px-1.5 py-0.5 rounded-full font-bold",
                activeTab === "income" ? "bg-white/20 text-white" : "bg-muted/60 text-muted-foreground"
              )}>
                {dayIncomes.length}
              </span>
            )}
          </button>
        </div>

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <>
            {/* Header with total and add button */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Expenses</p>
                <p className="text-xs text-muted-foreground">Total: {formatAmount(expenseTotal)}</p>
              </div>
              <Button size="sm" onClick={() => onAddExpense(date)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Expense
              </Button>
            </div>

            {/* Category breakdown */}
            {Object.keys(categoryBreakdown).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => (
                    <div
                      key={cat}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1"
                    >
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat as ExpenseCategory] || CATEGORY_COLORS.Other }}
                      />
                      <span className="text-xs font-medium">{cat}</span>
                      <span className="text-xs text-muted-foreground">{formatAmount(amount)}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Transactions */}
            {dayExpenses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-3">💸</div>
                  <p className="text-sm text-muted-foreground">No expenses on this day</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {dayExpenses.map((exp) => (
                      <div key={exp.id} className="flex items-center gap-3 px-4 py-3 group">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[exp.category as ExpenseCategory] || CATEGORY_COLORS.Other }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{exp.category}</span>
                            <span className="text-sm font-semibold tabular-nums">{formatAmount(exp.amount)}</span>
                          </div>
                          {exp.note && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{exp.note}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => onEditExpense(exp)}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => handleDeleteExpense(exp.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* INCOME TAB */}
        {activeTab === "income" && (
          <>
            {/* Header with total and add button */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Income</p>
                <p className="text-xs text-emerald-600 font-semibold">Total: {formatAmount(incomeTotal)}</p>
              </div>
              <Button size="sm" onClick={() => onAddIncome(date)} className="gap-1.5 bg-emerald-500 hover:bg-emerald-600">
                <Plus className="h-3.5 w-3.5" />
                Add Income
              </Button>
            </div>

            {/* Source breakdown */}
            {Object.keys(sourceBreakdown).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(sourceBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, amount]) => (
                    <div
                      key={source}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1"
                    >
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: INCOME_SOURCE_COLORS[source as IncomeSource] || INCOME_SOURCE_COLORS.Other }}
                      />
                      <span className="text-xs font-medium">{source}</span>
                      <span className="text-xs text-emerald-600">{formatAmount(amount)}</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Transactions */}
            {dayIncomes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-3">💰</div>
                  <p className="text-sm text-muted-foreground">No income on this day</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {dayIncomes.map((inc) => (
                      <div key={inc.id} className="flex items-center gap-3 px-4 py-3 group">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: INCOME_SOURCE_COLORS[inc.source as IncomeSource] || INCOME_SOURCE_COLORS.Other }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{inc.source}</span>
                            <span className="text-sm font-semibold tabular-nums text-emerald-600">+{formatAmount(inc.amount)}</span>
                          </div>
                          {inc.note && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{inc.note}</p>
                          )}
                        </div>
            
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => handleDeleteIncome(inc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
