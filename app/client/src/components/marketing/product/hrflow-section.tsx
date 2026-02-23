"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Calendar, FileText, DollarSign } from "lucide-react";

interface HRItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
}

export default function HRFlowSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const hrItems: HRItem[] = [
    {
      id: "people",
      title: "People",
      description: "Manage your team members and their information",
      icon: <Users className="size-5" />,
      image: "/imgs/people2.png",
    },
    {
      id: "leave",
      title: "Leave Management",
      description: "Handle time-off requests and approvals",
      icon: <Calendar className="size-5" />,
      image: "/imgs/leave.png",
    },
    {
      id: "contracts",
      title: "Contracts",
      description: "Digital contract management and signing",
      icon: <FileText className="size-5" />,
      image: "/imgs/contracts.png",
    },
    {
      id: "salary",
      title: "Salary",
      description: "Payroll and compensation management",
      icon: <DollarSign className="size-5" />,
      image: "/imgs/salary.png",
    },
    // {
    //   id: 'profile',
    //   title: 'Profile',
    //   description: 'Employee profiles and documents',
    //   icon: <User className="size-5" />,
    //   image: '/imgs/frame.png',
    // },
    // {
    //   id: 'enps',
    //   title: 'eNPS',
    //   description: 'Employee satisfaction and feedback',
    //   icon: <BarChart2 className="size-5" />,
    //   image: '/imgs/frame.png',
    // },
  ];

  // Auto-rotate items every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % hrItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="lg:col-span-2">
            <div className="md:pr-6 lg:pr-0">
              <h2 className="text-4xl font-semibold lg:text-5xl">
                Staffly Flow
              </h2>
              <p className="mt-6">
                Closing the gap between HR and employees, one step at a time!
              </p>
            </div>
            <ul className="mt-8 divide-y border-y">
              {hrItems.map((item, index) => (
                <li
                  key={item.id}
                  onClick={() => handleItemClick(index)}
                  className={`flex cursor-pointer items-center gap-3 py-3 transition-colors ${activeIndex === index ? "text-primary" : ""}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${activeIndex === index ? "text-primary" : "text-hrms-gray/80"}`}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-hrms-gray/80">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-b from-zinc-50 to-white p-3 shadow-lg dark:from-zinc-800 dark:to-zinc-900">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image
                  src={hrItems[activeIndex].image}
                  alt={hrItems[activeIndex].title}
                  fill
                  className="object-cover transition-opacity duration-500"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <h3 className="text-2xl font-bold">
                    {hrItems[activeIndex].title}
                  </h3>
                  <p>{hrItems[activeIndex].description}</p>
                </div>
              </div>
            </div>
            {/* Dots indicator */}
            <div className="mt-4 flex justify-center gap-2">
              {hrItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(index)}
                  className={`h-2 rounded-full transition-all ${activeIndex === index ? "w-6 bg-primary" : "w-2 bg-hrms-gray/80"}`}
                  aria-label={`Show ${hrItems[index].title}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
