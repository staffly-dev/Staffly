import {
  Users,
  Building2,
  FileText,
  Calendar,
  BarChart3,
  Target,
  Clock,
} from "lucide-react";

export const departments = [
  "HR",
  "IT",
  "Sales",
  "Marketing",
  "Finance",
  "Operations",
  "Engineering",
  "Management",
  "Customer Service",
];

export const nationalities = [
  "Egyptian",
  "Sudanese",
  "Iraqi",
  "Syrian",
  "Lebanese",
  "Jordanian",
  "Palestinian",
  "Saudi",
  "Qatari",
  "Emirati",
  "Omani",
  "Australian",
  "New Zealander",
  "South African",
  "Indian",
  "Chinese",
  "Japanese",
];

export const cities = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Suez",
  "Luxor",
  "Aswan",
  "Asyut",
  "Sohag",
  "Qena",
  "Qalyubia",
  "Kafr El Sheikh",
];

export const states = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Suez",
  "Luxor",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Dakahlia",
  "Damietta",
  "Faiyum",
];

export const offices = [
  "Remote",
  "Cairo",
  "Giza",
  "Alexandria",
  "Suez",
  "Luxor",
  "Aswan",
];

export const features = [
  {
    title: "Employee Profiles",
    description:
      "Centralized employee records with comprehensive information management",
    items: [
      "Personal & professional details",
      "Document storage & management",
      "Performance history tracking",
    ],
    icon: Users,
  },
  {
    title: "Department Management",
    description: "Organize your workforce with flexible department structures",
    items: [
      "Hierarchical organization",
      "Role-based permissions",
      "Team collaboration tools",
    ],
    icon: Building2,
  },
  {
    title: "Onboarding/Offboarding",
    description: "Streamlined processes for smooth employee transitions",
    items: [
      "Automated workflows",
      "Checklist management",
      "Compliance tracking",
    ],
    icon: FileText,
  },
];

export const hrOperations = [
  {
    title: "Payroll Management",
    description:
      "Automated payroll processing with tax calculations and compliance",
    icon: BarChart3,
    iconColor: "white",
  },
  {
    title: "Leave Management",
    description: "Comprehensive leave tracking with approval workflows",
    icon: Calendar,
    iconColor: "white",
  },
  {
    title: "Attendance Tracking",
    description: "Real-time check-in/out with geolocation and reporting",
    icon: Clock,
    iconColor: "white",
  },
  {
    title: "Performance Evaluations",
    description:
      "Structured performance reviews with goal setting and tracking",
    icon: Target,
    iconColor: "white",
  },
];

export const businessIntelligence = [
  {
    title: "Dashboard Analytics",
    description: "Real-time insights into your HR metrics and KPIs",
    icon: BarChart3,
    iconColor: "white",
    items: [
      "Employee turnover rates",
      "Hiring funnel analytics",
      "Performance trends",
    ],
  },
  {
    title: "Reporting & Insights",
    description: "Comprehensive reports for compliance and strategic planning",
    icon: BarChart3,
    iconColor: "white",
    items: [
      "Custom report builder",
      "Data visualization",
      "Key performance indicators",
    ],
  },
  {
    title: "Performance Metrics",
    description: "Track and optimize your HR team's effectiveness",
    icon: BarChart3,
    iconColor: "white",
    items: [
      "Time-to-hire tracking",
      "Cost-per-hire analysis",
      "Employee satisfaction scores",
    ],
  },
];
