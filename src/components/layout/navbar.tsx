import Image from "next/image";
import { Input } from "../ui/input";
import { CiSearch } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Select, SelectItem, SelectTrigger, SelectContent } from "../ui/select";

function morningOrAfternoon() {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 12) return "Morning";
  if (hours >= 12 && hours < 17) return "Afternoon";
  return "Evening";
}

export function Navbar() {
  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex flex-col w-fit">
        <h2 className="font-bold">Hello Mazin 👋🏻</h2>
        <p className="text-muted-foreground text-sm">
          Good {morningOrAfternoon()}
        </p>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="w-60 relative">
          <Input
            type="search"
            name="search"
            id="search"
            placeholder="Search..."
            className="w-full pl-8 pr-4"
          />
          <CiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="flex items-center justify-center bg-muted-foreground rounded-xl p-2">
          <IoMdNotificationsOutline className="text-2xl" />
        </div>
        <div className="flex items-center gap-2 justify-center border rounded-xl p-1">
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
