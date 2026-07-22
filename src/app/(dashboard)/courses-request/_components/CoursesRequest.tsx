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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { CourseDialog } from "@/components/Dialog/CourseDialog";

type Course = {
  _id: string;
  title: string;
  level: string;
  thumbnail: string;
  introductionVideo: string;
  courseVideo: string;
  duration: string;
  targetAudience: string;
  language: string;
  modules: number;
  extraFile: string;
  price: number;
  discount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function CoursesRequest() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const limit = 7;
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const TOKEN = session?.user?.accessToken;

  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", page, statusFilter],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course?page=${page}&limit=${limit}&status=${statusFilter}`
      );
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      id,
      newStatus,
    }: {
      id: string;
      newStatus: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update course status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-red-500">
        Error: {(error as Error).message}
      </p>
    );

  const courses: Course[] = data?.data || [];
  const totalResults = data?.meta?.total || 0;
  const totalPages = Math.ceil(totalResults / limit);

  const handleApprove = (id: string) => {
    mutation.mutate({ id, newStatus: "approved" });
  };

  const handleReject = (id: string) => {
    mutation.mutate({ id, newStatus: "rejected" });
  };

  return (
    <div className="">
      {/* Header */}
      <div className="mb-[48px] flex items-center justify-between">
        <PageHeader
          title="Dashboard"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Courses Request" },
          ]}
        />

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] border border-gray-300 text-sm">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0080001A] border-b border-gray-200">
              <TableHead className="font-semibold text-gray-900 text-[18px] py-5 px-6 rounded-tl-lg">
                Course Title
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6 text-center">
                Level
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                Price
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                Discount
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-base py-4 px-6">
                Status
              </TableHead>
              <TableHead className="font-semibold text-gray-900 text-[18px] py-4 px-6 rounded-tr-lg text-center">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* ✅ No data message */}
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-gray-500 text-sm"
                >
                  No courses found for{" "}
                  <span className="font-semibold">{statusFilter}</span> status.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow
                  key={course._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-sm text-gray-700 py-5 px-6">
                    {course.title}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    {course.level}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 py-5 px-6">
                    ${course.price}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 py-5 px-6">
                    {course.discount}%
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 py-5 px-6 capitalize">
                    {course.status}
                  </TableCell>

                  {/* ✅ Updated Actions */}
                  <TableCell className="text-sm text-gray-700 py-5 px-6 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      {course.status === "approved" ? (
                        <>
                          <CircleCheckBig className="text-green-600 h-6 w-6" />
                          <CourseDialog courseId={course._id} />
                        </>
                      ) : course.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-7 rounded"
                            onClick={() => handleApprove(course._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 h-7 rounded"
                            onClick={() => handleReject(course._id)}
                          >
                            Reject
                          </Button>
                          <CourseDialog courseId={course._id} />
                        </>
                      ) : (
                        // Rejected
                        <CourseDialog courseId={course._id} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalResults > 7 && (
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
                className={`h-9 w-9 ${p === page
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

export default CoursesRequest;
