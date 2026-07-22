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
import { ChevronLeft, ChevronRight, CircleCheckBig } from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { AssignmentDialog } from "@/components/Dialog/AssignmentDialog";

type Assignment = {
  _id: string;
  banner: string;
  title: string;
  description: string;
  budget: string;
  priceType: string;
  paymentMethod: string;
  deadLine: string;
  uploadFile?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function AssignmentRequest() {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const limit = 7;
  const queryClient = useQueryClient();
  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;

  const { data, isLoading, error } = useQuery({
    queryKey: ["assignment", page, filterStatus],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment?page=${page}&limit=${limit}&status=${filterStatus}`
      );
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
  });

  const assignmentData: Assignment[] = data?.data || [];
  const totalResults = data?.meta?.total || 0;
  const totalPages = Math.ceil(totalResults / limit);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignment", page, filterStatus],
      });
    },
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: "approved" });
  };

  const handleCancel = (id: string) => {
    updateStatusMutation.mutate({ id, status: "rejected" });
  };

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return <p className="text-center mt-10">Error: {(error as Error).message}</p>;

  return (
    <div className="">
      <div className="flex justify-between items-center mb-[48px]">
        <PageHeader
          title="Dashboard"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Assignments Request" },
          ]}
        />

        <Select
          value={filterStatus}
          onValueChange={(value) => {
            setFilterStatus(value as "pending" | "approved" | "rejected");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0080001A] border-b border-gray-200">
              <TableHead className="font-semibold text-gray-900 text-[18px] py-5 px-6 rounded-tl-lg">
                Assignment Title
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Seller Name
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Price
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Price Type
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Deadline
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {assignmentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-10 text-gray-500"
                >
                  No assignments found for {filterStatus}
                </TableCell>
              </TableRow>
            ) : (
              assignmentData.map((item) => (
                <TableRow
                  key={item._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {/* Assignment Title */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6">
                    {item.title}
                  </TableCell>

                  {/* Seller Info (Safe Access) */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    {item.user ? (
                      <div className="flex items-center justify-center gap-2">
                        <Image
                          src={
                            item.user.profileImage ||
                            "/default-avatar.png" // fallback
                          }
                          alt={`${item.user.firstName} ${item.user.lastName}`}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                        <p className="text-gray-900 font-medium text-sm">
                          {item.user.firstName} {item.user.lastName}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No user info</p>
                    )}
                  </TableCell>

                  {/* Budget */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    {item.budget}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    {item.status}
                  </TableCell>

                  {/* Price Type */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    {item.priceType}
                  </TableCell>

                  {/* Deadline */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    {new Date(item.deadLine).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      {item.status === "approved" ? (
                        <CircleCheckBig className="h-6 w-6 text-green-600" />
                      ) : item.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-7 rounded"
                            onClick={() => handleApprove(item._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 h-7 rounded"
                            onClick={() => handleCancel(item._id)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : null}

                      <AssignmentDialog assigmentId={item._id} />
                    </div>
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

export default AssignmentRequest;
