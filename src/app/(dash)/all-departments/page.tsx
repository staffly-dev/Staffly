import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";

interface Member {
  name: string;
  role: string;
  image: string;
}

interface Department {
  name: string;
  members: Member[];
}

const departments: Department[] = [
  {
    name: "Design Department",
    members: [
      {
        name: "Dionne Russell",
        role: "Sr. UI/UX Designer",
        image: "/imgs/user.png",
      },
      {
        name: "Arlene McCoy",
        role: "Sr. UI/UX Designer",
        image: "/imgs/user.png",
      },
      {
        name: "Cody Fisher",
        role: "Sr. UI/UX Designer",
        image: "/imgs/user.png",
      },
      { name: "Theresa Webb", role: "UI/UX Designer", image: "/imgs/test.png" },
      {
        name: "Ronald Richards",
        role: "UI/UX Designer",
        image: "/imgs/user.png",
      },
    ],
  },
  {
    name: "Sales Department",
    members: [
      {
        name: "Darrell Steward",
        role: "Sr. Sales Manager",
        image: "/imgs/user.png",
      },
      {
        name: "Kristin Watson",
        role: "Sr. Sales Manager",
        image: "/imgs/user.png",
      },
      { name: "Courtney Henry", role: "BDM", image: "/imgs/user.png" },
      { name: "Kathryn Murphy", role: "BDE", image: "/imgs/user.png" },
      { name: "Albert Flores", role: "Sales", image: "/imgs/user.png" },
    ],
  },
  {
    name: "Project Manager Department",
    members: [
      {
        name: "Leslie Alexander",
        role: "Sr. Project Manager",
        image: "/imgs/user.png",
      },
      {
        name: "Ronald Richards",
        role: "Sr. Project Manager",
        image: "/imgs/user.png",
      },
      {
        name: "Savannah Nguyen",
        role: "Project Manager",
        image: "/imgs/user.png",
      },
      {
        name: "Eleanor Pena",
        role: "Project Manager",
        image: "/imgs/user.png",
      },
      {
        name: "Esther Howard",
        role: "Project Manager",
        image: "/imgs/user.png",
      },
    ],
  },
  {
    name: "Marketing Department",
    members: [
      {
        name: "Wade Warren",
        role: "Sr. Marketing Manager",
        image: "/imgs/user.png",
      },
      {
        name: "Brooklyn Simmons",
        role: "Sr. Marketing Manager",
        image: "/imgs/user.png",
      },
      {
        name: "Kristin Watson",
        role: "Marketing Coordinator",
        image: "/imgs/user.png",
      },
      {
        name: "Jacob Jones",
        role: "Marketing Coordinator",
        image: "/imgs/user.png",
      },
      { name: "Cody Fisher", role: "Marketing", image: "/imgs/user.png" },
    ],
  },
];

export default function Page() {
  return (
    <Card className="border-hrms-gray/20 bg-transparent p-4">
      <div className="w-60 relative mb-5">
        <Input
          type="search"
          name="search"
          id="search"
          placeholder="Search..."
          className="w-full pl-8 pr-4 outline-hrms-gray/20 border-hrms-gray/20"
        />
        <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept, index) => (
          <Card key={index} className="bg-transparent p-3 border-hrms-gray/20">
            <div className="flex justify-between items-center pb-3 border-b-2 border-hrms-gray/20">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {dept.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dept.members.length} Members
                </p>
              </div>
              <Link
                href={`all-departments/${dept.name
                  .toLowerCase()
                  .split(" ")
                  .join("-")}`}
                className="text-primary hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4 pt-3">
              {dept.members.slice(0, 5).map((member, memberIndex) => (
                <div
                  key={memberIndex}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <Image
                      src="/icons/arrow-left.svg"
                      alt="View"
                      width={20}
                      height={20}
                      className="rotate-180"
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
