/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button"; // ShadCN Select
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EarningsData {
  month: string;
  totalEarnings: number;
}

interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: EarningsData[];
}

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "#0D9488",
  },
  comparison: {
    label: "Comparison",
    color: "#D1D5DB",
  },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-xs text-gray-500 mb-1">Daily</p>
        <p className="text-lg font-bold text-gray-900">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function EarningsOverviewChart() {
  const { data: session } = useSession();
  const user = session?.user;
  const TOKEN = user?.accessToken;

  // Year state
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  const { data: apiResponse, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["earningsOverviewData", year],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dashboard/monthly-earnings?year=${year}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch earnings overview data");
      return res.json();
    },
  });

  const chartData = useMemo(() => {
    if (!apiResponse?.data) return [];

    const monthMap: { [key: string]: string } = {
      January: "Jan",
      February: "Feb",
      March: "Mar",
      April: "Apr",
      May: "May",
      June: "Jun",
      July: "Jul",
      August: "Aug",
      September: "Sep",
      October: "Oct",
      November: "Nov",
      December: "Dec",
    };

    return apiResponse.data.map((item) => ({
      month: monthMap[item.month] || item.month,
      earnings: item.totalEarnings,
      comparison: item.totalEarnings * 0.8,
    }));
  }, [apiResponse]);

  const highestEarning = useMemo(() => {
    if (!chartData.length) return null;
    const max = chartData.reduce((prev, curr) => (curr.earnings > prev.earnings ? curr : prev));
    return max.earnings > 0 ? max : null;
  }, [chartData]);

  if (isLoading)
    return (
      <Card className="w-full shadow-sm mt-[48px]">
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Loading chart data...</p>
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Card className="w-full shadow-sm mt-[48px]">
        <CardContent className="py-8">
          <p className="text-center text-red-500">Error loading chart data</p>
        </CardContent>
      </Card>
    );

  return (
    <Card className="w-full shadow-sm mt-[48px]">
      <CardHeader className="pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">Earnings Overview</h3>
          <Info className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-xs text-gray-600 border-gray-300 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {year}
          </Button>

          <Select value={year.toString()} onValueChange={(value) => setYear(Number(value))}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorComparison" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D1D5DB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D1D5DB" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              ticks={[50, 100, 150, 200, 250, 300]}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {highestEarning && (
              <>
                <ReferenceLine x={highestEarning.month} stroke="#0D9488" strokeDasharray="3 3" strokeWidth={1} />
                <ReferenceDot x={highestEarning.month} y={highestEarning.earnings} r={6} fill="#0D9488" stroke="#fff" strokeWidth={3} />
              </>
            )}

            <Area dataKey="comparison" type="monotone" stroke="#D1D5DB" strokeWidth={2} fill="url(#colorComparison)" fillOpacity={1} />
            <Area dataKey="earnings" type="monotone" stroke="#0D9488" strokeWidth={2.5} fill="url(#colorEarnings)" fillOpacity={1} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default EarningsOverviewChart;
