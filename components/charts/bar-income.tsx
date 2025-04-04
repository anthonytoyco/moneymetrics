"use client";

import { createClient } from "@/utils/supabase/client";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";

// ===== Types =====
type MonthlyData = {
  month: string;
  income: number;
  expenses: number;
};

// ===== Constants =====
const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// ===== Main Component =====
export function BarIncome() {
  // ===== State Management =====
  const id = "bar-income";
  const [monthlyData, setMonthlyData] = React.useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // ===== Data Fetching =====
  const fetchTransactionData = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", `${currentYear}-01-01`)
        .lte("date", `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`);

      if (error) throw error;

      // Initialize monthly data with zero amounts
      const initialData = MONTHS.map((month) => ({
        month: month.charAt(0).toUpperCase() + month.slice(1),
        income: 0,
        expenses: 0,
      }));

      // Aggregate transactions by month and type (income/expenses)
      data.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = MONTHS[date.getMonth()];
        const monthData = initialData.find(
          (item) => item.month.toLowerCase() === month
        );
        if (monthData) {
          if (transaction.category === "income") {
            monthData.income += Math.abs(transaction.amount);
          } else {
            monthData.expenses += Math.abs(transaction.amount);
          }
        }
      });

      setMonthlyData(initialData);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== Effects =====
  React.useEffect(() => {
    fetchTransactionData();
  }, [fetchTransactionData]);

  // ===== Loading State =====
  if (isLoading) {
    return (
      <Card data-chart={id}>
        <CardHeader className="space-y-0 border-b p-0">
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Monthly Income vs Expenses</CardTitle>
              <CardDescription>
                Comparison of monthly income and expenses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex h-[350px] items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading data...</div>
        </CardContent>
      </Card>
    );
  }

  // ===== Render =====
  return (
    <Card data-chart={id} className="flex flex-col">
      <CardHeader className="space-y-0 border-b p-0">
        <div className="flex flex-wrap justify-between">
          <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Monthly Income vs Expenses</CardTitle>
            <CardDescription>
              Comparison of monthly income and expenses
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={monthlyData}
            margin={{
              left: 12,
              right: 12,
              top: 24,
              bottom: 12,
            }}
            barSize={40}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload) return null;

                const income =
                  payload.find((p) => p.dataKey === "income")?.value || 0;
                const expenses =
                  payload.find((p) => p.dataKey === "expenses")?.value || 0;
                const net = Number(income) - Number(expenses);

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-muted-foreground">
                          {payload[0]?.payload.month}
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ background: chartConfig.income.color }}
                            />
                            <span className="text-xs text-muted-foreground">
                              Income
                            </span>
                          </div>
                          <div className="text-xs tabular-nums">
                            ${Number(income).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ background: chartConfig.expenses.color }}
                            />
                            <span className="text-xs text-muted-foreground">
                              Expenses
                            </span>
                          </div>
                          <div className="text-xs tabular-nums">
                            ${Number(expenses).toLocaleString()}
                          </div>
                        </div>
                        <div className="my-1 border-t" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">Net</span>
                          <div
                            className={`text-xs font-medium tabular-nums ${net >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            ${Number(net).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <ChartLegend
              content={<ChartLegendContent className="flex flex-wrap gap-4" />}
            />
            <Bar
              dataKey="income"
              fill={chartConfig.income.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill={chartConfig.expenses.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
