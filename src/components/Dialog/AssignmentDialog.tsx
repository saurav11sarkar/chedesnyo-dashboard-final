"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import Image from "next/image";

type AssignmentResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    _id: string;
    banner: string;
    title: string;
    description: string;
    budget: string;
    priceType: string;
    paymentMethod: string;
    deadLine: string;
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
};

export function AssignmentDialog({ assigmentId }: { assigmentId: string }) {
  const { data, isLoading, error } = useQuery<AssignmentResponse>({
    queryKey: ["singleAssignment", assigmentId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/assigment/${assigmentId}`
      );
      if (!res.ok) throw new Error("Failed to fetch assignment details");
      return res.json();
    },
  });

  const assignment = data?.data;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white p-1 h-7 w-7 rounded"
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl shadow-xl">
        {isLoading ? (
          <p className="text-center py-6 text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center py-6 text-red-500">
            {(error as Error).message}
          </p>
        ) : assignment ? (
          <>
            {/* Banner */}
            <div className="relative w-full h-56">
              <Image
                src={assignment.banner}
                alt={assignment.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-5">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl font-semibold drop-shadow-md">
                    {assignment.title}
                  </DialogTitle>
                </DialogHeader>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 bg-white">
              {/* User Info */}
              {assignment.user ? (
                <div className="flex items-center gap-3">
                  <Image
                    src={assignment.user.profileImage || "/default-avatar.png"}
                    alt={`${assignment.user.firstName} ${assignment.user.lastName}`}
                    width={50}
                    height={50}
                    className="rounded-full border border-gray-200 object-cover shadow-sm"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {assignment.user.firstName} {assignment.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{assignment.user.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No user information available.</p>
              )}

              {/* Description */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-semibold mb-1 text-sm uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {assignment.description}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    ${assignment.budget}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Price Type</p>
                  <p className="text-base font-semibold text-gray-800 mt-1 capitalize">
                    {assignment.priceType}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Payment Method
                  </p>
                  <p className="text-base font-semibold text-gray-800 mt-1 capitalize">
                    {assignment.paymentMethod}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Deadline</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {new Date(assignment.deadLine).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-end pt-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    assignment.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : assignment.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center py-6 text-gray-500">No assignment details found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
