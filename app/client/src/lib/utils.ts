import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const saveCheckedInEmployees = (employeeId: string) => {
  const checkedInEmployees = localStorage.getItem("checkedInEmployees");
  if (checkedInEmployees) {
    const employees = JSON.parse(checkedInEmployees);
    employees.push(employeeId);
    localStorage.setItem("checkedInEmployees", JSON.stringify(employees));
  } else {
    localStorage.setItem("checkedInEmployees", JSON.stringify([employeeId]));
  }
};

export const getCheckedInEmployees = () => {
  const checkedInEmployees = localStorage.getItem("checkedInEmployees");
  if (checkedInEmployees) {
    return JSON.parse(checkedInEmployees);
  }
  return [];
};
