"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Volume2,
  CheckCircle2,
} from "lucide-react";

export interface VocabQuickItem {
  id: string;
  word: string;
  translation: string;
  exampleSentence?: string | null;
  language: string;
  status: "NEW" | "LEARNING" | "LEARNED";
}

interface VocabQuickReviewProps {
  items: VocabQuickItem[];
}

export function VocabQuickReview({ items }: VocabQuickReviewProps) {
  // Store expanded item ID
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSpeak = (e: React.MouseEvent, text: string, lang: string) => {
    e.stopPropagation();
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

  return (
    <section aria-label="Vocabulary to Review" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Quick Practice
          </span>
          <h3 className="font-display text-lg font-bold text-ink mt-0.5">
            Vocabulary to Review
          </h3>
        </div>
        <Link
          href="/student/vocabulary"
          className="text-xs font-semibold text-teal hover:text-teal-dark flex items-center gap-1 transition-colors"
        >
          <span>Review all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {items.slice(0, 4).map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => handleToggle(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle(item.id);
                }
              }}
              className={`group rounded-2xl border p-4 text-left transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                isExpanded
                  ? "border-teal bg-teal-light/10 shadow-sm ring-1 ring-teal/30"
                  : "border-border bg-surface hover:border-teal/40 hover:shadow-xs"
              }`}
            >
              <div>
                {/* Header tag & Speak button */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={item.status === "NEW" ? "scheduled" : "cefr-b"}>
                    {item.status === "NEW" ? "NEW" : "LEARNING"}
                  </Badge>
                  <button
                    type="button"
                    title="Pronounce word"
                    onClick={(e) => handleSpeak(e, item.word, item.language)}
                    className="p-1 rounded-md text-muted hover:text-teal hover:bg-surface-2 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Term */}
                <h4 className="font-display text-base font-bold text-ink group-hover:text-teal transition-colors">
                  {item.word}
                </h4>

                {/* Collapsed vs Expanded Content */}
                {isExpanded ? (
                  <div className="mt-3 pt-3 border-t border-teal/20 space-y-2 animate-in fade-in-50 duration-150">
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
                          Example
                        </span>
                        <p className="text-[11px] text-ink/80 italic leading-relaxed">
                          "{item.exampleSentence}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted mt-1.5 line-clamp-1 flex items-center gap-1">
                    <span>Tap to reveal translation</span>
                  </p>
                )}
              </div>

              {/* Bottom toggle indicator */}
              <div className="pt-2 mt-2 flex items-center justify-end text-muted group-hover:text-teal">
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
  );
}
