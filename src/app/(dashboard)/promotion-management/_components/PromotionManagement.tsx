"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, XCircle, Eye, MousePointerClick } from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";

type Promotion = {
  _id: string;
  targetType: string;
  duration: number;
  isFree: boolean;
  amountPaid?: number;
  status: "active" | "expired" | "cancelled" | "pending";
  views?: number;
  clicks?: number;
  startDate?: string;
  endDate?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

function PromotionManagement() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["adminPromotions", page, statusFilter, typeFilter],
    queryFn: async () => {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/promotion?page=${page}&limit=${limit}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (typeFilter !== "all") url += `&targetType=${typeFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/promotion/${id}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminPromotions"] }),
  });

  const promotions = data?.data?.data || [];
  const total = data?.data?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <PageHeader title="Promotion Management" />

      <div className="flex items-center gap-4 mb-6 mt-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="course">Course</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : promotions.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No promotions found</TableCell></TableRow>
            ) : (
              promotions.map((promo: Promotion) => (
                <TableRow key={promo._id}>
                  <TableCell>
                    <p className="font-medium">{promo.user?.firstName} {promo.user?.lastName || ""}</p>
                    <p className="text-xs text-gray-500">{promo.user?.email}</p>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{promo.targetType}</span>
                  </TableCell>
                  <TableCell>{promo.duration} days</TableCell>
                  <TableCell className="font-semibold">
                    {promo.isFree ? <span className="text-green-600">Free</span> : `€${promo.amountPaid?.toFixed(2)}`}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      promo.status === "active" ? "bg-green-100 text-green-700" :
                      promo.status === "expired" ? "bg-gray-100 text-gray-700" :
                      promo.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{promo.status}</span>
                  </TableCell>
                  <TableCell><Eye size={14} className="inline mr-1" />{promo.views || 0}</TableCell>
                  <TableCell><MousePointerClick size={14} className="inline mr-1" />{promo.clicks || 0}</TableCell>
                  <TableCell className="text-xs">
                    {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : "—"} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {promo.status === "active" && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => cancelMutation.mutate(promo._id)} disabled={cancelMutation.isPending}>
                        <XCircle size={14} className="mr-1" /> Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default PromotionManagement;
