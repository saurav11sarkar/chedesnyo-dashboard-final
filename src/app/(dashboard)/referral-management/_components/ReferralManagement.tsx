"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";

function ReferralManagement() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const [page, setPage] = useState(1);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["referralTree", page],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/admin/referral-tree?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const referrers = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <PageHeader title="Referral Management" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-sm text-gray-500">Total Referrers</p>
          <p className="text-2xl font-bold">{referrers.length}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-sm text-gray-500">Total Referred Users</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-sm text-gray-500">Active Referral Network</p>
          <p className="text-2xl font-bold text-green-600">
            <Users className="inline mr-2" size={20} />{referrers.length} chains
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Referred Count</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : referrers.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No referral data found</TableCell></TableRow>
            ) : (
              referrers.map((referrer: any) => (
                <React.Fragment key={referrer._id}>
                  <TableRow className="cursor-pointer hover:bg-gray-50" onClick={() => setExpandedUser(expandedUser === referrer._id ? null : referrer._id)}>
                    <TableCell>
                      {expandedUser === referrer._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {referrer.profileImage && (
                          <Image src={referrer.profileImage} alt="" width={32} height={32} className="rounded-full" />
                        )}
                        <span className="font-medium">{referrer.firstName} {referrer.lastName || ""}</span>
                      </div>
                    </TableCell>
                    <TableCell>{referrer.email}</TableCell>
                    <TableCell><span className="capitalize">{referrer.role}</span></TableCell>
                    <TableCell className="font-mono text-sm">{referrer.referralCode}</TableCell>
                    <TableCell className="font-semibold">{referrer.referredCount}</TableCell>
                    <TableCell className="font-semibold text-green-600">&euro;{(referrer.balance || 0).toFixed(2)}</TableCell>
                  </TableRow>
                  {expandedUser === referrer._id && referrer.referredUsers?.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50 p-4">
                        <p className="text-sm font-medium mb-2 text-gray-600">Referred Users:</p>
                        <div className="space-y-2">
                          {referrer.referredUsers.map((u: any) => (
                            <div key={u._id} className="flex items-center gap-4 text-sm bg-white p-2 rounded border">
                              <span className="font-medium">{u.firstName} {u.lastName || ""}</span>
                              <span className="text-gray-500">{u.email}</span>
                              <span className="capitalize text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{u.role}</span>
                              <span className="text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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

export default ReferralManagement;
