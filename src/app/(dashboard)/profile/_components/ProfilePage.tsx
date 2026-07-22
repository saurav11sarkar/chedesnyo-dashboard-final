"use client";

import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

function ProfilePage() {
    const session = useSession();
    const user = session?.data?.user;
    const TOKEN = user?.accessToken;

    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        firstName: "",
        role: "",
        email: "",
        location: "",
        profileImage: "",
        createdAt: "",
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    // ✅ Fetch profile
    const { data: profileData, isLoading, isError } = useQuery({
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
        if (profileData?.data) {
            const user = profileData.data;
            setFormData({
                firstName: user.firstName || "",
                role: user.role || "",
                email: user.email || "",
                location: user.location || "",
                profileImage: user.profileImage || "",
                createdAt: new Date(user.createdAt).toLocaleDateString(),
            });
        }
    }, [profileData]);

    // ✅ Handle image preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // ✅ Mutation: Upload Image
    const uploadImageMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("profileImage", file);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${TOKEN}`,
                    },
                    body: formData,
                }
            );

            if (!res.ok) throw new Error("Failed to upload image");
            return res.json();
        },
        onSuccess: (data) => {
            const newUrl = data?.data?.profileImage || data?.profileImage;
            setFormData((prev) => ({ ...prev, profileImage: newUrl }));
            queryClient.invalidateQueries({ queryKey: ["profileData"] });
            setPreview("");
            setSelectedFile(null);
            toast.success("Profile image updated successfully");
        },
        onError: () => {
            toast.error("Failed to upload image");
        }
    });

    // ✅ Mutation: Update profile info
    const updateProfileMutation = useMutation({
        mutationFn: async (updatedData: typeof formData) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${TOKEN}`,
                    },
                    body: JSON.stringify(updatedData),
                }
            );
            if (!res.ok) throw new Error("Failed to update profile");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profileData"] });
            toast.success("Profile updated successfully");
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });

    const handleSaveProfile = () => {
        updateProfileMutation.mutate(formData);
    };

    const handleDiscard = () => {
        if (profileData?.data) {
            const user = profileData.data;
            setFormData({
                firstName: user.firstName || "",
                role: user.role || "",
                email: user.email || "",
                location: user.location || "",
                profileImage: user.profileImage || "",
                createdAt: new Date(user.createdAt).toLocaleDateString(),
            });
            setPreview("");
            setSelectedFile(null);
        }
    };

    if (isLoading)
        return <p className="text-center mt-10">Loading profile...</p>;
    if (isError)
        return (
            <p className="text-center mt-10 text-red-600">
                Failed to load profile data.
            </p>
        );

    return (
        <div className="flex gap-6 w-full">
            {/* Left Sidebar */}
            <div className="w-[290px] bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="relative">
                    <div className="h-[140px] bg-gradient-to-br from-green-400 to-green-600 rounded-t-lg"></div>
                    <div className="absolute top-[70px] left-1/2 transform -translate-x-1/2">
                        <div className="relative">
                            <div className="w-[120px] h-[120px] rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                                <Image
                                    width={300}
                                    height={300}
                                    src={preview || formData.profileImage || "/default-avatar.png"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label
                                htmlFor="imageUpload"
                                className="absolute bottom-0 right-0 w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-green-700 cursor-pointer"
                            >
                                <Edit className="w-4 h-4" />
                            </label>
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-6 px-6 text-center border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {formData.firstName}
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">{formData.role}</p>
                </div>

                <div className="px-6 py-4 space-y-3 text-sm border-b border-gray-200">
                    <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900 ml-1">{formData.email}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="text-gray-900 ml-1">{formData.location}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Member Since:</span>
                        <span className="text-gray-900 ml-1">{formData.createdAt}</span>
                    </div>
                </div>

                {/* Upload Image Button */}
                {selectedFile && (
                    <div className="p-4">
                        <Button
                            onClick={() => uploadImageMutation.mutate(selectedFile)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            disabled={uploadImageMutation.isPending}
                        >
                            {uploadImageMutation.isPending ? "Uploading..." : "Save Image"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Right Form Section */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        Personal Information
                    </h2>
                    <p className="text-sm text-gray-500">
                        Manage your personal information and profile details.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label>First Name</Label>
                            <Input
                                name="firstName"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                                className="h-11"
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Input
                                name="role"
                                readOnly
                                value={formData.role}
                                className="h-11 bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label>Email</Label>
                            <Input
                                name="email"
                                value={formData.email}
                                disabled
                                className="h-11 bg-gray-100"
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Input
                                name="location"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                                className="h-11"
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-6">
                    <Button
                        variant="outline"
                        onClick={handleDiscard}
                        className="px-6 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                        Discard Changes
                    </Button>
                    <Button
                        onClick={handleSaveProfile}
                        className="px-8 bg-green-600 hover:bg-green-700 text-white"
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
