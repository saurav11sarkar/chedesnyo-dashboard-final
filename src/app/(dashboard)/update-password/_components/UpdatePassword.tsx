"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

function UpdatePassword() {
  const { data: session } = useSession();
  const user = session?.user;
  const TOKEN = user?.accessToken;
  const router = useRouter();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileData, setProfileData] = useState({
    firstName: "",
    role: "",
    email: "",
    location: "",
    profileImage: "",
    createdAt: "",
  });

  // ✅ Fetch profile data (same as Profile page)
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["profileData"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch profile data");
      return res.json();
    },
    enabled: !!TOKEN,
  });

  useEffect(() => {
    if (profileResponse?.data) {
      const user = profileResponse.data;
      setProfileData({
        firstName: user.firstName || "",
        role: user.role || "",
        email: user.email || "",
        location: user.location || "",
        profileImage: user.profileImage || "/default-avatar.png",
        createdAt: new Date(user.createdAt).toLocaleDateString(),
      });
    }
  }, [profileResponse]);

  // ✅ Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to update password");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      router.push("/signin");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update password");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      return toast.error("All fields are required");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New password and confirm password do not match");
    }

    updatePasswordMutation.mutate(formData);
  };

  if (isLoading)
    return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="flex gap-6 w-full">
      {/* Left Sidebar (dynamic user info) */}
      <div className="w-[290px] bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <div className="h-[140px] bg-gradient-to-br from-green-400 to-green-600 rounded-t-lg"></div>
          <div className="absolute top-[70px] left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-[120px] h-[120px] rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                <Image
                  width={300}
                  height={300}
                  src={profileData.profileImage || "/default-avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-6 px-6 text-center border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {profileData.firstName}
          </h2>
          <p className="text-sm text-gray-500 capitalize">{profileData.role}</p>
        </div>

        <div className="px-6 py-4 space-y-3 text-sm border-b border-gray-200">
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-900 ml-1">{profileData.email}</span>
          </div>
          <div>
            <span className="text-gray-600">Location:</span>
            <span className="text-gray-900 ml-1">{profileData.location}</span>
          </div>
          <div>
            <span className="text-gray-600">Member Since:</span>
            <span className="text-gray-900 ml-1">{profileData.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Right Section – Change Password */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Change Password
          </h2>
          <p className="text-sm text-gray-500">
            Update your account password securely.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="h-11"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="h-11"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6">
          <Button
            variant="outline"
            onClick={() =>
              setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" })
            }
            className="px-6 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 bg-green-600 hover:bg-green-700 text-white"
            disabled={updatePasswordMutation.isPending}
          >
            {updatePasswordMutation.isPending ? "Saving..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePassword;
