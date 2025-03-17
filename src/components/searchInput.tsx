"use client";
import { CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function SearchInput() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-60 relative flex items-center">
      <Input
        type="search"
        name="search"
        id="search"
        placeholder="Search..."
        className="w-full pl-8 pr-4 outline-hrms-gray/20 border-hrms-gray/20"
        value={searchQuery}
        onChange={handleSearch}
      />
      <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" />
    </div>
  );
}
