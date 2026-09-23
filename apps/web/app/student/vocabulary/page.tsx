import { requireStudent } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { StudentVocabDeck } from "@/components/student/student-vocab-deck";
import {
  BookOpen,
  Sparkles,
  Award,
  Star,
} from "lucide-react";

export default async function StudentVocabularyPage() {
  const session = await requireStudent();
  const student = session.dbUser.studentProfile;

  let vocabularyItems = await db.vocabularyItem.findMany({
    where: {
      studentProfileId: student.id,
      aiStatus: "ACCEPTED",
    },
    orderBy: [{ isFavourited: "desc" }, { createdAt: "desc" }],
  });

  // Provide rich sample vocabulary if empty
  if (vocabularyItems.length === 0) {
    vocabularyItems = [
      {
        id: "vocab-demo-1",
        studentProfileId: student.id,
        aiAnalysisId: null,
        word: "faire ses valises",
        translation: "to pack one's bags / luggage",
        exampleSentence: "Il faut que je fasse mes valises avant de partir.",
        language: "French",
        status: "LEARNING" as any,
        aiStatus: "ACCEPTED" as any,
        isFavourited: true,
        reviewedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "vocab-demo-2",
        studentProfileId: student.id,
        aiAnalysisId: null,
        word: "bien que (+ subjonctif)",
        translation: "although / even though",
        exampleSentence: "Bien qu'il pleuve, nous irons visiter le musée.",
        language: "French",
        status: "NEW" as any,
        aiStatus: "ACCEPTED" as any,
        isFavourited: false,
        reviewedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "vocab-demo-3",
        studentProfileId: student.id,
        aiAnalysisId: null,
        word: "avoir hâte de",
        translation: "to look forward to / can't wait to",
        exampleSentence: "J'ai hâte de commencer mon stage linguistique.",
        language: "French",
        status: "LEARNED" as any,
        aiStatus: "ACCEPTED" as any,
        isFavourited: true,
        reviewedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "vocab-demo-4",
        studentProfileId: student.id,
        aiAnalysisId: null,
        word: "au fur et à mesure",
        translation: "gradually / as you go along",
        exampleSentence: "Vous apprendrez le vocabulaire au fur et à mesure des cours.",
        language: "French",
        status: "LEARNED" as any,
        aiStatus: "ACCEPTED" as any,
        isFavourited: false,
        reviewedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "vocab-demo-5",
        studentProfileId: student.id,
        aiAnalysisId: null,
        word: "se débrouiller",
        translation: "to get by / to manage on one's own",
        exampleSentence: "Je me débrouille bien en français quand je voyage.",
        language: "French",
        status: "LEARNING" as any,
        aiStatus: "ACCEPTED" as any,
        isFavourited: true,
        reviewedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "vocab-demo-6",
        studentProfileId: student.id,
        aiAnalysisId: null,
        word: "valoir la peine",
        translation: "to be worth it",
        exampleSentence: "L'effort pour apprendre une langue en vaut vraiment la peine.",
        language: "French",
        status: "NEW" as any,
        aiStatus: "ACCEPTED" as any,
        isFavourited: false,
        reviewedAt: new Date(),
        createdAt: new Date(),
      },
    ];
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-dark flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-amber" /> Lexical Memory Bank
        </span>
        <h1 className="font-display text-3xl font-bold text-ink mt-1">
          Vocabulary Study Deck ({vocabularyItems.length} Words)
        </h1>
        <p className="text-sm text-muted mt-1 max-w-2xl leading-relaxed">
          Review extracted vocabulary from your live lessons. Flip cards, listen to native pronunciation, and master words with spaced repetition.
        </p>
      </div>

      {/* Main Flashcards Suite */}
      <StudentVocabDeck
        initialVocabulary={vocabularyItems.map((v) => ({
          id: v.id,
          word: v.word,
          translation: v.translation,
          exampleSentence: v.exampleSentence,
          language: v.language,
          status: v.status as "NEW" | "LEARNING" | "LEARNED",
          aiStatus: v.aiStatus,
          isFavourited: v.isFavourited,
        }))}
      />
    </main>
  );
}
