"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  ShieldAlert,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Reporter = {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  profileImage?: string;
};

type Report = {
  _id: string;
  reporter: Reporter;
  targetId: string;
  targetType: "user" | "assignment";
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved";
  adminAction?: string;
  adminNote?: string;
  reviewedAt?: string;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  data: Report[];
  meta: { total: number; page: number; limit: number };
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewed: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const targetTypeColors: Record<string, string> = {
  user: "bg-blue-50 text-blue-600",
  assignment: "bg-amber-50 text-amber-600",
};

function ReportsManagement() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<"pending" | "reviewed" | "resolved" | "all">("pending");
  const [filterType, setFilterType] = useState<"all" | "user" | "assignment">("all");
  const [actionNote, setActionNote] = useState<Record<string, string>>({});
  const limit = 10;
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken || "";

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["reports", page, filterStatus, filterType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterType !== "all") params.append("targetType", filterType);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/report?${params}`,
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
    enabled: !!TOKEN,
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      note,
    }: {
      id: string;
      action: string;
      note?: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/report/${id}/action`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ action, note }),
        }
      );
      if (!res.ok) throw new Error("Action failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const reports: Report[] = data?.data || [];
  const totalResults = data?.meta?.total || 0;
  const totalPages = Math.ceil(totalResults / limit);

  if (isLoading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {(error as Error).message}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-[48px] flex-wrap gap-4">
        <PageHeader
          title="Reports"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Reports Management" },
          ]}
        />

        <div className="flex gap-3 flex-wrap">
          <Select
            value={filterType}
            onValueChange={(v) => { setFilterType(v as typeof filterType); setPage(1); }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={(v) => { setFilterStatus(v as typeof filterStatus); setPage(1); }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0080001A] border-b border-gray-200">
              <TableHead className="font-semibold text-gray-900 text-base py-5 px-6 rounded-tl-lg">
                Reporter
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Type
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                Reason
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Date
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  <Flag className="mx-auto mb-2 text-gray-300" size={32} />
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((item) => (
                <TableRow
                  key={item._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* Reporter */}
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      {item.reporter?.profileImage ? (
                        <Image
                          src={item.reporter.profileImage}
                          alt={item.reporter.firstName}
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium text-sm">
                          {item.reporter?.firstName?.[0] || "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.reporter?.firstName} {item.reporter?.lastName || ""}
                        </p>
                        <p className="text-xs text-gray-500">{item.reporter?.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Target Type */}
                  <TableCell className="py-5 px-6 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        targetTypeColors[item.targetType]
                      }`}
                    >
                      {item.targetType === "user" ? "User" : "Assignment"}
                    </span>
                  </TableCell>

                  {/* Reason */}
                  <TableCell className="py-5 px-6 max-w-[220px]">
                    <p className="text-sm text-gray-900 font-medium">{item.reason}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-5 px-6 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        statusColors[item.status]
                      }`}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                    {item.adminAction && (
                      <p className="text-xs text-gray-400 mt-1">
                        Action: {item.adminAction}
                      </p>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-5 px-6 text-center text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-5 px-6">
                    {item.status === "resolved" ? (
                      <span className="text-xs text-gray-400 italic">Resolved</span>
                    ) : (
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <input
                          type="text"
                          placeholder="Admin note (optional)"
                          value={actionNote[item._id] || ""}
                          onChange={(e) =>
                            setActionNote((prev) => ({ ...prev, [item._id]: e.target.value }))
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        <div className="flex gap-1.5 flex-wrap">
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 h-7 rounded flex items-center gap-1"
                            onClick={() =>
                              actionMutation.mutate({
                                id: item._id,
                                action: "warn",
                                note: actionNote[item._id],
                              })
                            }
                            disabled={actionMutation.isPending}
                          >
                            <ShieldAlert size={12} />
                            Warn
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 h-7 rounded flex items-center gap-1"
                            onClick={() =>
                              actionMutation.mutate({
                                id: item._id,
                                action: "block",
                                note: actionNote[item._id],
                              })
                            }
                            disabled={actionMutation.isPending}
                          >
                            <ShieldOff size={12} />
                            Block
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 h-7 rounded flex items-center gap-1"
                            onClick={() =>
                              actionMutation.mutate({
                                id: item._id,
                                action: "remove",
                                note: actionNote[item._id],
                              })
                            }
                            disabled={actionMutation.isPending}
                          >
                            <Trash2 size={12} />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalResults > limit && (
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
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsManagement;
