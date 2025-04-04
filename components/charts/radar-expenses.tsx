"use client";

import { createClient } from "@/utils/supabase/client";
import * as React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ===== Types =====
type CategoryData = {
  category: string;
  amount: number;
  originalCategory: string;
};

// ===== Constants =====
const TIME_PERIODS = [
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
  { value: "90d", label: "Last 90d" },
  { value: "1y", label: "Last 1y" },
] as const;

const CATEGORIES = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "shopping",
  "other",
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
export function RadarExpenses() {
  // ===== State Management =====
  const id = "radar-expenses";
  const [timePeriod, setTimePeriod] = React.useState("90d");
  const [chartData, setChartData] = React.useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const supabase = createClient();

  // ===== Helper Functions =====
  const getStartDate = React.useCallback(() => {
    const referenceDate = new Date();
    const currentYear = referenceDate.getFullYear();
    const currentMonth = referenceDate.getMonth();
    
    if (timePeriod === "1y") {
      // For yearly view, show all months up to current month
      return new Date(currentYear, 0, 1); // Start of current year
    } else {
      // For other periods, calculate days to subtract
      let daysToSubtract = 90;
      if (timePeriod === "30d") {
        daysToSubtract = 30;
      } else if (timePeriod === "7d") {
        daysToSubtract = 7;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return startDate;
    }
  }, [timePeriod]);

  // ===== Data Fetching =====
  const fetchTransactionData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const startDate = getStartDate();
      const endDate = new Date();

      const { data: transactions, error } = await supabase
        .from("transactions")
        .select("amount, category")
        .eq("user_id", user.id)
        .not("category", "eq", "income")
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());

      if (error) throw error;

      if (transactions) {
        const categoryTotals = transactions.reduce(
          (acc, transaction) => {
            const category = transaction.category as keyof typeof chartConfig;
            if (!acc[category]) {
              acc[category] = 0;
            }
            acc[category] += Math.abs(transaction.amount);
            return acc;
          },
          {} as Record<string, number>
        );

        // Ensure all categories are represented
        CATEGORIES.forEach((category) => {
          if (!(category in categoryTotals)) {
            categoryTotals[category] = 0;
          }
        });

        const formattedData = Object.entries(categoryTotals)
          .filter(([category]) =>
            CATEGORIES.includes(category as (typeof CATEGORIES)[number])
          )
          .map(([category, amount]) => ({
            category: chartConfig[category as keyof typeof chartConfig].label,
            amount: amount,
            originalCategory: category,
          }));

        setChartData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getStartDate, supabase]);

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
              <CardTitle>Expense Categories Comparison</CardTitle>
              <CardDescription>
                Compare spending across different categories
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
    <Card data-chart={id}>
      <CardHeader className="space-y-0 border-b p-0">
        <div className="flex flex-wrap justify-between">
          <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Expense Categories Comparison</CardTitle>
            <CardDescription>
              Compare spending across different categories
            </CardDescription>
          </div>
          <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[120px] rounded-lg sm:ml-auto">
                <SelectValue placeholder="Last 90d" />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              name="Amount"
              dataKey="amount"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                const data = payload[0]?.payload;
                if (!data) return null;

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-muted-foreground">
                          {data.category}
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                background:
                                  chartConfig[
                                    data.originalCategory as keyof typeof chartConfig
                                  ]?.color,
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              Amount
                            </span>
                          </div>
                          <div className="text-xs tabular-nums">
                            ${Number(data.amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
