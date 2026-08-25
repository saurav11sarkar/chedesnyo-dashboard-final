"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";

type Payout = {
  _id: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

function PayoutManagement() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["adminPayouts", page, statusFilter],
    queryFn: async () => {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payout?page=${page}&limit=${limit}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch payouts");
      return res.json();
    },
    enabled: !!token,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payout/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminPayouts"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payout/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminPayouts"] }),
  });

  const payouts = data?.data || [];
  const filtered = statusFilter === "all" ? payouts : payouts.filter((p: Payout) => p.status === statusFilter);
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <PageHeader title="Payout Management" />

      <div className="flex items-center gap-4 mb-6 mt-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No payouts found</TableCell></TableRow>
            ) : (
              filtered.map((payout: Payout) => (
                <TableRow key={payout._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payout.user?.firstName} {payout.user?.lastName}</p>
                      <p className="text-xs text-gray-500">{payout.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">&euro;{payout.amount?.toFixed(2)}</TableCell>
                  <TableCell className="uppercase text-xs">{payout.method}</TableCell>
                  <TableCell className="text-sm font-mono">{payout.accountDetails}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payout.status === "approved" ? "bg-green-100 text-green-700" :
                      payout.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {payout.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {payout.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => approveMutation.mutate(payout._id)} disabled={approveMutation.isPending}>
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => rejectMutation.mutate(payout._id)} disabled={rejectMutation.isPending}>
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
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

export default PayoutManagement;
