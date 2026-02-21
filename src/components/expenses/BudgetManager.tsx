import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUpsertBudget, useDeleteBudget, EXPENSE_CATEGORIES, Budget, Expense, CATEGORY_COLORS, type ExpenseCategory } from "@/hooks/useExpenses";
import { useCurrency } from "@/hooks/useCurrency";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  budgets: Budget[];
  expenses: Expense[];
  month: Date;
}

export function BudgetManager({ budgets, expenses, month }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Overall");
  const [amount, setAmount] = useState("");
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();
  const { formatAmount } = useCurrency();

  const categoryBudgets = budgets.filter((b) => b.category !== "Overall");

  const handleSave = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    try {
      await upsertBudget.mutateAsync({ amount: num, category, month });
      toast.success("Budget saved");
      setAmount("");
    } catch {
      toast.error("Failed to save budget");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget.mutateAsync(id);
      toast.success("Budget removed");
    } catch {
      toast.error("Failed to remove budget");
    }
  };

  return (
    <>
      {categoryBudgets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Category Budgets</h3>
          {categoryBudgets.map((b) => {
            const spent = expenses.filter((e) => e.category === b.category).reduce((s, e) => s + e.amount, 0);
            const pct = Math.min((spent / b.amount) * 100, 100);
            const status = pct >= 90 ? "destructive" : pct >= 70 ? "warning" : "success";
            return (
              <div key={b.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[b.category as ExpenseCategory] || CATEGORY_COLORS.Other }}
                    />
                    <span>{b.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground tabular-nums">
                      {formatAmount(spent)} / {formatAmount(b.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleDeleteBudget(b.id)}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Progress
                  value={pct}
                  className={cn("h-1.5",
                    status === "destructive" && "[&>div]:bg-destructive",
                    status === "warning" && "[&>div]:bg-warning",
                    status === "success" && "[&>div]:bg-success"
                  )}
                />
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-3.5 w-3.5" />
            Set Budget
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Set Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Overall">Overall</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} className="w-full" disabled={upsertBudget.isPending}>
              Save Budget
            </Button>

            {/* Existing budgets with clear buttons */}
            {budgets.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-muted-foreground">Active Budgets</Label>
                {budgets.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <span>{b.category}: {formatAmount(b.amount)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteBudget(b.id)}
                    >
                      Clear
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
