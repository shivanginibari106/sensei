"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Loader2,
  Plus,
  Trash2,
  Download,
  Save,
  Eye,
  Edit,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { saveResume, improveWithAI } from "@/actions/resume";

const entrySchema = z.object({
  title: z.string().min(1, "Title required"),
  organization: z.string().min(1, "Organization required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const resumeSchema = z.object({
  contactInfo: z.object({
    email: z.string().email().optional().or(z.literal("")),
    mobile: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
  }),
  summary: z.string().optional(),
  skills: z.string().optional(),
  workExperience: z.array(entrySchema).default([]),
  education: z.array(entrySchema).default([]),
  projects: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      link: z.string().optional(),
    })
  ).default([]),
});

function buildMarkdown(data) {
  const sections = [];

  // Contact
  const contactItems = Object.entries(data.contactInfo || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `**${k.charAt(0).toUpperCase() + k.slice(1)}:** ${v}`)
    .join(" | ");
  if (contactItems) sections.push(contactItems + "\n\n---");

  // Summary
  if (data.summary) {
    sections.push(`## Professional Summary\n${data.summary}`);
  }

  // Skills
  if (data.skills) {
    sections.push(`## Skills\n${data.skills}`);
  }

  // Work Experience
  if (data.workExperience?.length) {
    const exp = data.workExperience.map(
      (e) =>
        `### ${e.title} — ${e.organization}\n*${e.startDate} – ${e.current ? "Present" : e.endDate || ""}*\n\n${e.description}`
    ).join("\n\n");
    sections.push(`## Work Experience\n${exp}`);
  }

  // Education
  if (data.education?.length) {
    const edu = data.education.map(
      (e) =>
        `### ${e.title} — ${e.organization}\n*${e.startDate} – ${e.current ? "Present" : e.endDate || ""}*\n\n${e.description}`
    ).join("\n\n");
    sections.push(`## Education\n${edu}`);
  }

  // Projects
  if (data.projects?.length) {
    const proj = data.projects.map(
      (p) => `### ${p.title}${p.link ? ` — [Link](${p.link})` : ""}\n${p.description}`
    ).join("\n\n");
    sections.push(`## Projects\n${proj}`);
  }

  return sections.join("\n\n");
}

function EntryForm({ fields, append, remove, control, register, type, label, improveFn }) {
  const [improving, setImproving] = useState({});
  const { setValue, watch } = control;

  const handleImprove = async (index) => {
    const fieldName = `${type}.${index}.description`;
    const desc = watch(fieldName);
    if (!desc || typeof desc !== 'string') return;
    setImproving((p) => ({ ...p, [index]: true }));
    try {
      const improved = await improveFn(desc, type);
      if (typeof improved !== 'string' || !improved.trim()) {
        throw new Error("Invalid response from AI");
      }
      setValue(fieldName, improved);
      toast.success("Description improved!");
    } catch (err) {
      toast.error("Failed to improve. Try again.");
    } finally {
      setImproving((p) => ({ ...p, [index]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id} className="border-border/40">
          <CardContent className="p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Title / Degree</Label>
                <Input {...register(`${type}.${index}.title`)} placeholder={type === "workExperience" ? "Software Engineer" : "B.Sc. Computer Science"} />
              </div>
              <div>
                <Label className="text-xs">Company / Institution</Label>
                <Input {...register(`${type}.${index}.organization`)} placeholder="Acme Corp" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input {...register(`${type}.${index}.startDate`)} placeholder="Jan 2022" />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input {...register(`${type}.${index}.endDate`)} placeholder="Present" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleImprove(index)}
                  disabled={improving[index]}
                >
                  {improving[index] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-violet-400" />
                  )}
                  Improve with AI
                </Button>
              </div>
              <Textarea
                id={`${type}-desc-${index}`}
                {...register(`${type}.${index}.description`)}
                placeholder="Describe your role, achievements, and impact..."
                rows={3}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ title: "", organization: "", startDate: "", endDate: "", current: false, description: "" })}
        className="gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Add {label}
      </Button>
    </div>
  );
}

export default function ResumeBuilder({ initialContent }) {
  const [tab, setTab] = useState("edit");
  const [markdownContent, setMarkdownContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      workExperience: [],
      education: [],
      projects: [],
    },
  });

  const workFields = useFieldArray({ control, name: "workExperience" });
  const eduFields = useFieldArray({ control, name: "education" });
  const projectFields = useFieldArray({ control, name: "projects" });

  const handleImproveDesc = async (text, type) => {
    return improveWithAI({ current: text, type });
  };

  const onSubmit = (data) => {
    const md = buildMarkdown(data);
    setMarkdownContent(md);
    setTab("preview");
  };

  const handleSave = async () => {
    if (!markdownContent) {
      toast.error("Build your resume first");
      return;
    }
    setSaving(true);
    try {
      await saveResume(markdownContent);
      toast.success("Resume saved!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (typeof window === 'undefined') return;
    const previewElement = document.getElementById("resume-preview");
    if (!previewElement) {
      toast.error("Preview not found. Please build your resume first.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Failed to open print window. Check popup blocker.");
      return;
    }
    const content = `
      <html><head><title>Resume</title>
      <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; }
        h1,h2,h3 { color: #1a1a2e; }
        h2 { border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px; }
        hr { border: 1px solid #eee; }
      </style></head>
      <body>${previewElement.innerHTML}</body></html>
    `;
    printWindow.document.body.innerHTML = content;
    printWindow.print();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
              Resume Builder
            </h1>
          </div>
          <p className="text-muted-foreground">Build an ATS-optimized resume with AI assistance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="edit" className="gap-1.5">
            <Edit className="w-4 h-4" /> Edit Form
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5">
            <Eye className="w-4 h-4" /> Preview
          </TabsTrigger>
          <TabsTrigger value="markdown" className="gap-1.5">
            <FileText className="w-4 h-4" /> Markdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Info */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input {...register("contactInfo.email")} placeholder="you@email.com" />
                </div>
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input {...register("contactInfo.mobile")} placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <Label className="text-xs">LinkedIn URL</Label>
                  <Input {...register("contactInfo.linkedin")} placeholder="linkedin.com/in/..." />
                </div>
                <div>
                  <Label className="text-xs">Twitter / X</Label>
                  <Input {...register("contactInfo.twitter")} placeholder="@handle" />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea {...register("summary")} placeholder="A brief 2-3 sentence summary of your professional background..." rows={3} />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea {...register("skills")} placeholder="JavaScript, React, Node.js, Python, SQL, AWS..." rows={2} />
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EntryForm
                  fields={workFields.fields}
                  append={workFields.append}
                  remove={workFields.remove}
                  control={control}
                  register={register}
                  type="workExperience"
                  label="Experience"
                  improveFn={handleImproveDesc}
                />
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EntryForm
                  fields={eduFields.fields}
                  append={eduFields.append}
                  remove={eduFields.remove}
                  control={control}
                  register={register}
                  type="education"
                  label="Education"
                  improveFn={handleImproveDesc}
                />
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-primary" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectFields.fields.map((field, i) => (
                    <Card key={field.id} className="border-border/40">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Project Title</Label>
                            <Input {...register(`projects.${i}.title`)} placeholder="My Awesome Project" />
                          </div>
                          <div>
                            <Label className="text-xs">Link (optional)</Label>
                            <Input {...register(`projects.${i}.link`)} placeholder="https://..." />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea {...register(`projects.${i}.description`)} placeholder="What did you build and what was the impact?" rows={2} />
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => projectFields.remove(i)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => projectFields.append({ title: "", description: "", link: "" })}
                    className="gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Project
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg">
              <Eye className="w-4 h-4 mr-2" />
              Generate Preview
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                id="resume-preview"
                className="prose prose-neutral dark:prose-invert max-w-none text-sm"
              >
                {markdownContent ? (
                  <ReactMarkdown>{markdownContent}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Fill out the form and click "Generate Preview" to see your resume.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markdown">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Edit Markdown Directly</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                rows={30}
                className="font-mono text-sm"
                placeholder="Your resume markdown will appear here after generation..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
