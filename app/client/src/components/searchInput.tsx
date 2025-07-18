"use client";
import { CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className={cn("w-60 relative flex items-center", className)}>
      <Input
        type="search"
        name="search"
        placeholder="Search..."
        className=" w-full pl-8 pr-4 outline-hrms-gray/20 border-hrms-gray/20"
        {...props}
      />
      <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" />
    </div>
  );
}
