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
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function Navbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const userData = user?.user;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex flex-col w-fit">
        <Breadcrumbs name={userData?.name?.split(" ")[0] || "User"} />
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
            src={userData?.profilePicture || "/imgs/logo.png"}
            alt="Avatar"
            className="rounded-xl"
            width={32}
            height={32}
          />
          <div className="flex flex-col">
            <div className="flex gap-1 justify-center items-center">
              <h3 className="font-bold">{userData?.name || "User"}</h3>
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
                      disabled={isLoggingOut}
                    >
                      <HiOutlineLogout className="text-xl" />
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs">{userData?.role || "Role"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
