"use client";

import { useEffect, useState } from "react";
import { useEmployee } from "../context/EmployeeContext";
import { CreateEmployeeData } from "../types/employee";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

export default function EmployeeManagement() {
  const {
    employees,
    loading,
    error,
    addEmployee,
    getAllEmployees,
    deleteEmployee,
    clearError,
  } = useEmployee();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<CreateEmployeeData>>({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    emailAddress: "",
    dateOfBrith: "",
    maritalStatus: "",
    gender: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    employeeId: "",
    userName: "",
    employeeType: "",
    department: "",
    designation: "",
    workingDays: "",
    joiningAt: "",
    officeLocation: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        await getAllEmployees();
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, [getAllEmployees]);

  const handleAddEmployee = async () => {
    try {
      await addEmployee(newEmployee as CreateEmployeeData);
      setIsAddDialogOpen(false);
      setNewEmployee({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        emailAddress: "",
        dateOfBrith: "",
        maritalStatus: "",
        gender: "",
        nationality: "",
        address: "",
        city: "",
        state: "",
        zipcode: "",
        employeeId: "",
        userName: "",
        employeeType: "",
        department: "",
        designation: "",
        workingDays: "",
        joiningAt: "",
        officeLocation: "",
      });
    } catch (err) {
      console.error("Failed to add employee:", err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id);
      } catch (err) {
        console.error("Failed to delete employee:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Employee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newEmployee.firstName}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newEmployee.lastName}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.emailAddress}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      emailAddress: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={newEmployee.mobileNumber}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      mobileNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={newEmployee.employeeId}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      employeeId: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newEmployee.department}
                  onValueChange={(value) =>
                    setNewEmployee((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={newEmployee.designation}
                  onChange={(e) =>
                    setNewEmployee((prev) => ({
                      ...prev,
                      designation: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="employeeType">Employee Type</Label>
                <Select
                  value={newEmployee.employeeType}
                  onValueChange={(value) =>
                    setNewEmployee((prev) => ({ ...prev, employeeType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddEmployee}>Add Employee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="ml-2"
          >
            ×
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {employee.firstName} {employee.lastName}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {employee.emailAddress}
                  </p>
                </div>
                <Badge variant="secondary">{employee.employeeType}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Employee ID:</span>
                  <span className="text-sm">{employee.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Department:</span>
                  <span className="text-sm">{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Designation:</span>
                  <span className="text-sm">{employee.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Mobile:</span>
                  <span className="text-sm">{employee.mobileNumber}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteEmployee(employee._id!)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No employees found. Add your first employee to get started.
          </p>
        </div>
      )}
    </div>
  );
}
