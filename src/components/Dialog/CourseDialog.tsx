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

type CourseResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    _id: string;
    title: string;
    description: string;
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
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
};

export function CourseDialog({ courseId }: { courseId: string }) {
  const { data, isLoading, error } = useQuery<CourseResponse>({
    queryKey: ["singleCourse", courseId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/course/${courseId}`
      );
      if (!res.ok) throw new Error("Failed to fetch course details");
      return res.json();
    },
  });

  const course = data?.data;

  const getEmbedUrl = (url: string) => {
    // YouTube Detection
    const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

    // Google Drive Detection
    const driveMatch = url.match(/\/d\/(.+?)\/view/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

    return null;
  };

  const VideoPlayer = ({ url }: { url: string }) => {
    const embedUrl = getEmbedUrl(url);

    return embedUrl ? (
      <iframe
        src={embedUrl}
        className="w-full rounded-lg border border-gray-200 shadow-sm"
        height="250"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <video
        controls
        src={url}
        className="w-full rounded-lg border border-gray-200 shadow-sm"
      />
    );
  };

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

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl shadow-xl scrollbar-thin scrollbar-thumb-gray-300">
        {isLoading ? (
          <p className="text-center py-6 text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center py-6 text-red-500">
            {(error as Error).message}
          </p>
        ) : course ? (
          <>
            <div className="relative w-full h-56">
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-5">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl font-semibold drop-shadow-md">
                    {course.title}
                  </DialogTitle>
                </DialogHeader>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-white">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-semibold mb-1 text-sm uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Level</p>
                  <p className="text-base font-semibold text-gray-800 mt-1 capitalize">
                    {course.level}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {course.duration}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Language</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {course.language}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Modules</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {course.modules}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    ${course.price}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Discount</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {course.discount}%
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-semibold mb-1 text-sm uppercase tracking-wide">
                  Target Audience
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {course.targetAudience}
                </p>
              </div>

              <div className="space-y-4">
                {course.introductionVideo && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Introduction Video
                    </p>
                    <VideoPlayer url={course.introductionVideo} />
                  </div>
                )}

                {course.courseVideo && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Course Video</p>
                    <VideoPlayer url={course.courseVideo} />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    course.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : course.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {course.status}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-center py-6 text-gray-500">No course details found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
