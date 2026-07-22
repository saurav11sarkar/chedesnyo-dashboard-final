"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditIndustryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updatedName: string) => void;
  initialName: string;
}

export function UpdateIndustry({
  open,
  onClose,
  onSave,
  initialName,
}: EditIndustryModalProps) {
  const [industryName, setIndustryName] = useState(initialName);

  // Keep input synced when modal reopens with new data
  useEffect(() => {
    setIndustryName(initialName);
  }, [initialName]);

  const handleSubmit = () => {
    if (!industryName.trim()) return;
    onSave(industryName);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Industry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-industry" className="text-sm font-medium text-gray-700">
              Industry Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-industry"
              placeholder="Enter updated industry name..."
              value={industryName}
              onChange={(e) => setIndustryName(e.target.value)}
              className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
