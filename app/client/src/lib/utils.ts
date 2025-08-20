import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Attendance utils
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

export function formatDate(dateStr: string): string {
  const [day, month, year] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
}

export function formatDate2(dateStr: string): string {
  const [day, month, year] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export function stringToDate(date: string) {
  const [day, month, year] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Route detection utilities
export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/sign-up",
  "/reset",
  "/code",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/congrats",
  "/apply",
  "/quiz",
  "/docs",
  "/company",
  "/legal",
  "/product",
] as const;

export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
};

export const isProtectedRoute = (path: string): boolean => {
  return !isPublicRoute(path);
};

export const handleCVLink = (link: string) => {
  const key = link.split("/").pop();
  return `https://ats-system-checker-backend-production.up.railway.app/ats-checker/s3/file/${key}`;
};
