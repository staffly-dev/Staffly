import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizQuestion } from "@/context/JobContext";
import { Button } from "@/components/ui/button";

const QuestionCard = ({
  question,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Question {index + 1}: {question.question}
        </CardTitle>
        <CardDescription className="flex flex-col gap-2 pt-4">
          {question.options.map((option) => (
            <Button
              className="w-full bg-transparent transition-all duration-300 border-2 border-hrms-gray/10"
              key={option}
            >
              {option}
            </Button>
          ))}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default QuestionCard;
