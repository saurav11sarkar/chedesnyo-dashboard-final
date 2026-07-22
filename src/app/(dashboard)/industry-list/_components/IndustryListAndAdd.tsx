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
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DeleteModal } from "@/components/Dialog/DeleteModal";
import { UpdateIndustry } from "@/components/Dialog/UpdateIndustry";
import { PageHeader } from "@/components/page-header/PageHeader";

// ================== Interfaces ===================
interface Industry {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface IndustryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: Industry[];
}

// ================== Component ===================
export default function IndustryListAndAdd() {
  const [newIndustry, setNewIndustry] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | null>(null);
  const [selectedIndustryName, setSelectedIndustryName] = useState("");

  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken;

  // ================== Fetch Industries ===================
  const { data: industriesData, refetch } = useQuery<IndustryResponse>({
    queryKey: ["industries", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/industry?page=${currentPage}&limit=${itemsPerPage}`,
        { headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to fetch industries");
      return res.json();
    },
  });

  const totalPages = industriesData
    ? Math.ceil(industriesData.meta.total / itemsPerPage)
    : 0;

  // ================== Add Industry ===================
  const addIndustryMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/industry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ name: newIndustry }),
      });
      if (!res.ok) throw new Error("Failed to add industry");
      return res.json();
    },
    onSuccess: () => {
      setNewIndustry("");
      toast.success("Industry added successfully");
      refetch();
    },
    onError: () => {
      toast.error("Error adding industry");
    },
  });

  // ================== Delete Industry ===================
  const handleDelete = (id: string) => {
    setSelectedUserId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/industry/${selectedUserId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete industry");

      toast.success("Industry deleted successfully");
      setDeleteModalOpen(false);
      setSelectedUserId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete industry");
      console.error(error);
    }
  };

  // ================== Update Industry ===================
  const updateIndustryMutation = useMutation({
    mutationFn: async (updatedName: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/industry/${selectedIndustryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ name: updatedName }),
        }
      );
      if (!res.ok) throw new Error("Failed to update industry");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Industry updated successfully");
      setEditModalOpen(false);
      setSelectedIndustryId(null);
      refetch();
    },
    onError: () => {
      toast.error("Failed to update industry");
    },
  });

  const handleEdit = (id: string, name: string) => {
    setSelectedIndustryId(id);
    setSelectedIndustryName(name);
    setEditModalOpen(true);
  };

  const handleUpdateSave = (updatedName: string) => {
    updateIndustryMutation.mutate(updatedName);
  };

  // ================== Add Industry ===================
  const handleSave = () => {
    if (!newIndustry.trim()) return;
    addIndustryMutation.mutate();
  };

  const goToPage = (page: number) => setCurrentPage(page);

  // ================== JSX ===================
  return (
    <>
    <div className="mb-10">
      <PageHeader
              title="Industry List"
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Industry List" },
              ]}
            />
    </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===== Industry List Table ===== */}
        <div>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Industry List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#0080001A] border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-900 text-[16px] py-4 px-6">
                        Industry Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-[16px] py-4 px-6 text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {industriesData?.data?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center py-10 text-gray-500"
                        >
                          No industries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      industriesData?.data?.map((industry) => (
                        <TableRow
                          key={industry._id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="text-sm text-gray-700 py-4 px-6">
                            {industry.name}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700 py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() =>
                                  handleEdit(industry._id, industry.name)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDelete(industry._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                    Showing page {currentPage} of {totalPages} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-white border-gray-300"
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="icon"
                          className={`h-9 w-9 ${
                            page === currentPage
                              ? "bg-green-700 hover:bg-green-800 text-white border-green-700"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 bg-white border-gray-300"
                      onClick={() =>
                        goToPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===== Add Industry Form ===== */}
        <div>
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Add Industry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-16">
              <div className="space-y-2">
                <Label
                  htmlFor="industry-name"
                  className="text-sm font-medium text-gray-700"
                >
                  Industry Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="industry-name"
                  placeholder="Enter industry name..."
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                disabled={addIndustryMutation.isPending}
              >
                {addIndustryMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== Delete Modal ===== */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />

      {/* ===== Edit Modal ===== */}
      <UpdateIndustry
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleUpdateSave}
        initialName={selectedIndustryName}
      />
    </>
  );
}
