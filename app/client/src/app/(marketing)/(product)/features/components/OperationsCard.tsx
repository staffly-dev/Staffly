import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface HROperationsCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
}

export const HROperationsCard = ({
  title,
  description,
  icon,
  iconColor,
}: HROperationsCardProps) => {
  const Icon = icon;
  return (
    <Card className="shadow-md text-center">
      <CardHeader className="pb-4">
        <div className="w-10 h-10 bg-primary/70 rounded-lg flex items-center justify-center mb-4 mx-auto">
          <Icon className={`w-5 h-5 text-${iconColor}`} />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
