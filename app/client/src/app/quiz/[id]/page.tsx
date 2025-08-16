"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useJob } from "@/context/JobContext";
import type { QuizData } from "@/context/JobContext";
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
// import QuestionCard from "./QuestionCard";
import GetStartedAtTime from "./GetStartedAtTime";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ErrorComponent from "@/components/ErrorComponent";

const QuizPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { getQuizBySessionId, loading, error, submitQuiz, clearError } =
    useJob();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    getQuizBySessionId(id as string)
      .then(setQuiz)
      .catch((err) => setFetchError(err.message));
  }, [id, getQuizBySessionId]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (quiz && Object.keys(answers).length < quiz.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const answersString = Object.values(answers).map((answer) =>
      Number(answer)
    );
    const formData = new FormData();
    formData.append("answers", JSON.stringify(answersString));
    formData.append("email", quiz.candidate_email);
    formData.append("quiz_session_id", id as string);
    const result = await submitQuiz({
      answers: formData.get("answers") as string,
      email: formData.get("email") as string,
      quiz_session_id: formData.get("quiz_session_id") as string,
    });
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
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 dark:border-white border-gray-900 "></div>
      </div>
    );
  if (error || fetchError)
    return (
      <ErrorComponent
        error={error}
        fetchError={fetchError}
        clearError={clearError}
      />
    );

  if (!quiz) return <div></div>;

  if (quiz.status === "COMPLETED" || submitted) {
    return (
      <Card className="p-4 max-w-2xl mx-auto my-10">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Candidate with email {quiz.candidate_email} has already taken the
            quiz
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
            Quiz for {quiz.job_title}
            <span className="text-sm text-gray-500">
              {quiz.total_questions} questions
            </span>
          </CardTitle>
          <CardDescription className="pt-2">
            <p className="text-center">
              Time: {quiz.time_limit_seconds} seconds |{" "}
              <GetStartedAtTime startedAt={quiz.started_at} />
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
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < quiz.questions.length}
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizPage;
