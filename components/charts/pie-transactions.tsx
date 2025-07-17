"use client";

import { createClient } from "@/utils/supabase/client";
import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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
  ChartStyle,
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
type MonthlyTransactionData = {
  month: string;
  count: number;
  fill: string;
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
  january: {
    label: "January",
    color: "hsl(var(--chart-1))",
  },
  february: {
    label: "February",
    color: "hsl(var(--chart-2))",
  },
  march: {
    label: "March",
    color: "hsl(var(--chart-3))",
  },
  april: {
    label: "April",
    color: "hsl(var(--chart-4))",
  },
  may: {
    label: "May",
    color: "hsl(var(--chart-5))",
  },
  june: {
    label: "June",
    color: "hsl(var(--chart-1))",
  },
  july: {
    label: "July",
    color: "hsl(var(--chart-2))",
  },
  august: {
    label: "August",
    color: "hsl(var(--chart-3))",
  },
  september: {
    label: "September",
    color: "hsl(var(--chart-4))",
  },
  october: {
    label: "October",
    color: "hsl(var(--chart-5))",
  },
  november: {
    label: "November",
    color: "hsl(var(--chart-1))",
  },
  december: {
    label: "December",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

// ===== Helper Components =====
const MonthSelect = ({
  value,
  onValueChange,
}: {
  value: (typeof MONTHS)[number];
  onValueChange: (value: (typeof MONTHS)[number]) => void;
}) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger
      className="h-7 w-[130px] rounded-lg pl-2.5"
      aria-label="Select a month"
    >
      <SelectValue placeholder="Select month" />
    </SelectTrigger>
    <SelectContent align="end" className="rounded-xl">
      {MONTHS.map((month) => {
        const config = chartConfig[month as keyof typeof chartConfig];
        if (!config) return null;

        return (
          <SelectItem key={month} value={month} className="rounded-lg">
            {config.label}
          </SelectItem>
        );
      })}
    </SelectContent>
  </Select>
);

// ===== Main Component =====
export function PieTransactions() {
  // ===== State Management =====
  const id = "pie-transactions";
  const [activeMonth, setActiveMonth] = React.useState<(typeof MONTHS)[number]>(
    MONTHS[0]
  );
  const [monthlyData, setMonthlyData] = React.useState<
    MonthlyTransactionData[]
  >([]);
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
      const lastDayOfMonth = new Date(
        currentYear,
        currentMonth + 1,
        0
      ).getDate();

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", `${currentYear}-01-01`)
        .lte(
          "date",
          `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(lastDayOfMonth).padStart(2, "0")}`
        );

      if (error) throw error;

      // Initialize monthly data with zero counts
      const initialData = MONTHS.map((month) => ({
        month,
        count: 0,
        fill: `var(--color-${month})`,
      }));

      // Aggregate transactions by month
      data.forEach((transaction) => {
        const date = new Date(transaction.date);
        const month = MONTHS[date.getMonth()];
        const monthData = initialData.find((item) => item.month === month);
        if (monthData) {
          monthData.count += 1;
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

  // ===== Computed Values =====
  const activeIndex = React.useMemo(
    () => monthlyData.findIndex((item) => item.month === activeMonth),
    [activeMonth, monthlyData]
  );

  // ===== Loading State =====
  if (isLoading) {
    return (
      <Card data-chart={id}>
        <CardHeader className="space-y-0 border-b p-0">
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Monthly Transactions</CardTitle>
              <CardDescription>Transactions by month</CardDescription>
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
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="space-y-0 border-b p-0">
        <div className="flex flex-wrap justify-between">
          <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Monthly Transactions</CardTitle>
            <CardDescription>Transactions by month</CardDescription>
          </div>
          <div className="flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <div className="flex gap-2">
              <MonthSelect value={activeMonth} onValueChange={setActiveMonth} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                const value = payload[0]?.value;
                if (typeof value !== "number") return null;

                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-muted-foreground">
                          {
                            chartConfig[
                              payload[0]?.name as keyof typeof chartConfig
                            ]?.label
                          }
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              background:
                                chartConfig[
                                  payload[0]?.name as keyof typeof chartConfig
                                ]?.color,
                            }}
                          />
                          <span className="text-xs text-muted-foreground">
                            Transactions
                          </span>
                        </div>
                        <div className="text-xs tabular-nums">
                          {Number(value).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={monthlyData}
              dataKey="count"
              nameKey="month"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-lg font-bold"
                        >
                          {monthlyData[activeIndex]?.count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Transactions
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
