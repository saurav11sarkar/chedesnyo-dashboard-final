/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DeleteModal } from "@/components/Dialog/DeleteModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BusinessRepresentativeUser from "../../business-representative-user/_components/BusinessRepresentativeUser";
import SelesRepresentativeUser from "./SelesRepresentativeUser";

type SalesUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  location?: string;
  verified?: boolean;
  role: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  stripeAccountId?: string;
};

type SalesUserResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: SalesUser[];
};

// 🧩 Sales Users Table
function SelesUser({
  selectedFilter,
}: {
  onTotalChange: (total: number) => void;
  selectedFilter: string;
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const session = useSession();
  const TOKEN = session?.data?.user?.accessToken;

  const {
    data: salesUser,
    isLoading,
    error,
    refetch,
  } = useQuery<SalesUserResponse>({
    queryKey: ["salesUser", selectedFilter],
    queryFn: async () => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/all-user?&role=seles`
      );

      if (selectedFilter !== "all") {
        url.searchParams.append("status", selectedFilter);
      }

      const res = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch sales users");
      return res.json();
    },
    enabled: !!TOKEN,
    // onSuccess: (data) => {
    //   onTotalChange(data.data.length);
    // },
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

  const salesData: SalesUser[] = salesUser?.data || [];
  const totalResults = salesData.length;

  return (
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
                User Email
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[18px] py-4 px-6 rounded-tr-lg text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-500"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-red-500"
                >
                  {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : salesData.length > 0 ? (
              salesData.map((item) => (
                <TableRow
                  key={item._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                    {item._id}
                  </TableCell>
                  <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                    {item.firstName} {item.lastName}
                  </TableCell>
                  <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                    {item.email}
                  </TableCell>
                  <TableCell className="text-[18px] text-gray-700 py-5 px-6 text-center">
                    <div className="flex justify-center items-center">
                      <Trash2
                        className="w-5 h-5 text-red-600 hover:text-red-700 cursor-pointer transition-colors duration-200"
                        onClick={() => {
                          setSelectedUserId(item._id);
                          setDeleteModalOpen(true);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-500"
                >
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

      {totalResults > 6 && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing 1 to {totalResults} of {totalResults} results
          </p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {[1, 2, 3, "...", 10].map((page, index) => (
              <Button
                key={index}
                variant={page === 1 ? "default" : "outline"}
                size="icon"
                className={`h-9 w-9 ${
                  page === 1
                    ? "bg-green-700 hover:bg-green-800 text-white border-green-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
                disabled
              >
                {page}
              </Button>
            ))}

            <Button variant="outline" size="icon" className="h-9 w-9" disabled>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// 🟢 Main Component
export default function MainSelesUser() {
  const [activeTab, setActiveTab] = useState<"all" | "request">("all");
  const [totalResults, setTotalResults] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("approved"); // ✅ Default approved

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <PageHeader
          title="Dashboard"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sales Representative User" },
          ]}
        />

        {/* ✅ Filter visible only in “All Business User” tab */}
        {activeTab === "all" && (
          <div className="flex flex-col">
            <label className="text-gray-700 text-sm font-medium mb-2">
              Filter by Status
            </label>
            <Select
              value={selectedFilter}
              onValueChange={(value) => setSelectedFilter(value)}
            >
              <SelectTrigger className="w-[200px] bg-white focus:ring-2 focus:ring-green-600">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* 🔘 Tab Buttons */}
      <div className="flex items-center gap-4 my-[28px]">
        <Button
          onClick={() => setActiveTab("all")}
          className={`px-6 h-[43px] text-sm font-medium ${
            activeTab === "all"
              ? "bg-[#008000] text-white hover:bg-[#045e04]"
              : "border-[#008000] text-[#008000] bg-white hover:bg-green-50"
          }`}
        >
          All Seles User
        </Button>

        <Button
          onClick={() => setActiveTab("request")}
          className={`px-6 h-[43px] text-sm font-medium ${
            activeTab === "request"
              ? "bg-[#008000] text-white hover:bg-[#045e04]"
              : "border-[#008000] text-[#008000] bg-white hover:bg-green-50"
          }`}
        >
          Request Seles User
        </Button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === "all" ? (
        <SelesUser
          onTotalChange={setTotalResults}
          selectedFilter={selectedFilter}
        />
      ) : (
        <SelesRepresentativeUser />
      )}
    </div>
  );
}
