"use client";

import { createClient } from "@/utils/supabase/client";
import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ===== Types =====
type TransactionData = {
  date: string;
  amount: number;
  count: number;
};

type CategoryButtonProps = {
  category: keyof typeof chartConfig;
  isActive: boolean;
  totals: { amount: number; count: number };
  onClick: () => void;
};

// ===== Constants =====
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

// ===== Helper Components =====
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

// ===== Main Component =====
export function LineTransactions() {
  // ===== State Management =====
  const id = "line-transactions";
  const [activeCategory, setActiveCategory] =
    React.useState<keyof typeof chartConfig>("food");
  const [chartData, setChartData] = React.useState<TransactionData[]>([]);
  const [categoryTotals, setCategoryTotals] = React.useState<{
    [key: string]: { amount: number; count: number };
  }>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [timeRange, setTimeRange] = React.useState("90d");
  const [oldestTransactionDate, setOldestTransactionDate] =
    React.useState<Date | null>(null);
  const [newestTransactionDate, setNewestTransactionDate] =
    React.useState<Date | null>(null);

  // ===== Helper Functions =====
  const fetchTransactionDateRange = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Fetch oldest transaction
      const { data: oldestData, error: oldestError } = await supabase
        .from("transactions")
        .select("date")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .limit(1);

      if (oldestError) throw oldestError;
      if (oldestData && oldestData.length > 0) {
        setOldestTransactionDate(new Date(oldestData[0].date));
      }

      // Fetch newest transaction
      const { data: newestData, error: newestError } = await supabase
        .from("transactions")
        .select("date")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1);

      if (newestError) throw newestError;
      if (newestData && newestData.length > 0) {
        setNewestTransactionDate(new Date(newestData[0].date));
      }
    } catch (error) {
      console.error("Error fetching transaction date range:", error);
    }
  }, []);

  const getStartDate = () => {
    if (timeRange === "lifetime") {
      return oldestTransactionDate || new Date(0);
    }

    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "1y") {
      daysToSubtract = 365;
    } else if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return startDate;
  };

  const getEndDate = () => {
    if (timeRange === "lifetime") {
      return newestTransactionDate || new Date();
    }
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  };

  // ===== Data Fetching =====
  const fetchAllCategoryTotals = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const startDate = getStartDate();
      const endDate = getEndDate();

      const query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .lte("date", endDate.toISOString());

      if (timeRange !== "lifetime") {
        query.gte("date", startDate.toISOString());
      }

      const { data, error } = await query;

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
  }, [timeRange, oldestTransactionDate]);

  const fetchTransactionData = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const startDate = getStartDate();
      const endDate = getEndDate();

      const query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", activeCategory)
        .lte("date", endDate.toISOString())
        .order("date", { ascending: true });

      if (timeRange !== "lifetime") {
        query.gte("date", startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Create array of all dates in range
      const allDates: TransactionData[] = [];
      const currentDate = new Date(startDate);
      const finalEndDate = getEndDate();

      while (currentDate <= finalEndDate) {
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
  }, [activeCategory, timeRange, oldestTransactionDate]);

  // ===== Data Filtering =====
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const endDate = getEndDate();
    if (timeRange === "lifetime") {
      return date <= endDate;
    }
    const startDate = getStartDate();
    return date >= startDate && date <= endDate;
  });

  // ===== Effects =====
  React.useEffect(() => {
    fetchTransactionDateRange();
  }, [fetchTransactionDateRange]);

  React.useEffect(() => {
    fetchAllCategoryTotals();
  }, [fetchAllCategoryTotals]);

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
              <CardTitle>Your Transactions</CardTitle>
              <CardDescription>
                Your spending trends over time by category
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
    <Card>
      <CardHeader className="space-y-0 border-b p-0">
        <div className="flex flex-wrap justify-between">
          <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Your Transactions</CardTitle>
            <CardDescription>
              Your spending trends over time by category
            </CardDescription>
          </div>
          <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[120px] rounded-lg sm:ml-auto"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 90d" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="7d" className="rounded-lg">
                  Last 7d
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30d
                </SelectItem>
                <SelectItem value="90d" className="rounded-lg">
                  Last 90d
                </SelectItem>
                <SelectItem value="1y" className="rounded-lg">
                  Last 1 year
                </SelectItem>
                <SelectItem value="lifetime" className="rounded-lg">
                  Lifetime
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            data={filteredData}
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
