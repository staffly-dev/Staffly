import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EachRoute, getRoutesForVersion } from "./docs/routes-config";

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

// Docs & Blog utils
export function helperSearch(
  query: string,
  node: EachRoute,
  prefix: string,
  currenLevel: number,
  maxLevel?: number
) {
  const res: EachRoute[] = [];
  let parentHas = false;

  const nextLink = `${prefix}${node.href}`;
  if (!node.noLink && node.title.toLowerCase().includes(query.toLowerCase())) {
    res.push({ ...node, items: undefined, href: nextLink });
    parentHas = true;
  }
  const goNext = maxLevel ? currenLevel < maxLevel : true;
  if (goNext)
    node.items?.forEach((item) => {
      const innerRes = helperSearch(
        query,
        item,
        nextLink,
        currenLevel + 1,
        maxLevel
      );
      if (!!innerRes.length && !parentHas && !node.noLink) {
        res.push({ ...node, items: undefined, href: nextLink });
        parentHas = true;
      }
      res.push(...innerRes);
    });
  return res;
}

export function advanceSearch(query: string) {
  const routes = getRoutesForVersion();
  return routes
    .map((node) =>
      helperSearch(query, node, "", 1, query.length == 0 ? 2 : undefined)
    )
    .flat();
}

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
