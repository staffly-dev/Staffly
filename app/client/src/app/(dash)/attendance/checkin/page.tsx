"use client";
import { Card } from "@/components/ui/card";
import { CheckInTable } from "./CheckInTable";
import { SearchInput } from "@/components/searchInput";

export function CheckInCard() {
  return (
    <Card className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <SearchInput />
      </div>
      <CheckInTable />
    </Card>
  );
}

export default function CheckInPage() {
  return <CheckInCard />;
}
