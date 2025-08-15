import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const EmployeeFeaturesCard = ({
  title,
  description,
  icon,
  items,
}: {
  title: string;
  description: string;
  items: string[];
  icon: React.ElementType;
}) => {
  const Icon = icon;
  return (
    <Card className="border-hrms-gray/40 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-foreground/90">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="w-4 h-4 text-primary mr-2" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
