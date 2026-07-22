"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DeleteModal } from "@/components/Dialog/DeleteModal";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header/PageHeader";
import Link from "next/link";

interface Blog {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface BlogResponse {
    statusCode: number;
    success: boolean;
    message: string;
    meta: {
        total: number;
        page: number;
        limit: number;
    };
    data: Blog[];
}

function BlogList() {
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const limit = 7;
    const session = useSession();
    const user = session?.data?.user;
    const TOKEN = user?.accessToken;

    // ✅ Fetch blog data from your API
    const {
        data: blogData,
        isLoading,
        isError,
        refetch,
    } = useQuery<BlogResponse>({
        queryKey: ["blogData", page],
        queryFn: async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog?page=${page}&limit=${limit}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!res.ok) throw new Error("Failed to fetch blog data");
            return res.json();
        },
    });

    // ✅ Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${TOKEN}`,
                    },
                }
            );
            if (!res.ok) throw new Error("Failed to delete blog");
            return res.json();
        },
        onSuccess: () => {
            refetch(); // ✅ Refresh list after deletion
            setDeleteId(null);
        },
        onError: () => {
            alert("Failed to delete blog");
        },
    });

    // ✅ Handle edit and delete actions
    const handleEdit = (id: string) => {
        console.log("Edit blog:", id);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId);
        }
    };

    // ✅ Loading and error states
    if (isLoading) {
        return (
            <div className="w-full text-center py-10 text-gray-500">
                Loading blogs...
            </div>
        );
    }

    if (isError || !blogData) {
        return (
            <div className="w-full text-center py-10 text-red-500">
                Failed to load blogs.
            </div>
        );
    }

    const totalResults = blogData.meta.total;
    const totalPages = Math.ceil(totalResults / limit);
    const blogs = blogData.data;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <PageHeader
                    title="Dashboard"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Revenue from Sales user" },
                    ]}
                />
                <div>
                    <Link href="/blog-management/add">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Blog
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="w-full bg-white rounded-lg shadow-sm">
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#E8F5E9] border-b border-gray-200">
                                <TableHead className="font-semibold text-gray-900 text-[18px] py-5 px-6 rounded-tl-lg w-[200px]">
                                    Blog Name
                                </TableHead>
                                <TableHead className="font-semibold text-gray-900 text-[18px] py-5 px-6 rounded-tr-lg text-right w-[150px]">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {blogs.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        className="text-center py-10 text-gray-500"
                                    >
                                        No blogs found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                blogs.map((blog) => (
                                    <TableRow
                                        key={blog._id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <TableCell className="py-5 px-6">
                                            <div className="flex items-start gap-4">
                                                <Image
                                                    width={250}
                                                    height={250}
                                                    src={blog.thumbnail}
                                                    alt={blog.title}
                                                    className="w-[140px] h-[90px] object-cover rounded"
                                                />
                                                <div>
                                                    <p className="text-[15px] font-semibold text-gray-800">
                                                        {blog.title}
                                                    </p>
                                                    <p
                                                        className="text-[14px] text-gray-700 leading-relaxed mt-1"
                                                        dangerouslySetInnerHTML={{
                                                            __html:
                                                                blog.description.length > 200
                                                                    ? blog.description.slice(0, 200) + "..."
                                                                    : blog.description,
                                                        }}
                                                    ></p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 px-6">
                                            <div className="flex items-center justify-end gap-3">
                                                <div className="mt-1.5">
                                                    <Link href={`/blog-management/edit/${blog._id}`}>
                                                        <button
                                                            onClick={() => handleEdit(blog._id)}
                                                            className="text-green-600 hover:text-green-700 transition-colors"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </button>
                                                    </Link>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(blog._id)}
                                                    className="text-red-500 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* ✅ Pagination */}
                {totalPages > 1 && (
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
                                onClick={() => setPage(Math.max(page - 1, 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                if (
                                    p === 1 ||
                                    p === totalPages ||
                                    (p >= page - 1 && p <= page + 1)
                                ) {
                                    return (
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
                                    );
                                } else if (p === page - 2 || p === page + 2) {
                                    return (
                                        <span key={p} className="px-2 text-gray-500">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            })}

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 bg-white border-gray-300"
                                onClick={() => setPage(Math.min(page + 1, totalPages))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ Delete Confirmation Modal */}
            <DeleteModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

export default BlogList;
