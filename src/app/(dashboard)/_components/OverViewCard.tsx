"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

function OverViewCard() {
  const { data: session } = useSession();
  const user = session?.user;
  const TOKEN = user?.accessToken;
  console.log("session", session);
  const { data: overViewData, isLoading, isError } = useQuery({

    queryKey: ["overviewData"],
    queryFn: async () => {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dashboard/overview`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch overview data");
      return res.json();
    },
  });

  // ✅ Handle loading or error states
  if (isLoading) {
    return <p className="text-center mt-10 text-gray-500">Loading overview...</p>;
  }

  if (isError) {
    return <p className="text-center mt-10 text-red-500">Failed to load overview data.</p>;
  }

  // ✅ Extract data safely
  const overview = overViewData?.data || {};

  return (
    <div>
      <PageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-[65px]">
        {/* Total Revenue Card */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${overview.revenue ?? 0}
                </p>
              </div>
              <div className="w-16 h-16 relative flex-shrink-0">
                <Image
                  src="/images/overviewcard1.png"
                  alt="Total Revenue"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Business User Card */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 font-medium">
                  Total Business Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.business ?? 0}
                </p>
              </div>
              <div className="w-16 h-16 relative flex-shrink-0">
                <Image
                  src="/images/overviewcard2.png"
                  alt="Business Users"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sales User Card */}
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 font-medium">Total Sales User</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.sele ?? 0}
                </p>
              </div>
              <div className="w-16 h-16 relative flex-shrink-0">
                <Image
                  src="/images/overviewcard3.png"
                  alt="Sales Users"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OverViewCard;
