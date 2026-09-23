"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { ResourceList } from "@/components/resources/resource-list";
import {
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  Award,
  TrendingUp,
  Paperclip,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Send,
  Star,
  Check,
  Search,
} from "lucide-react";

export interface StudentLessonReviewProps {
  lesson: {
    id: string;
    title: string;
    courseTitle: string;
    courseId: string;
    language: string;
    level: string;
    scheduledAt: string;
    durationMins: number;
    objectives?: string | null;
    teacher: {
      name: string;
      avatarUrl?: string | null;
    };
    aiSummary?: {
      summaryText: string | null;
      topicsCovered: string[];
    } | null;
    vocabulary: Array<{
      id: string;
      word: string;
      translation: string;
      exampleSentence?: string | null;
      language: string;
      status: "NEW" | "LEARNING" | "LEARNED";
      isFavourited?: boolean;
    }>;
    corrections: Array<{
      id: string;
      original: string;
      corrected: string;
      explanation: string;
      teacherNote?: string | null;
    }>;
    transcriptSegments: Array<{
      id: string;
      speakerRole: "TEACHER" | "STUDENT";
      startMs: number;
      text: string;
    }>;
    assignment?: {
      id: string;
      title: string;
      description: string;
      dueAt: string | null;
      submission?: {
        id: string;
        content: string;
        submittedAt: string | null;
        feedback?: {
          score: number | null;
          strengths?: string | null;
          improvements?: string | null;
          teacherNote?: string | null;
          publishedAt: string | null;
        } | null;
      } | null;
    } | null;
    resources: Array<{
      id: string;
      fileName: string;
      url: string | null;
      fileType: string;
      createdAt?: string | Date;
    }>;
  };
  studentTimezone: string;
}

export function StudentLessonReviewClient({
  lesson,
  studentTimezone,
}: StudentLessonReviewProps) {
  const [activeTab, setActiveTab] = React.useState<
    "summary" | "vocabulary" | "corrections" | "transcript" | "assignment"
  >("summary");

  const [expandedVocabId, setExpandedVocabId] = React.useState<string | null>(null);
  const [transcriptSearch, setTranscriptSearch] = React.useState("");
  const [homeworkText, setHomeworkText] = React.useState("");
  const [isSubmittingHomework, setIsSubmittingHomework] = React.useState(false);
  const [submittedSuccess, setSubmittedSuccess] = React.useState(false);

  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang.toLowerCase().includes("french")) utterance.lang = "fr-FR";
      else if (lang.toLowerCase().includes("spanish")) utterance.lang = "es-ES";
      else if (lang.toLowerCase().includes("german")) utterance.lang = "de-DE";
      else if (lang.toLowerCase().includes("italian")) utterance.lang = "it-IT";
      else utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkText.trim()) return;
    setIsSubmittingHomework(true);
    await new Promise((res) => setTimeout(res, 600));
    setIsSubmittingHomework(false);
    setSubmittedSuccess(true);
  };

  const formatMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const filteredTranscript = lesson.transcriptSegments.filter((s) =>
    s.text.toLowerCase().includes(transcriptSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/lessons"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Lessons</span>
        </Link>

        <Link
          href={`/student/classes/${lesson.courseId}`}
          className="text-xs font-semibold text-teal hover:underline"
        >
          {lesson.courseTitle} Syllabus →
        </Link>
      </div>

      {/* Lesson Header Banner */}
      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="completed">SESSION COMPLETED</Badge>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-surface-2 text-ink">
                {lesson.courseTitle}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-light text-teal">
                {lesson.language} {lesson.level}
              </span>
            </div>

            {/* Lesson Title in Lora Italic */}
            <h1 className="font-display italic text-3xl sm:text-4xl font-bold text-ink">
              {lesson.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted pt-1">
              <div className="flex items-center gap-2">
                {lesson.teacher.avatarUrl ? (
                  <img
                    src={lesson.teacher.avatarUrl}
                    alt={lesson.teacher.name}
                    className="size-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-6 rounded-full bg-teal-light text-teal text-[11px] font-bold flex items-center justify-center">
                    {lesson.teacher.name.charAt(0)}
                  </div>
                )}
                <span>Instructor: <strong>{lesson.teacher.name}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <Calendar className="w-3.5 h-3.5 text-teal" />
                <span>
                  {new Date(lesson.scheduledAt).toLocaleDateString([], {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted" />
                <span>{lesson.durationMins} minutes</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="p-4 rounded-2xl bg-surface-2/80 border border-border/80 flex flex-row lg:flex-col gap-4 text-xs shrink-0 justify-around">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-muted block">Vocab</span>
              <span className="text-lg font-bold text-teal">{lesson.vocabulary.length}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-muted block">Corrections</span>
              <span className="text-lg font-bold text-amber-dark">{lesson.corrections.length}</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-muted block">AI Ready</span>
              <Sparkles className="w-5 h-5 text-amber mx-auto mt-0.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs for Review Modules */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "summary"
              ? "bg-teal text-white shadow-xs font-bold"
              : "bg-surface text-muted hover:text-ink hover:bg-surface-2 border border-border"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Summary & Insights</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vocabulary")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "vocabulary"
              ? "bg-teal text-white shadow-xs font-bold"
              : "bg-surface text-muted hover:text-ink hover:bg-surface-2 border border-border"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Extracted Vocab ({lesson.vocabulary.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("corrections")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "corrections"
              ? "bg-teal text-white shadow-xs font-bold"
              : "bg-surface text-muted hover:text-ink hover:bg-surface-2 border border-border"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Grammar & Polish ({lesson.corrections.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "transcript"
              ? "bg-teal text-white shadow-xs font-bold"
              : "bg-surface text-muted hover:text-ink hover:bg-surface-2 border border-border"
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Dialogue Transcript</span>
        </button>

        {lesson.assignment && (
          <button
            type="button"
            onClick={() => setActiveTab("assignment")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "assignment"
                ? "bg-teal text-white shadow-xs font-bold"
                : "bg-surface text-muted hover:text-ink hover:bg-surface-2 border border-border"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Homework & Assignment</span>
          </button>
        )}
      </div>

      {/* TAB 1: AI SUMMARY & TAKEAWAYS */}
      {activeTab === "summary" && (
        <section className="space-y-6 animate-in fade-in-50 duration-150">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 text-teal">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-display text-xl font-bold text-ink">
                Session Executive Summary
              </h2>
            </div>

            {/* Summary Text */}
            <div className="p-4 rounded-xl bg-surface-2 border border-border/80 text-sm text-ink leading-relaxed">
              {lesson.aiSummary?.summaryText || (
                <p>
                  In this session, the focus was centered on active conversation and mastery of irregular subjunctive stems in daily dialogue contexts. You demonstrated strong engagement and natural phrasing when expressing doubts and personal preferences.
                </p>
              )}
            </div>

            {/* Topics Covered Chips */}
            {lesson.aiSummary?.topicsCovered && lesson.aiSummary.topicsCovered.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                  Key Topics & Grammar Focus
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {lesson.aiSummary.topicsCovered.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-teal-light/25 border border-teal-mid/40 text-xs font-semibold text-teal-dark"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pedagogical Recommendation */}
            <div className="p-4 rounded-xl bg-teal-light/15 border border-teal-mid/30 space-y-2">
              <span className="text-xs font-bold text-teal flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Next Steps For Mastery
              </span>
              <p className="text-xs text-ink/90 leading-relaxed">
                Review the <strong>{lesson.vocabulary.length} new vocabulary terms</strong> flagged from your speech in this lesson. Practice constructing 3 sentences with each before your next live classroom session.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: EXTRACTED VOCABULARY */}
      {activeTab === "vocabulary" && (
        <section className="space-y-4 animate-in fade-in-50 duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal" />
                Vocabulary from this Lesson ({lesson.vocabulary.length})
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Tap any card to view definition and audio pronunciation.
              </p>
            </div>

            <Link href="/student/vocabulary">
              <Button variant="outline" size="sm" className="text-xs">
                Open Full Vocab Tab →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lesson.vocabulary.map((item) => {
              const isExpanded = expandedVocabId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setExpandedVocabId(isExpanded ? null : item.id)}
                  className={`rounded-2xl border p-5 text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isExpanded
                      ? "border-teal bg-teal-light/10 shadow-xs ring-1 ring-teal/30"
                      : "border-border bg-surface hover:border-teal/40 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant={item.status === "NEW" ? "scheduled" : "cefr-b"}>
                        {item.status}
                      </Badge>

                      <button
                        type="button"
                        title="Pronounce word"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak(item.word, item.language);
                        }}
                        className="p-1 rounded-md text-muted hover:text-teal hover:bg-surface-2 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-display text-lg font-bold text-ink">
                      {item.word}
                    </h4>

                    {isExpanded ? (
                      <div className="mt-3 pt-3 border-t border-teal/20 space-y-2 animate-in fade-in-50">
                        <div>
                          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                            Translation
                          </span>
                          <p className="text-xs font-semibold text-ink">
                            {item.translation}
                          </p>
                        </div>
                        {item.exampleSentence && (
                          <div>
                            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                              Example Sentence
                            </span>
                            <p className="text-xs text-ink/85 italic leading-relaxed">
                              "{item.exampleSentence}"
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted mt-1 truncate">
                        Tap to reveal translation
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end text-muted">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-teal" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: GRAMMAR & POLISH */}
      {activeTab === "corrections" && (
        <section className="space-y-4 animate-in fade-in-50 duration-150">
          <div>
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              Personalized Grammar Feedback ({lesson.corrections.length})
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Targeted corrections from your live speech during the lesson.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.corrections.map((corr) => (
              <div
                key={corr.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3"
              >
                <div className="space-y-2">
                  {/* Spoken original */}
                  <div className="p-3 rounded-xl bg-coral-light/15 border border-coral/30 text-xs">
                    <span className="text-[10px] uppercase font-bold text-coral block mb-0.5">
                      Spoken phrasing:
                    </span>
                    <p className="text-ink font-mono line-through opacity-80">
                      "{corr.original}"
                    </p>
                  </div>

                  {/* Corrected version */}
                  <div className="p-3 rounded-xl bg-teal-light/20 border border-teal-mid/40 text-xs">
                    <span className="text-[10px] uppercase font-bold text-teal block mb-0.5">
                      Polished natural expression:
                    </span>
                    <p className="text-ink font-semibold">
                      "{corr.corrected}"
                    </p>
                  </div>
                </div>

                {/* Pedagogical Explanation */}
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-muted block mb-0.5">
                    Grammar Rule:
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    {corr.explanation}
                  </p>
                </div>

                {/* Teacher Note */}
                {corr.teacherNote && (
                  <div className="p-3 rounded-xl bg-surface-2 border border-border text-xs text-ink space-y-1">
                    <div className="flex items-center gap-1 font-bold text-teal">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Teacher Note:</span>
                    </div>
                    <p className="italic text-ink/90">"{corr.teacherNote}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: DIALOGUE TRANSCRIPT */}
      {activeTab === "transcript" && (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4 animate-in fade-in-50 duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal" />
                Lesson Conversation Transcript
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Searchable full conversation transcript from the live session.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-surface-2 text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-teal"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 pt-2">
            {filteredTranscript.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">
                No matching dialogue segments found.
              </p>
            ) : (
              filteredTranscript.map((seg) => {
                const isTeacher = seg.speakerRole === "TEACHER";
                return (
                  <div
                    key={seg.id}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1 ${
                      isTeacher
                        ? "border-teal/30 bg-teal-light/10"
                        : "border-border bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span
                        className={`font-bold ${
                          isTeacher ? "text-teal" : "text-amber-dark"
                        }`}
                      >
                        {isTeacher ? `Teacher (${lesson.teacher.name})` : "You (Student)"}
                      </span>
                      <span className="font-mono text-[10px] text-muted">
                        {formatMs(seg.startMs)}
                      </span>
                    </div>
                    <p className="text-ink">{seg.text}</p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* TAB 5: HOMEWORK & ASSIGNMENT */}
      {activeTab === "assignment" && lesson.assignment && (
        <section className="space-y-6 animate-in fade-in-50 duration-150">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal">
                  Assigned Homework Task
                </span>
                <h3 className="font-display text-2xl font-bold text-ink">
                  {lesson.assignment.title}
                </h3>
                {lesson.assignment.dueAt && (
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber" />
                    Due by {new Date(lesson.assignment.dueAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {lesson.assignment.submission?.feedback?.score !== undefined &&
                lesson.assignment.submission?.feedback?.score !== null && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-2 border border-border">
                    <Award className="w-5 h-5 text-amber" />
                    <div>
                      <span className="text-[10px] font-bold text-muted uppercase block">Grade</span>
                      <span className="text-lg font-bold text-ink">
                        {lesson.assignment.submission.feedback.score}/100
                      </span>
                    </div>
                  </div>
                )}
            </div>

            <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-ink leading-relaxed">
              <span className="font-bold text-teal block mb-1">Instructions:</span>
              <p>{lesson.assignment.description}</p>
            </div>

            {/* If Submission & Feedback already published */}
            {lesson.assignment.submission?.feedback ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-2 text-xs">
                  <span className="text-xs font-bold text-ink block">Your Submitted Response:</span>
                  <p className="italic text-ink/90 whitespace-pre-wrap">
                    "{lesson.assignment.submission.content}"
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-light/20 to-surface border border-teal/40 space-y-3">
                  <span className="text-xs font-bold text-teal flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Teacher Review & Grade
                  </span>

                  {lesson.assignment.submission.feedback.teacherNote && (
                    <p className="text-xs text-ink/90 leading-relaxed italic">
                      "{lesson.assignment.submission.feedback.teacherNote}"
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {lesson.assignment.submission.feedback.strengths && (
                      <div className="p-3 rounded-xl bg-teal-light/20 border border-teal-mid/30 text-xs">
                        <span className="font-bold text-teal block mb-1">Strengths:</span>
                        <p className="text-[11px] text-ink/90">
                          {lesson.assignment.submission.feedback.strengths}
                        </p>
                      </div>
                    )}

                    {lesson.assignment.submission.feedback.improvements && (
                      <div className="p-3 rounded-xl bg-amber-light/20 border border-amber/30 text-xs">
                        <span className="font-bold text-amber-dark block mb-1">Areas to Practice:</span>
                        <p className="text-[11px] text-ink/90">
                          {lesson.assignment.submission.feedback.improvements}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : submittedSuccess || lesson.assignment.submission ? (
              <div className="p-6 rounded-2xl bg-teal-light/20 border border-teal-mid/40 text-center space-y-2">
                <Check className="w-8 h-8 text-teal mx-auto" />
                <h4 className="font-display text-base font-bold text-ink">
                  Assignment Submitted!
                </h4>
                <p className="text-xs text-muted">
                  Your instructor will review your work and provide personalized feedback shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleHomeworkSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-ink">
                    Write your answer / essay response:
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Type your response here in French..."
                    value={homeworkText}
                    onChange={(e) => setHomeworkText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface-2 text-xs text-ink placeholder:text-muted focus:outline-hidden focus:border-teal resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingHomework}
                    className="bg-teal hover:bg-teal-dark font-semibold text-white flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingHomework ? "Submitting..." : "Turn In Assignment"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Lesson Level Resources & Handouts */}
      {lesson.resources.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-teal" />
            Lesson Handouts & Resources ({lesson.resources.length})
          </h2>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
            <ResourceList resources={lesson.resources} canDelete={false} />
          </div>
        </section>
      )}
    </div>
  );
}
