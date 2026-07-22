"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItemType[];
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
  };
}

export function PageHeader({ title, breadcrumbs, actionButton }: PageHeaderProps) {
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-gray-900 text-[24px] leading-[120%] font-semibold">{title}</h1>
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-sm">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {item.href ? (
                    <Link 
                      href={item.href}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-gray-500">{item.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>

        {actionButton && (
          <>
            {actionButton.href ? (
              <Link href={actionButton.href}>
                <Button className="bg-green-700 hover:bg-green-800 text-white">
                  {actionButton.icon || <Plus className="h-4 w-4 mr-2" />}
                  {actionButton.label}
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={actionButton.onClick}
                className="bg-green-700 hover:bg-green-800 text-white"
              >
                {actionButton.icon || <Plus className="h-4 w-4 mr-2" />}
                {actionButton.label}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
