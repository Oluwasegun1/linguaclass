"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  BookOpen,
  Star,
  CheckCircle2,
  RotateCw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  Volume2,
} from "lucide-react";

export interface VocabularyCardData {
  id: string;
  word: string;
  translation: string;
  exampleSentence: string | null;
  language: string;
  status: "NEW" | "LEARNING" | "LEARNED";
  aiStatus: string;
  isFavourited: boolean;
}

interface StudentVocabDeckProps {
  initialVocabulary: VocabularyCardData[];
}

export function StudentVocabDeck({ initialVocabulary }: StudentVocabDeckProps) {
  const [vocabList, setVocabList] = React.useState<VocabularyCardData[]>(initialVocabulary);
  const [filter, setFilter] = React.useState<"ALL" | "FAVOURITES" | "NEW" | "LEARNING" | "LEARNED">("ALL");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const filteredItems = React.useMemo(() => {
    return vocabList.filter((item) => {
      if (filter === "FAVOURITES") return item.isFavourited;
      if (filter === "NEW") return item.status === "NEW";
      if (filter === "LEARNING") return item.status === "LEARNING";
      if (filter === "LEARNED") return item.status === "LEARNED";
      return true;
    });
  }, [vocabList, filter]);

  const currentItem = filteredItems[currentIndex] || filteredItems[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredItems.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
  };

  const handleUpdateStatus = async (status: "NEW" | "LEARNING" | "LEARNED") => {
    if (!currentItem) return;
    try {
      setIsUpdating(true);
      const res = await fetch("/api/student/vocabulary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentItem.id, status }),
      });

      if (res.ok) {
        setVocabList((prev) =>
          prev.map((item) =>
            item.id === currentItem.id ? { ...item, status } : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleFavourite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentItem) return;
    const nextFav = !currentItem.isFavourited;

    try {
      setVocabList((prev) =>
        prev.map((item) =>
          item.id === currentItem.id ? { ...item, isFavourited: nextFav } : item
        )
      );

      await fetch("/api/student/vocabulary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentItem.id, isFavourited: nextFav }),
      });
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  const speakWord = (e: React.MouseEvent, text: string, lang = "fr-FR") => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  const learnedCount = vocabList.filter((v) => v.status === "LEARNED").length;
  const learningCount = vocabList.filter((v) => v.status === "LEARNING").length;
  const newCount = vocabList.filter((v) => v.status === "NEW").length;

  if (vocabList.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center space-y-3">
        <div className="size-10 rounded-xl bg-amber-light text-amber-dark flex items-center justify-center mx-auto">
          <BookOpen className="w-5 h-5" />
        </div>
        <h4 className="font-display text-base font-bold text-ink">
          Vocabulary Deck is Empty
        </h4>
        <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
          As your teachers accept AI-extracted vocabulary from your live sessions, new flashcards will automatically appear here for daily practice.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-5">
      {/* Header & Metric ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-dark flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber" /> Spaced Repetition Practice
          </span>
          <h3 className="font-display text-xl font-bold text-ink mt-0.5">
            Vocabulary Mastery Deck ({vocabList.length} Words)
          </h3>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20">
            {learnedCount} Learned
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-light text-amber-dark border border-amber/30">
            {learningCount} In Practice
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-light text-teal border border-teal-mid/30">
            {newCount} New
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
        {[
          { id: "ALL", label: `All (${vocabList.length})` },
          { id: "FAVOURITES", label: `Starred (★ ${vocabList.filter((v) => v.isFavourited).length})` },
          { id: "NEW", label: `New (${newCount})` },
          { id: "LEARNING", label: `Learning (${learningCount})` },
          { id: "LEARNED", label: `Mastered (${learnedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setFilter(tab.id as any);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === tab.id
                ? "bg-teal text-white font-bold shadow-xs"
                : "bg-surface-2 text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flashcard Component */}
      {filteredItems.length === 0 || !currentItem ? (
        <div className="p-10 rounded-2xl border border-dashed border-border text-center text-xs text-muted">
          No words in this filter category. Try selecting 'All'.
        </div>
      ) : (
        <div className="space-y-4">
          {/* 3D-styled Interactive Flashcard */}
          <div
            onClick={handleFlip}
            className={`cursor-pointer min-h-[220px] rounded-2xl border-2 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 transform select-none relative shadow-sm hover:shadow-md ${
              isFlipped
                ? "border-teal/60 bg-teal-light/10"
                : "border-border bg-surface-2/70 hover:border-amber/60"
            }`}
          >
            {/* Top Card Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface text-ink border border-border">
                  {currentItem.language}
                </span>
                <Badge
                  variant={
                    currentItem.status === "LEARNED"
                      ? "completed"
                      : currentItem.status === "LEARNING"
                      ? "scheduled"
                      : "cefr-a"
                  }
                >
                  {currentItem.status}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => speakWord(e, currentItem.word)}
                  className="p-1.5 rounded-lg text-muted hover:text-teal hover:bg-surface transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleFavourite}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentItem.isFavourited
                      ? "text-amber fill-amber hover:bg-amber-light/30"
                      : "text-muted hover:text-amber hover:bg-surface"
                  }`}
                  title={currentItem.isFavourited ? "Unstar word" : "Star for revision"}
                >
                  <Star className={`w-4 h-4 ${currentItem.isFavourited ? "fill-amber" : ""}`} />
                </button>
              </div>
            </div>

            {/* Center Content: Word vs Translation */}
            <div className="text-center my-4 space-y-2">
              {!isFlipped ? (
                <div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
                    {currentItem.word}
                  </h2>
                  <p className="text-xs text-muted mt-2 flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3" /> Click card to reveal definition & example
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-teal">
                    {currentItem.translation}
                  </h3>
                  {currentItem.exampleSentence && (
                    <p className="text-sm text-ink/85 italic max-w-lg mx-auto bg-surface p-3 rounded-xl border border-border/80">
                      "{currentItem.exampleSentence}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Ribbon */}
            <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
              <span>
                Card {currentIndex + 1} of {filteredItems.length}
              </span>
              <span className="font-medium text-teal flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Flip
              </span>
            </div>
          </div>

          {/* Navigation & Mastery Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Pagination Controls */}
            <div className="flex items-center gap-2 self-center sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={filteredItems.length <= 1}
                className="h-8 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={filteredItems.length <= 1}
                className="h-8 px-3"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mastery Status Buttons */}
            <div className="flex items-center gap-2 self-center sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating || currentItem.status === "LEARNING"}
                onClick={() => handleUpdateStatus("LEARNING")}
                className="h-8 text-xs border-amber/40 text-amber-dark hover:bg-amber-light/20"
              >
                Practice More
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isUpdating || currentItem.status === "LEARNED"}
                onClick={() => handleUpdateStatus("LEARNED")}
                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-1 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Mastered</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
