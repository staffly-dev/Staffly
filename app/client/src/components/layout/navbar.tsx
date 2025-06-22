"use client";
import Image from "next/image";
import { IoMdNotificationsOutline, IoIosArrowDown } from "react-icons/io";
import { Breadcrumbs } from "../BreadCrumb";
import Link from "next/link";
import { SearchInput } from "../searchInput";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { HiOutlineLogout } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, router, loading]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex flex-col w-fit">
        <Breadcrumbs name={user?.name.split(" ")[0]} />
      </div>
      <div className="flex items-center justify-center gap-4">
        <SearchInput />
        <Link
          href="/notifications"
          className="flex items-center justify-center bg-hrms-gray/10 rounded-xl p-2 cursor-pointer"
        >
          <IoMdNotificationsOutline className="text-2xl" />
        </Link>
        <div className="flex items-center gap-2 justify-center border border-hrms-gray/20 rounded-xl p-1">
          <Image
            src="/imgs/logo.png"
            alt="Avatar"
            className="rounded-xl"
            width={32}
            height={32}
          />
          <div className="flex flex-col">
            <div className="flex gap-1 justify-center items-center">
              <h3 className="font-bold">{user?.name}</h3>
              <Popover>
                <PopoverTrigger>
                  <IoIosArrowDown className="text-xl" />
                </PopoverTrigger>
                <PopoverContent className="w-40  border-hrms-gray/20">
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/profile"
                      className="w-fit flex items-center gap-2"
                    >
                      <CgProfile className="text-xl" />
                      My Profile
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="text-red-500 p-0 w-fit hover:bg-transparent hover:text-red-700"
                    >
                      <HiOutlineLogout className="text-xl" />
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs">FrontEnd Dev</p>
          </div>
        </div>
      </div>
    </header>
  );
}
