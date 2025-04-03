"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { createClient } from "@/utils/supabase/client";

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
  ChartTooltipContent,
} from "@/components/ui/chart";

// Types
type TransactionData = {
  date: string;
  amount: number;
  count: number;
};

// Constants
const CATEGORIES = [
  "food",
  "transport",
  "utilities",
  "entertainment",
  "shopping",
  "income",
  "other",
] as const;

const chartConfig = {
  food: {
    label: "Food",
    color: "hsl(var(--chart-2))",
  },
  transport: {
    label: "Transport",
    color: "hsl(var(--chart-2))",
  },
  utilities: {
    label: "Utilities",
    color: "hsl(var(--chart-2))",
  },
  entertainment: {
    label: "Entertainment",
    color: "hsl(var(--chart-2))",
  },
  shopping: {
    label: "Shopping",
    color: "hsl(var(--chart-2))",
  },
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// Helper Components
type CategoryButtonProps = {
  category: keyof typeof chartConfig;
  isActive: boolean;
  totals: { amount: number; count: number };
  onClick: () => void;
};

const CategoryButton = ({
  category,
  isActive,
  totals,
  onClick,
}: CategoryButtonProps) => (
  <button
    key={category}
    data-active={isActive}
    className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
    onClick={onClick}
  >
    <span className="text-xs text-muted-foreground">
      {chartConfig[category].label}
    </span>
    <span className="text-m font-bold leading-none sm:text-3xl">
      ${totals.amount.toLocaleString()}
    </span>
    <span className="text-xs text-muted-foreground">
      {totals.count} transactions
    </span>
  </button>
);

// Main Component
export function ChartTransactions() {
  const [activeCategory, setActiveCategory] =
    React.useState<keyof typeof chartConfig>("food");
  const [chartData, setChartData] = React.useState<TransactionData[]>([]);
  const [categoryTotals, setCategoryTotals] = React.useState<{
    [key: string]: { amount: number; count: number };
  }>({});
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAllCategoryTotals = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const totals = data.reduce(
        (
          acc: { [key: string]: { amount: number; count: number } },
          transaction
        ) => {
          const category = transaction.category;
          if (!acc[category]) acc[category] = { amount: 0, count: 0 };
          acc[category].amount += Math.abs(transaction.amount);
          acc[category].count += 1;
          return acc;
        },
        {}
      );

      setCategoryTotals(totals);
    } catch (error) {
      console.error("Error fetching category totals:", error);
    }
  }, []);

  const fetchTransactionData = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", activeCategory)
        .order("date", { ascending: true });

      if (error) throw error;

      // Find the date range
      let startDate = new Date();
      let endDate = new Date();

      if (data.length > 0) {
        startDate = new Date(
          Math.min(...data.map((t) => new Date(t.date).getTime()))
        );
        endDate = new Date(
          Math.max(...data.map((t) => new Date(t.date).getTime()))
        );
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }

      // Create array of all dates in range
      const allDates: TransactionData[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        allDates.push({
          date: currentDate.toISOString().split("T")[0],
          amount: 0,
          count: 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create a map for quick lookup
      const dateMap = new Map(allDates.map((item) => [item.date, item]));

      // Aggregate transactions by date
      data.forEach((transaction) => {
        const date = new Date(transaction.date).toISOString().split("T")[0];
        const entry = dateMap.get(date);
        if (entry) {
          entry.amount += Math.abs(transaction.amount);
          entry.count += 1;
        }
      });

      setChartData(Array.from(dateMap.values()));
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory]);

  React.useEffect(() => {
    fetchAllCategoryTotals();
  }, [fetchAllCategoryTotals]);

  React.useEffect(() => {
    fetchTransactionData();
  }, [fetchTransactionData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="space-y-0 border-b p-0">
        <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Your Transactions</CardTitle>
          <CardDescription>
            Your spending trends over time by category
          </CardDescription>
        </div>
        <div className="flex flex-wrap">
          {CATEGORIES.map((category) => (
            <CategoryButton
              key={category}
              category={category}
              isActive={activeCategory === category}
              totals={categoryTotals[category] || { amount: 0, count: 0 }}
              onClick={() => setActiveCategory(category)}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[100px]"
                  nameKey="amount"
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between gap-1">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-mono font-medium">
                          $
                          {(
                            item.payload as TransactionData
                          ).amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Transactions:
                        </span>
                        <span className="font-mono font-medium">
                          {(item.payload as TransactionData).count}
                        </span>
                      </div>
                    </div>
                  )}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey="amount"
              type="monotone"
              stroke={chartConfig[activeCategory].color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
