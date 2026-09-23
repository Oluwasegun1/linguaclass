"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import {
  TrendingUp,
  Award,
  Mic,
  BookOpen,
  Headphones,
  FileEdit,
  SpellCheck,
  CheckCircle,
} from "lucide-react";

export interface SkillProgressData {
  grammarScore: number; // 0-100
  speakingScore: number;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  vocabulary: number;
  lessonsAttended: number;
  assignmentsDone: number;
  targetLevel: string;
}

interface StudentSkillsRadarProps {
  progress: SkillProgressData;
}

export function StudentSkillsRadar({ progress }: StudentSkillsRadarProps) {
  const skills = [
    {
      name: "Speaking & Fluency",
      icon: Mic,
      score: progress.speakingScore || 75,
      color: "from-teal to-teal-dark",
      bgColor: "bg-teal",
    },
    {
      name: "Grammar Accuracy",
      icon: SpellCheck,
      score: progress.grammarScore || 82,
      color: "from-amber to-amber-dark",
      bgColor: "bg-amber",
    },
    {
      name: "Listening Comprehension",
      icon: Headphones,
      score: progress.listeningScore || 78,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-500",
    },
    {
      name: "Reading & Context",
      icon: BookOpen,
      score: progress.readingScore || 85,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500",
    },
    {
      name: "Written Expression",
      icon: FileEdit,
      score: progress.writingScore || 70,
      color: "from-coral to-rose-600",
      bgColor: "bg-coral",
    },
  ];

  const overallAverage = Math.round(
    skills.reduce((acc, s) => acc + s.score, 0) / skills.length
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> CEFR Competency Map
          </span>
          <h3 className="font-display text-xl font-bold text-ink mt-0.5">
            Language Skills & Proficiency
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="cefr-b">Target Level {progress.targetLevel || "B1"}</Badge>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-light/30 border border-teal-mid/40 text-xs font-bold text-teal">
            <Award className="w-4 h-4" />
            <span>Overall: {overallAverage}%</span>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => {
          const Icon = skill.icon;
          return (
            <div
              key={skill.name}
              className="p-4 rounded-xl border border-border/80 bg-surface-2/50 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Icon className="w-4 h-4 text-teal" />
                  {skill.name}
                </span>
                <span className="font-mono font-bold text-ink">{skill.score}%</span>
              </div>

              {/* Progress Bar with rounded track */}
              <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${skill.bgColor}`}
                  style={{ width: `${Math.min(skill.score, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>Beginner (A1)</span>
                <span className="font-semibold text-teal">Intermediate (B1)</span>
                <span>Fluent (C1)</span>
              </div>
            </div>
          );
        })}

        {/* Milestone Stats Card */}
        <div className="p-4 rounded-xl border border-teal-mid/30 bg-teal-light/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Learning Milestones
            </span>
            <span className="text-xs font-mono text-muted">Active Cycle</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center my-1">
            <div className="p-2 rounded-lg bg-surface border border-border">
              <span className="block font-display text-lg font-bold text-ink">
                {progress.lessonsAttended || 4}
              </span>
              <span className="text-[10px] text-muted uppercase font-semibold">
                Sessions
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-border">
              <span className="block font-display text-lg font-bold text-ink">
                {progress.vocabulary || 18}
              </span>
              <span className="text-[10px] text-muted uppercase font-semibold">
                Vocab Mastered
              </span>
            </div>
            <div className="p-2 rounded-lg bg-surface border border-border">
              <span className="block font-display text-lg font-bold text-ink">
                {progress.assignmentsDone || 3}
              </span>
              <span className="text-[10px] text-muted uppercase font-semibold">
                Homework
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
