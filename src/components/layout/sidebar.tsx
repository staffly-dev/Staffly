import Image from "next/image";
import React from "react";

export function Sidebar() {
  return (
    <aside>
      <div className="p-4 flex items-center gap-2">
        <Image src="/imgs/logo.png" alt="HRMS Logo" width={40} height={40} />
        <p className="text-xl font-semibold">HRMS</p>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div></div>
      </div>
    </aside>
  );
}
