import { useState } from "react";
import { format } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { Expense, useDeleteExpense, CATEGORY_COLORS, type ExpenseCategory } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import { EditExpenseDialog } from "./EditExpenseDialog";
import { toast } from "sonner";

interface ExpenseListProps {
  expenses: Expense[];
  title?: string;
}

export function ExpenseList({ expenses, title }: ExpenseListProps) {
  const { formatAmount } = useCurrency();
  const deleteExpense = useDeleteExpense();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Group by date
  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
    (acc[exp.date] ??= []).push(exp);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!expenses.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No expenses this month. Tap + to add one.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {title && <h2 className="text-lg font-semibold font-display">{title}</h2>}
        {sortedDates.map((date) => {
          const dayExpenses = grouped[date];
          const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);

          return (
            <div key={date} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
                <span className="text-sm font-medium">{format(new Date(date + "T00:00:00"), "EEEE, MMM d")}</span>
                <span className="text-sm font-semibold">{formatAmount(dayTotal)}</span>
              </div>
              <div className="divide-y divide-border">
                {dayExpenses.map((exp) => (
                  <div key={exp.id} className="flex items-center gap-3 px-4 py-3 group">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
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
                      onClick={() => setEditingExpense(exp)}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => handleDelete(exp.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <EditExpenseDialog
        expense={editingExpense}
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      />
    </>
  );
}
