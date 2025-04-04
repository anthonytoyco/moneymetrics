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
type MonthlyCategoryData = {
  month: string;
  food: number;
  transport: number;
  utilities: number;
  entertainment: number;
  shopping: number;
  other: number;
};

// ===== Constants =====
const CATEGORIES = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "shopping",
  "other",
] as const;

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
  food: {
    label: "Food",
    color: "hsl(var(--chart-1))",
  },
  transport: {
    label: "Transport",
    color: "hsl(var(--chart-2))",
  },
  utilities: {
    label: "Utilities",
    color: "hsl(var(--chart-3))",
  },
  entertainment: {
    label: "Entertainment",
    color: "hsl(var(--chart-4))",
  },
  shopping: {
    label: "Shopping",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-6))",
  },
} satisfies ChartConfig;

// ===== Main Component =====
export function BarAmount() {
  // ===== State Management =====
  const id = "bar-amount";
  const [monthlyData, setMonthlyData] = React.useState<MonthlyCategoryData[]>(
    []
  );
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
        food: 0,
        transport: 0,
        utilities: 0,
        entertainment: 0,
        shopping: 0,
        other: 0,
      }));

      // Aggregate transactions by month and category
      data.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = MONTHS[date.getMonth()];
        const monthData = initialData.find(
          (item) => item.month.toLowerCase() === month
        );
        if (monthData) {
          monthData[transaction.category as keyof typeof chartConfig] +=
            Math.abs(transaction.amount);
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
              <CardTitle>Monthly Spending by Category</CardTitle>
              <CardDescription>
                Breakdown of spending across different categories
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
            <CardTitle>Monthly Spending by Category</CardTitle>
            <CardDescription>
              Breakdown of spending across different categories
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

                const total = payload.reduce(
                  (sum, p) => sum + ((p.value as number) || 0),
                  0
                );

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-muted-foreground">
                          {payload[0]?.payload.month}
                        </div>
                      </div>
                      <div className="grid gap-1">
                        {CATEGORIES.map((category) => {
                          const value = payload.find(
                            (p) => p.dataKey === category
                          )?.value;
                          if (!value) return null;
                          return (
                            <div
                              key={category}
                              className="flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-1">
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    background: chartConfig[category].color,
                                  }}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {chartConfig[category].label}
                                </span>
                              </div>
                              <div className="text-xs tabular-nums">
                                ${Number(value).toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                        <div className="my-1 border-t" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">Total</span>
                          <div className="text-xs font-medium tabular-nums">
                            ${Number(total).toLocaleString()}
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
            {CATEGORIES.map((category, index) => (
              <Bar
                key={category}
                dataKey={category}
                stackId="a"
                fill={chartConfig[category].color}
                radius={[4, 4, 4, 4]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
