import Image from "next/image";
import { Input } from "../ui/input";
import { CiSearch } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Select, SelectItem, SelectTrigger, SelectContent } from "../ui/select";
import { Breadcrumbs } from "../BreadCrumb";

export function Navbar() {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex flex-col w-fit">
        <Breadcrumbs />
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="w-60 relative">
          <Input
            type="search"
            name="search"
            id="search"
            placeholder="Search..."
            className="w-full pl-8 pr-4 outline-hrms-gray/20 border-hrms-gray/20"
          />
          <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="flex items-center justify-center bg-hrms-gray/10 rounded-xl p-2 cursor-pointer">
          <IoMdNotificationsOutline className="text-2xl" />
        </div>
        <div className="flex items-center gap-2 justify-center border border-hrms-gray/20 rounded-xl p-1">
          <Image
            src="/imgs/logo.png"
            alt="Avatar"
            className="rounded-xl"
            width={24}
            height={32}
          />
          <div className="flex flex-col">
            <div className="flex gap-1 justify-center items-center">
              <h3 className="font-bold">Mazin Emad</h3>
              <Select>
                <SelectTrigger className="w-fit h-fit p-0 border-none outline-none" />
                <SelectContent>
                  <SelectItem value="Profile">Profile</SelectItem>
                  <SelectItem value="Log Out">Log Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs">FrontEnd Dev</p>
          </div>
        </div>
      </div>
    </header>
  );
}
