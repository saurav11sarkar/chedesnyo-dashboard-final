"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RevenueItem } from "../../../../../Types/revenueItem";
import { useSession } from "next-auth/react";

function RevenueFromSalesUser() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["revenueData", page, TOKEN],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payment?page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch revenue data");
      return res.json();
    },
    enabled: !!TOKEN, // Wait until token is available
  });

  if (isLoading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  if (isError)
    return (
      <p className="text-center mt-10 text-red-500">
        {error instanceof Error ? error.message : "Something went wrong"}
      </p>
    );

  const revenueData: RevenueItem[] = data?.data || [];
  const totalResults = data?.meta?.total || 0;
  const totalPages = Math.ceil(totalResults / limit);

  // ✅ Calculate total revenue from adminFree safely
  const totalRevenue = revenueData.reduce(
    (acc: number, item: RevenueItem) => acc + (item?.adminFree || 0),
    0
  );

  return (
    <div className="">
      {/* ===== Page Header + Total Revenue Card ===== */}
      <div className="flex justify-between items-center mb-[48px]">
        <div>
          <PageHeader
            title="Dashboard"
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Revenue from Sales user" },
            ]}
          />
        </div>
        <div>
          <Card className="bg-[#008000] shadow-sm hover:shadow-md transition-shadow rounded-lg w-[248px] h-[85px]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <p className="font-semibold text-base leading-[120%] text-white">
                      Total Revenue
                    </p>
                  </div>
                  <p className="text-[16px] ml-5 font-normal text-white mt-1">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== Revenue Table ===== */}
      <div className="w-full bg-white rounded-lg shadow-sm">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0080001A] border-b border-gray-200 rounded-t-lg">
                <TableHead className="font-semibold text-gray-900 text-[18px] py-5 text-center px-6 rounded-tl-lg">
                  User ID
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-[18px] py-4 px-6 text-center">
                  User Name
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-[18px] py-4 px-6 text-center">
                  Total Service Price ($)
                </TableHead>
                <TableHead className="font-semibold text-gray-900 text-[18px] py-4 px-6 rounded-tr-lg text-center">
                  Revenue (15%)
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {revenueData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-10 text-gray-500"
                  >
                    No revenue data found
                  </TableCell>
                </TableRow>
              ) : (
                revenueData.map((item: RevenueItem, index: number) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                      {item?.user?._id || "—"}
                    </TableCell>
                    <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                      {item?.user
                        ? `${item.user.firstName} ${item.user.lastName}`
                        : "No user info"}
                    </TableCell>
                    <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                      ${item?.amount?.toFixed(2) ?? "0.00"}
                    </TableCell>
                    <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                      ${item?.adminFree?.toFixed(2) ?? "0.00"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ===== Pagination ===== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, totalResults)} of {totalResults} results
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-white border-gray-300"
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className={`h-9 w-9 ${
                    p === page
                      ? "bg-green-700 hover:bg-green-800 text-white border-green-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-white border-gray-300"
                onClick={() => setPage(Math.min(page + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevenueFromSalesUser;
