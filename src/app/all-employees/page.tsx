import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const employeesData = [
  {
    employeeId: "345321231",
    name: "Darlene Robertson",
    avatar: "/imgs/avatar.png",
    department: "Design",
    designation: "UI/UX Designer",
    type: "Remote",
    status: "Permanent",
  },
  {
    employeeId: "987890345",
    name: "Floyd Miles",
    avatar: "/imgs/avatar.png",
    department: "Developement",
    designation: "PHP Developer",
    type: "Office",
    status: "Permanent",
  },
  {
    employeeId: "453367122",
    name: "Cody Fisher",
    avatar: "/imgs/avatar.png",
    department: "Sales",
    designation: "Sales Manager",
    type: "Office",
    status: "Permanent",
  },
  {
    employeeId: "345321231",
    name: "Dianne Russell",
    avatar: "/imgs/avatar.png",
    department: "Design",
    designation: "BDM",
    type: "Remote",
    status: "Permanent",
  },
  {
    employeeId: "453677881",
    name: "Savannah Nguyen",
    avatar: "/imgs/avatar.png",
    department: "Developement",
    designation: "Design Lead",
    type: "Remote",
    status: "Permanent",
  },
  {
    employeeId: "009918765",
    name: "Jacob Jones",
    avatar: "/imgs/avatar.png",
    department: "PM",
    designation: "Python Developer",
    type: "Remote",
    status: "Permanent",
  },
  {
    employeeId: "238870122",
    name: "Marvin McKinney",
    avatar: "/imgs/avatar.png",
    department: "HR",
    designation: "Sr. UI Developer",
    type: "Office",
    status: "Permanent",
  },
  {
    employeeId: "124335111",
    name: "Brooklyn Simmons",
    avatar: "/imgs/avatar.png",
    department: "Developement",
    designation: "Project Manager",
    type: "Office",
    status: "Permanent",
  },
  {
    employeeId: "435540099",
    name: "Kristin Watson",
    avatar: "/imgs/avatar.png",
    department: "Developement",
    designation: "HR Executive",
    type: "Office",
    status: "Permanent",
  },
  {
    employeeId: "009812890",
    name: "Kathryn Murphy",
    avatar: "/imgs/avatar.png",
    department: "Design",
    designation: "React JS Developer",
    type: "Remote",
    status: "Permanent",
  },
  {
    employeeId: "671190345",
    name: "Arlene McCoy",
    avatar: "/imgs/avatar.png",
    department: "PM",
    designation: "Node JS",
    type: "Office",
    status: "Permanent",
  },
  {
    employeeId: "091233412",
    name: "Devon Lane",
    avatar: "/imgs/avatar.png",
    department: "BA",
    designation: "Business Analyst ",
    type: "Remote",
    status: "Permanent",
  },
];

export default function employees() {
  return (
    <div className="space-y-8">
      {/* Attendance Overview */}
      <div>
        {/* Attendance List */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w- text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-muted"
              />
            </div>
            <div className="flex space-x-3">
              <Button className="flex items-center space-x-2 bg-purple-600 text-white font-medium px-5 py-2.5 rounded-lg transition">
                <span className="text-lg">➕</span>
                <span>Add New Employee</span>
              </Button>

              <Button className="flex items-center space-x-2 border border-gray-300 text-black font-medium px-5 py-2.5 rounded-lg hover:bg-gray-100 transition">
                <span className="text-lg">⚙️</span>
                <span>Filter</span>
              </Button>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left font-medium py-3">Employee Name</th>
                  <th className="text-left font-medium py-3">Employee ID</th>
                  <th className="text-left font-medium py-3">Department</th>
                  <th className="text-left font-medium py-3">Designation</th>
                  <th className="text-left font-medium py-3">Type</th>
                  <th className="text-left font-medium py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {employeesData.map((employee) => (
                  <tr key={employee.name} className="border-b last:border-none">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={employee.avatar}
                          alt={employee.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="font-medium">{employee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      <span className="font-medium">{employee.employeeId}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-medium">{employee.department}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-medium">
                        {employee.designation}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="font-medium">{employee.type}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-medium">{employee.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
