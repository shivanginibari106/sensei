"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateUser } from "@/actions/user";

const schema = z.object({
  industry: z.string().min(1, "Please select an industry"),
  subIndustry: z.string().min(1, "Please enter your role/specialization"),
  experience: z.string().min(1, "Please select your experience level"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Marketing",
  "Design",
  "Education",
  "Legal",
  "Engineering",
  "Sales",
  "Operations",
];

const experienceLevels = ["0-1", "1-3", "3-5", "5-8", "8-12", "12+"];

const suggestedSkills = [
  "JavaScript", "Python", "React", "Node.js", "TypeScript",
  "SQL", "AWS", "Docker", "Git", "Figma", "Excel", "Java",
  "Machine Learning", "Data Analysis", "Communication", "Leadership",
];

export default function OnboardingForm() {
  const router = useRouter();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const onSubmit = async (data) => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }
    try {
      setLoading(true);
      toast.loading("Setting up your profile...", { id: "onboarding" });
      const result = await updateUser({ ...data, skills });
      if (result?.error) {
        toast.error(result.error, { id: "onboarding" });
        return;
      }
      toast.success("Profile complete! Loading your dashboard...", { id: "onboarding" });
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      toast.error(err.message || "Something went wrong. Please try again.", { id: "onboarding" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Industry */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select onValueChange={(v) => setValue("industry", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((i) => (
                    <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-destructive text-xs">{errors.industry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role / Specialization</Label>
              <Input
                {...register("subIndustry")}
                placeholder="e.g. Software Developer, Designer"
              />
              {errors.subIndustry && (
                <p className="text-destructive text-xs">{errors.subIndustry.message}</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <Select onValueChange={(v) => setValue("experience", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((e) => (
                  <SelectItem key={e} value={e}>{e} years</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.experience && (
              <p className="text-destructive text-xs">{errors.experience.message}</p>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type a skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {suggestedSkills
                .filter((s) => !skills.includes(s))
                .slice(0, 8)
                .map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors text-xs"
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </Badge>
                ))}
            </div>

            {/* Selected skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge key={skill} className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>Professional Bio <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              {...register("bio")}
              placeholder="A brief summary of your professional background..."
              rows={3}
            />
            {errors.bio && (
              <p className="text-destructive text-xs">{errors.bio.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up your profile...
              </>
            ) : (
              "Complete Profile →"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
