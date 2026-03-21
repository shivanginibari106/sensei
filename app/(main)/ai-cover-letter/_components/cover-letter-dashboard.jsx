"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Mail,
  Plus,
  Trash2,
  Eye,
  Loader2,
  ArrowLeft,
  Building,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateCoverLetter, deleteCoverLetter } from "@/actions/cover-letter";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CoverLetterDashboard({ initialLetters }) {
  const [letters, setLetters] = useState(initialLetters);
  const [view, setView] = useState("list"); // list | create | detail
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ jobTitle: "", companyName: "", jobDescription: "" });

  const handleGenerate = async () => {
    if (!form.jobTitle || !form.companyName || !form.jobDescription) {
      toast.error("Please fill all fields");
      return;
    }
    setGenerating(true);
    try {
      toast.loading("Generating your cover letter...", { id: "cl" });
      const letter = await generateCoverLetter(form);
      if (letter?.error) {
        toast.error(letter.error, { id: "cl" });
        return;
      }
      setLetters([letter, ...letters]);
      setSelected(letter);
      setView("detail");
      toast.success("Cover letter generated!", { id: "cl" });
    } catch (e) {
      toast.error(e?.message || "Failed to generate. Try again.", { id: "cl" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCoverLetter(deleteId);
      setLetters(letters.filter((l) => l.id !== deleteId));
      if (selected?.id === deleteId) {
        setSelected(null);
        setView("list");
      }
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {view !== "list" && (
              <Button variant="ghost" size="sm" onClick={() => setView("list")} className="mr-1 -ml-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Mail className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
              Cover Letters
            </h1>
          </div>
          <p className="text-muted-foreground">AI-tailored cover letters for every application</p>
        </div>
        {view === "list" && (
          <Button onClick={() => setView("create")} className="gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </Button>
        )}
      </div>

      {/* Create form */}
      {view === "create" && (
        <Card className="border-border/50 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base">New Cover Letter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Briefcase className="w-3.5 h-3.5" /> Job Title
                </Label>
                <Input
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Building className="w-3.5 h-3.5" /> Company Name
                </Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Job Description</Label>
              <Textarea
                value={form.jobDescription}
                onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                placeholder="Paste the job description here..."
                rows={8}
              />
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detail view */}
      {view === "detail" && selected && (
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{selected.jobTitle} at {selected.companyName}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(selected.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteId(selected.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-sm">
              <ReactMarkdown>{selected.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List view */}
      {view === "list" && (
        <>
          {letters.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium mb-2">No cover letters yet</p>
              <p className="text-sm mb-4">Create your first AI-powered cover letter</p>
              <Button onClick={() => setView("create")} className="gap-2">
                <Plus className="w-4 h-4" /> Create Cover Letter
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {letters.map((letter) => (
                <Card
                  key={letter.id}
                  className="border-border/50 hover:border-primary/30 cursor-pointer transition-colors group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(letter.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-sm mb-0.5">{letter.jobTitle}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{letter.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(letter.createdAt), "MMM d, yyyy")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 gap-1.5"
                      onClick={() => { setSelected(letter); setView("detail"); }}
                    >
                      <Eye className="w-3.5 h-3.5" /> View Letter
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cover letter?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
