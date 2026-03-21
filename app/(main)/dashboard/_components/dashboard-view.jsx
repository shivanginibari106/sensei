"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Zap,
  Clock,
  BarChart3,
  Lightbulb,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const demandConfig = {
  High: { color: "text-emerald-400", bg: "bg-emerald-400/10", icon: TrendingUp },
  Medium: { color: "text-amber-400", bg: "bg-amber-400/10", icon: Minus },
  Low: { color: "text-red-400", bg: "bg-red-400/10", icon: TrendingDown },
};

export default function DashboardView({ data }) {
  const { user, insight } = data;
  const demand = demandConfig[insight?.demandLevel] || demandConfig.Medium;
  const DemandIcon = demand.icon;

  const daysUntilUpdate = insight?.nextUpdate
    ? Math.max(0, Math.ceil((new Date(insight.nextUpdate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 7;

  // Format salary data for chart
  const salaryData = (insight?.salaryRanges || []).map((s) => ({
    role: s.role?.split(" ").slice(0, 2).join(" ") || "",
    Min: s.min,
    Median: s.median,
    Max: s.max,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1
              className="text-3xl font-extrabold"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Industry Insights
            </h1>
          </div>
          <p className="text-muted-foreground">
            {user.industry?.replace("-", " › ")} · {user.experience} yrs experience
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4" />
          Updates in {daysUntilUpdate} day{daysUntilUpdate !== 1 ? "s" : ""}
          {insight?.lastUpdated && (
            <span className="text-xs opacity-60">
              · Last: {format(new Date(insight.lastUpdated), "MMM d")}
            </span>
          )}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Market Outlook</span>
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <p className="font-semibold leading-snug">
              {insight?.marketOutlook || "Loading..."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Industry Growth</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400" style={{ fontFamily: "Syne, sans-serif" }}>
              {insight?.growthRate ?? "—"}%
            </div>
            <Progress value={Math.min(100, insight?.growthRate ?? 0)} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Demand Level</span>
              <DemandIcon className={`w-4 h-4 ${demand.color}`} />
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${demand.bg}`}>
              <DemandIcon className={`w-4 h-4 ${demand.color}`} />
              <span className={`font-bold ${demand.color}`}>{insight?.demandLevel}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary chart */}
      <Card className="border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Salary Ranges by Role (USD thousands)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salaryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="role"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [`$${v}k`]}
                />
                <Bar dataKey="Min" fill="oklch(0.55 0.22 260 / 0.5)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Median" fill="oklch(0.65 0.22 260)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Max" fill="oklch(0.75 0.2 260 / 0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No salary data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-amber-400" />
              Top Skills in Demand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(insight?.topSkills || []).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className={`${user.skills?.includes(skill) ? "bg-primary/20 text-primary border-primary/30" : ""}`}
                >
                  {skill}
                  {user.skills?.includes(skill) && " ✓"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Trends */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" />
              Key Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(insight?.keyTrends || []).map((trend, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {i + 1}
                  </span>
                  {trend}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommended Skills */}
        <Card className="border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              Recommended Skills to Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(insight?.recommendedSkills || []).map((skill) => (
                <Badge key={skill} variant="outline" className="border-emerald-400/30 text-emerald-400">
                  + {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
