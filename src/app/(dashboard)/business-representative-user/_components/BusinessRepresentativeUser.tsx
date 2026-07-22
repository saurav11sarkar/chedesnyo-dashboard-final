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
import { ChevronLeft, ChevronRight, X, CircleCheckBig } from "lucide-react"; // ⬅ add icons
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DeleteModal } from "@/components/Dialog/DeleteModal";

// ✅ TypeScript types matching your API response
type BusinessUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  businessName: string;
  location?: string;
  verified?: boolean;
  industry: string;
  kvkVatNumber: string;
  status?: string; // "approved" | "rejected" | undefined
  createdAt: string;
  updatedAt: string;
  stripeAccountId?: string;
};

type BusinessUserResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: BusinessUser[];
};

function BusinessRepresentativeUser() {
  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch business users with pagination
  const { data: salesUser, isLoading, error, refetch } = useQuery<BusinessUserResponse>({
    queryKey: ["businessUser", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-user?role=business&page=${currentPage}&limit=5&status=pending`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch business users");
      return res.json();
    },
    enabled: !!TOKEN,
  });

  const users: BusinessUser[] = salesUser?.data || [];
  const totalResults = salesUser?.meta?.total || 0;
  const resultsPerPage = salesUser?.meta?.limit || 5;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ Mutation for Approve/Reject
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/status/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update user status");
      return res.json();
    },
    onSuccess: () => {
      toast.success("User status updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${selectedUserId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      setDeleteModalOpen(false);
      setSelectedUserId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0080001A] border-b border-gray-200">
              <TableHead className="font-semibold text-gray-900 text-[14px] py-5 text-center px-4">
                User ID
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[14px] py-4 px-4 text-center">
                User Name
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[14px] py-4 px-4 text-center">
                User Email
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[14px] py-4 px-4 text-center">
                Business Name
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[14px] py-4 px-4 text-center">
                Industry
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[14px] py-4 px-4 text-center">
                KVK/VAT Number
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[14px] py-4 px-4 text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-red-500">
                  {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((item) => (
                <TableRow
                  key={item._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-[14px] text-gray-700 py-5 px-4 text-center">
                    {item._id}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-700 py-5 px-4 text-center">
                    {item.firstName} {item.lastName}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-700 py-5 px-4 text-center">
                    {item.email}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-700 py-5 px-4 text-center">
                    {item.businessName}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-700 py-5 px-4 text-center">
                    {item.industry}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-700 py-5 px-4 text-center">
                    {item.kvkVatNumber}
                  </TableCell>
                  <TableCell className="text-[14px] text-gray-700 py-5 px-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      {item.status === "approved" ? (
                        <CircleCheckBig  className="w-5 h-5 text-green-600" />
                      ) : item.status === "rejected" ? (
                        <X className="w-5 h-5 text-red-600" />
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            className="bg-white border-green-600 text-green-600 hover:bg-green-50 px-4 h-8 text-xs font-medium"
                            onClick={() =>
                              statusUpdateMutation.mutate({ userId: item._id, status: "approved" })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-white border-red-500 text-red-500 hover:bg-red-50 px-4 h-8 text-xs font-medium"
                            onClick={() =>
                              statusUpdateMutation.mutate({ userId: item._id, status: "rejected" })
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DeleteModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * resultsPerPage + 1} to{" "}
            {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white border-gray-300"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className={`h-9 w-9 ${
                  page === currentPage
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-white border-gray-300"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusinessRepresentativeUser;
