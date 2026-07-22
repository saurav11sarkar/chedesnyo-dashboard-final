"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal } from "lucide-react";
import { PageHeader } from "@/components/page-header/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import Image from "next/image";

type LeaderboardEntry = {
  userId: string;
  rank: number;
  badge: string;
  totalDeals: number;
  totalEarned: number;
  avgRating: number;
  user?: {
    profileImage?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

function LeaderboardManagement() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [filter, setFilter] = useState("yearly");

  const { data, isLoading } = useQuery({
    queryKey: ["adminLeaderboard", filter],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/leaderboard?filter=${filter}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!token,
  });

  const leaders = data?.data?.data || [];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "gold": return <Trophy size={18} className="text-yellow-500" />;
      case "silver": return <Medal size={18} className="text-gray-400" />;
      case "bronze": return <Medal size={18} className="text-amber-600" />;
      default: return null;
    }
  };

  return (
    <div className="p-6">
      <PageHeader title="Leaderboard Management" />

      <div className="flex items-center gap-4 mb-6 mt-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Period" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Freelancer</TableHead>
              <TableHead>Closed Deals</TableHead>
              <TableHead>Total Earned</TableHead>
              <TableHead>Avg Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : leaders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No leaderboard data</TableCell></TableRow>
            ) : (
              leaders.map((item: LeaderboardEntry) => (
                <TableRow key={item.userId} className={item.rank <= 3 ? "bg-yellow-50/50" : ""}>
                  <TableCell className="font-bold text-lg">#{item.rank}</TableCell>
                  <TableCell>{getBadgeIcon(item.badge)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.user?.profileImage && (
                        <Image src={item.user.profileImage} alt="" width={32} height={32} className="rounded-full" />
                      )}
                      <div>
                        <p className="font-medium">{item.user?.firstName} {item.user?.lastName || ""}</p>
                        <p className="text-xs text-gray-500">{item.user?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{item.totalDeals}</TableCell>
                  <TableCell className="font-semibold text-green-600">&euro;{(item.totalEarned || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className="text-yellow-600 font-medium">
                      {item.avgRating ? item.avgRating.toFixed(1) : "—"} / 5
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default LeaderboardManagement;
