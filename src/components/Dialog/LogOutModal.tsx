"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface LogoutModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function LogoutModal({ isOpen, setIsOpen }: LogoutModalProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/signin" }); // redirect to signin after logout
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 my-4">Are you sure you want to log out?</p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
