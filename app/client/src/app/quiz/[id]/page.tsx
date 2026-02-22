"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuizBySessionId, useSubmitQuiz } from "@/hooks/useJobs";
import type { QuizData } from "@/hooks/useJobs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GetStartedAtTime from "./GetStartedAtTime";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ErrorComponent from "@/components/ErrorComponent";
import LoadingComponent from "@/components/LoadingComponent";

const QuizPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const {
    data: quiz,
    isLoading: loading,
    error,
  } = useQuizBySessionId(id as string);
  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz();
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (quiz?.candidate_email && !email) setEmail(quiz.candidate_email);
  }, [quiz?.candidate_email]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz || !id) return;

    const userEmail = (email.trim() || (quiz.candidate_email ?? "")).trim();
    if (!userEmail) {
      toast.error("Please enter your email address");
      return;
    }

    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    const answersString = Object.values(answers).map((answer) =>
      Number(answer)
    );

    submitQuiz(
      {
        answers: JSON.stringify(answersString),
        email: userEmail,
        quiz_session_id: id,
      },
      {
        onSuccess: (result) => {
          if (result?.success) {
            setSubmitted(true);
            toast.success("Quiz submitted successfully", {
              description: "You will be notified of the result through email",
              action: {
                label: "Close",
                onClick: () => {
                  router.push("/");
                },
              },
              duration: 4000,
              position: "top-center",
            });
          } else {
            toast.error("Quiz submission failed", {
              duration: 4000,
              position: "top-center",
            });
          }
        },
        onError: (error) => {
          toast.error("Quiz submission failed", {
            duration: 4000,
            position: "top-center",
          });
          console.error("Submit error:", error);
        },
      }
    );
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !quiz) {
    return <ErrorComponent error="Failed to load quiz" clearError={() => {}} />;
  }

  if (quiz.status === "COMPLETED" || submitted) {
    return (
      <Card className="p-4 max-w-2xl mx-auto my-10">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {quiz.candidate_email
              ? `Candidate with email ${quiz.candidate_email} has already taken the quiz`
              : "This quiz has already been completed."}
          </CardTitle>
          <CardDescription className="text-center text-red-500 font-bold">
            You can&apos;t take the quiz again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 my-10">
      <Card className="p-4 max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="sm:text-2xl text-lg max-sm:text-center gap-2 max-sm:flex-col flex justify-between items-center">
            Quiz{quiz.job_title ? ` for ${quiz.job_title}` : ""}
            <span className="text-sm text-gray-500">
              {quiz.total_questions} questions
            </span>
          </CardTitle>
          <CardDescription className="pt-2">
            <p className="text-center">
              Time: {quiz.time_limit_seconds} seconds
              {quiz.started_at && (
                <>
                  {" | "}
                  <GetStartedAtTime startedAt={quiz.started_at} />
                </>
              )}
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="p-4 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center gap-2  text-xl">
            Questions{" "}
            <span className="text-sm text-gray-500">
              Minimum Score to Pass: {quiz.pass_threshold}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {quiz.questions.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1}: {question.question}
                </CardTitle>
                <CardDescription className="flex flex-col gap-2 pt-4">
                  <RadioGroup
                    value={answers[index] || ""}
                    onValueChange={(value) => handleAnswerChange(index, value)}
                  >
                    {question.options.map((option, ndx) => (
                      <div key={ndx} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={ndx.toString()}
                          id={`${index}-${ndx}`}
                        />
                        <Label
                          htmlFor={`${index}-${ndx}`}
                          className="w-full bg-transparent transition-all duration-300 border-2 border-hrms-gray/10 p-3 rounded-md cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="quiz-email">Your email (to receive results)</Label>
            <Input
              id="quiz-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={
              Object.keys(answers).length < quiz.questions.length ||
              !email.trim() ||
              isSubmitting
            }
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizPage;
