"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterState) => void;
}

interface FilterState {
  departments: FilterOption[];
  workTypes: FilterOption[];
  searchTerm: string;
}

export function FilterDialog({
  open,
  onOpenChange,
  onApplyFilters,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterState>({
    departments: [
      { id: "design", label: "Design", checked: true },
      { id: "hr", label: "HR", checked: false },
      { id: "sales", label: "Sales", checked: false },
      { id: "business-analyst", label: "Business Analyst", checked: false },
      { id: "project-manager", label: "Project Manager", checked: true },
      { id: "java", label: "Java", checked: true },
      { id: "python", label: "Python", checked: true },
      { id: "react-js", label: "React JS", checked: false },
      { id: "account", label: "Account", checked: false },
      { id: "node-js", label: "Node JS", checked: false },
    ],
    workTypes: [
      { id: "office", label: "Office", checked: false },
      { id: "wfh", label: "Work from Home", checked: false },
    ],
    searchTerm: "",
  });

  const handleCheckboxChange = (
    section: "departments" | "workTypes",
    id: string,
    checked: boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [section]: prev[section].map((item) =>
        item.id === id ? { ...item, checked } : item
      ),
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: e.target.value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Employee"
              className="pl-8"
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Department</h3>
            <div className="grid grid-cols-2 gap-2">
              {filters.departments.slice(0, 5).map((dept) => (
                <div key={dept.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dept.id}
                    checked={dept.checked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "departments",
                        dept.id,
                        checked === true
                      )
                    }
                  />
                  <label htmlFor={dept.id} className="text-sm">
                    {dept.label}
                  </label>
                </div>
              ))}
              {filters.departments.slice(5).map((dept) => (
                <div key={dept.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={dept.id}
                    checked={dept.checked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "departments",
                        dept.id,
                        checked === true
                      )
                    }
                  />
                  <label htmlFor={dept.id} className="text-sm">
                    {dept.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Select Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {filters.workTypes.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.id}
                    checked={type.checked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "workTypes",
                        type.id,
                        checked === true
                      )
                    }
                  />
                  <label htmlFor={type.id} className="text-sm">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} className="hover:bg-primary-700">
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
