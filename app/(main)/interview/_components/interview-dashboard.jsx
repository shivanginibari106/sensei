"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MessageSquare,
  Trophy,
  Target,
  TrendingUp,
  Play,
  ChevronRight,
  CheckCircle,
  XCircle,
  Lightbulb,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateQuiz, saveQuizResult } from "@/actions/interview";
import { toast } from "sonner";
import { format } from "date-fns";

function StatsCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="text-2xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function QuizModal({ open, onClose, onComplete }) {
  const [phase, setPhase] = useState("loading"); // loading | quiz | result
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const startQuiz = async () => {
    setPhase("loading");
    try {
      const qs = await generateQuiz();
      setQuestions(qs);
      setCurrent(0);
      setAnswers({});
      setSelected("");
      setPhase("quiz");
    } catch {
      toast.error("Failed to generate quiz. Try again.");
      onClose();
    }
  };

  // Auto-start when opened
  useState(() => {
    if (open) startQuiz();
  });

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [current]: selected };
    setAnswers(newAnswers);
    setSelected("");

    if (current + 1 >= questions.length) {
      // Calculate result
      const correct = questions.filter((q, i) => newAnswers[i] === q.correctAnswer).length;
      const score = Math.round((correct / questions.length) * 100);
      setResult({ score, correct, answers: newAnswers });
      setPhase("result");
    } else {
      setCurrent(current + 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveQuizResult({
        questions,
        answers: questions.map((_, i) => result.answers[i]),
        score: result.score,
      });
      toast.success("Quiz saved!");
      onComplete();
      onClose();
    } catch {
      toast.error("Failed to save result");
    } finally {
      setSaving(false);
    }
  };

  const q = questions[current];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <DialogTitle className="sr-only">Starting Quiz...</DialogTitle>
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating 10 personalized questions...</p>
          </div>
        )}

        {phase === "quiz" && q && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Question {current + 1} of {questions.length}</Badge>
                <span className="text-sm text-muted-foreground">{Math.round(((current) / questions.length) * 100)}% complete</span>
              </div>
              <Progress value={(current / questions.length) * 100} className="h-1.5" />
              <DialogTitle className="text-lg mt-4 leading-snug">{q.question}</DialogTitle>
            </DialogHeader>
            <RadioGroup value={selected} onValueChange={setSelected} className="space-y-3 mt-2">
              {q.options.map((opt, i) => {
                const letter = ["A", "B", "C", "D"][i];
                return (
                  <div
                    key={letter}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selected === letter
                        ? "border-primary bg-primary/10"
                        : "border-border/50 hover:border-primary/40"
                    }`}
                    onClick={() => setSelected(letter)}
                  >
                    <RadioGroupItem value={letter} id={letter} />
                    <Label htmlFor={letter} className="cursor-pointer flex-1">{opt}</Label>
                  </div>
                );
              })}
            </RadioGroup>

            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(q.correctAnswer);
                }}
                className="text-xs text-muted-foreground"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Show hint
              </Button>
              <Button onClick={handleNext} disabled={!selected}>
                {current + 1 >= questions.length ? "Finish Quiz" : "Next"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {phase === "result" && result && (
          <>
            <DialogHeader>
              <DialogTitle>Quiz Complete!</DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <div
                className={`text-6xl font-extrabold mb-2 ${
                  result.score >= 70 ? "text-emerald-400" : result.score >= 40 ? "text-amber-400" : "text-red-400"
                }`}
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {result.score}%
              </div>
              <p className="text-muted-foreground">{result.correct} / {questions.length} correct</p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {questions.map((q, i) => {
                const userAns = result.answers[i];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={i} className={`p-3 rounded-lg border text-sm ${isCorrect ? "border-emerald-400/30 bg-emerald-400/5" : "border-red-400/30 bg-red-400/5"}`}>
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{q.question}</p>
                        {!isCorrect && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Your: {userAns} · Correct: {q.correctAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={startQuiz} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" /> Retake
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trophy className="w-4 h-4 mr-2" />}
                Save Result
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function InterviewDashboard({ assessments }) {
  const [quizOpen, setQuizOpen] = useState(false);
  const [localAssessments, setLocalAssessments] = useState(assessments);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const avgScore = localAssessments.length
    ? Math.round(localAssessments.reduce((a, b) => a + b.quizScore, 0) / localAssessments.length)
    : 0;

  const chartData = [...localAssessments]
    .reverse()
    .slice(-7)
    .map((a) => ({
      date: format(new Date(a.createdAt), "MMM d"),
      score: a.quizScore,
    }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
              Interview Prep
            </h1>
          </div>
          <p className="text-muted-foreground">Practice questions and track your performance</p>
        </div>
        <Button onClick={() => setQuizOpen(true)} className="gap-2">
          <Play className="w-4 h-4" />
          Start Quiz
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Trophy} label="Average Score" value={`${avgScore}%`} color="text-amber-400" />
        <StatsCard icon={Target} label="Quizzes Taken" value={localAssessments.length} color="text-blue-400" />
        <StatsCard icon={TrendingUp} label="Latest Score" value={localAssessments[0] ? `${localAssessments[0].quizScore}%` : "—"} color="text-emerald-400" />
        <StatsCard icon={MessageSquare} label="Questions Practiced" value={localAssessments.length * 10} color="text-violet-400" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  formatter={(v) => [`${v}%`, "Score"]}
                />
                <Line type="monotone" dataKey="score" stroke="oklch(0.65 0.22 260)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Quiz History */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Quiz History</CardTitle>
        </CardHeader>
        <CardContent>
          {localAssessments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No quizzes yet. Start your first quiz!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localAssessments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/40 hover:border-primary/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedAssessment(a)}
                >
                  <div>
                    <p className="font-medium text-sm">{a.category} Quiz</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(a.createdAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xl font-bold ${
                        a.quizScore >= 70 ? "text-emerald-400" : a.quizScore >= 40 ? "text-amber-400" : "text-red-400"
                      }`}
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {a.quizScore}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Modal */}
      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        onComplete={() => window.location.reload()}
      />

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Quiz Result — {selectedAssessment.quizScore}%
              </DialogTitle>
            </DialogHeader>
            {selectedAssessment.improvementTip && (
              <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20 text-sm">
                <div className="flex items-center gap-2 mb-2 font-medium text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  Improvement Tip
                </div>
                <p className="text-muted-foreground">{selectedAssessment.improvementTip}</p>
              </div>
            )}
            <div className="space-y-3">
              {(selectedAssessment.questions || []).map((q, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-sm ${
                    q.isCorrect ? "border-emerald-400/30 bg-emerald-400/5" : "border-red-400/30 bg-red-400/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {q.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">{q.question}</p>
                      {!q.isCorrect && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Your answer: {q.userAnswer} · Correct: {q.correctAnswer}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
