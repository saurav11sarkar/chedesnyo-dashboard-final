"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

// ReactQuill dynamic import
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";

export default function EditBlogDesign() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const params = useParams();
  const { id } = params;
  const queryClient = useQueryClient();
  const session = useSession();
  const user = session?.data?.user;
  const TOKEN = user?.accessToken;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string>("/placeholder.svg");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Fetch single blog
  const { data: singleBlogData } = useQuery({
    queryKey: ["singleBlog", id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/${id}`);
      if (!res.ok) throw new Error("Failed to fetch blog data");
      return res.json();
    },
    enabled: !!id,
  });

  // Set default values from API
  useEffect(() => {
    if (singleBlogData?.data) {
      setFormData({
        title: singleBlogData.data.title || "",
        description: singleBlogData.data.description || "",
      });
      setThumbnailPreview(singleBlogData.data.thumbnail || "/placeholder.svg");
    }
  }, [singleBlogData]);

  // Handle description change
  const handleDescriptionChange = (content: string) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  // Handle thumbnail click
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file select
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnailFile(file);

    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(singleBlogData?.data?.thumbnail || "/placeholder.svg");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Mutation for updating blog
  const editBlogMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      if (thumbnailFile) form.append("thumbnail", thumbnailFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
        body: form,
      });

      if (!res.ok) {
        throw new Error("Failed to update blog");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["singleBlog", id]});
      toast.success("Blog updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update blog");
    },
  });

  const handleSaveChanges = () => {
    editBlogMutation.mutate();
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Blog</h1>
            <p className="text-gray-500">Dashboard &gt; Blog management &gt; Edit</p>
          </div>
          <Button
            type="button"
            onClick={handleSaveChanges}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        {/* Form */}
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side: Title & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Label htmlFor="title">Blog Title</Label>
              <Input
                id="title"
                placeholder="Edit title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-3 border border-[#707070] h-[50px]"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <div className="mt-3 border border-[#707070] rounded-md overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "image", "video"],
                      ["clean"],
                    ],
                  }}
                  formats={[
                    "header", "bold", "italic", "underline", "strike",
                    "list", "bullet", "link", "image", "video",
                  ]}
                  placeholder="Edit your blog content here..."
                  style={{ height: "300px" }}
                />
              </div>
            </div>
          </div>

          {/* Right side: Thumbnail */}
          <div className="space-y-6">
            <Label>Thumbnail</Label>
            <Card className="shadow-none h-[410px] border border-[#707070]">
              <CardContent className="p-6 h-full">
                <div className="relative h-full">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={handleImageClick}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Upload thumbnail</p>
                    <p className="text-sm text-gray-400 mt-2">Click to browse files</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
