import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/auth";
import { db } from "@workspace/database";
import { StudentLessonReviewClient } from "@/components/student/student-lesson-review-client";

export default async function StudentLessonReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lessonId } = await params;
  const session = await requireStudent();
  const student = session.dbUser.studentProfile;
  const studentTimezone = session.dbUser.timezone || "UTC";

  // Handle sample mock lessons for demo/preview
  if (lessonId === "sample-past-lesson-1" || lessonId === "sample-past-lesson-2" || lessonId === "sample-past-1") {
    const sampleData = {
      id: lessonId,
      title:
        lessonId === "sample-past-lesson-2"
          ? "Past Tenses: Passé Composé vs. Imparfait"
          : "Subjunctive Mood in Conversational French",
      courseTitle: "Conversational French (B1)",
      courseId: "sample-course-1",
      language: "French",
      level: "B1",
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      durationMins: 50,
      objectives:
        "Mastering irregular subjunctive stems (faire -> fasse, aller -> aille) and expressing emotions, doubt, and volition in spoken dialogue.",
      teacher: {
        name: "Prof. Claire Laurent",
        avatarUrl: null,
      },
      aiSummary: {
        summaryText:
          "During this session, we practiced conversational scenarios requiring the subjunctive mood. The student showed great confidence with regular -er/-ir subjunctive endings and practiced complex sentence triggers such as 'bien que', 'il faut que', and 'avoir peur que'.",
        topicsCovered: [
          "Subjunctive Triggers",
          "Irregular Verb Stems",
          "Expressing Doubt & Emotion",
          "Conversational Rhythm",
        ],
      },
      vocabulary: [
        {
          id: "v-1",
          word: "faire ses valises",
          translation: "to pack one's bags / luggage",
          exampleSentence: "Il faut que je fasse mes valises ce soir avant de partir.",
          language: "French",
          status: "LEARNING" as const,
          isFavourited: true,
        },
        {
          id: "v-2",
          word: "bien que (+ subjonctif)",
          translation: "although / even though",
          exampleSentence: "Bien qu'il pleuve, nous irons nous promener.",
          language: "French",
          status: "NEW" as const,
          isFavourited: false,
        },
        {
          id: "v-3",
          word: "au fur et à mesure",
          translation: "gradually / step by step",
          exampleSentence: "Vous assimilerez le vocabulaire au fur et à mesure.",
          language: "French",
          status: "LEARNED" as const,
          isFavourited: true,
        },
        {
          id: "v-4",
          word: "avoir hâte de",
          translation: "to look forward to / can't wait to",
          exampleSentence: "J'ai hâte de visiter Paris l'été prochain.",
          language: "French",
          status: "LEARNING" as const,
          isFavourited: false,
        },
      ],
      corrections: [
        {
          id: "c-1",
          original: "Il faut que je fait mes devoirs ce soir.",
          corrected: "Il faut que je fasse mes devoirs ce soir.",
          explanation:
            "The expression 'il faut que' takes the subjunctive form of faire ('fasse'), not the present indicative ('fait').",
          teacherNote: "Great sentence structure, just watch the subjunctive stem of faire!",
        },
        {
          id: "c-2",
          original: "Je suis allé à le supermarché.",
          corrected: "Je suis allé au supermarché.",
          explanation:
            "The preposition 'à' contracts with the masculine definite article 'le' to form 'au'.",
          teacherNote: null,
        },
      ],
      transcriptSegments: [
        {
          id: "seg-1",
          speakerRole: "TEACHER" as const,
          startMs: 0,
          text: "Bonjour ! Comment s'est passée votre semaine ? Avez-vous eu l'occasion de pratiquer ?",
        },
        {
          id: "seg-2",
          speakerRole: "STUDENT" as const,
          startMs: 12000,
          text: "Bonjour professeur ! Oui, très bien. J'ai révisé les verbes irréguliers chaque jour.",
        },
        {
          id: "seg-3",
          speakerRole: "TEACHER" as const,
          startMs: 25000,
          text: "Excellent ! Aujourd'hui nous nous concentrons sur le subjonctif présent dans le dialogue.",
        },
        {
          id: "seg-4",
          speakerRole: "STUDENT" as const,
          startMs: 42000,
          text: "D'accord, c'est un temps que je trouve un peu difficile mais j'ai hâte d'essayer.",
        },
      ],
      assignment: {
        id: "asg-1",
        title: "Subjunctive Expressions Dialogue Writing",
        description:
          "Write a short 100-word conversational dialogue between two friends planning a trip to Nice, using at least three subjunctive triggers ('il faut que', 'bien que', 'je veux que').",
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        submission: {
          id: "sub-1",
          content:
            "Luc: Salut Marc ! Il faut que nous réservions nos billets pour Nice bientôt.\nMarc: Oui, bien qu'il fasse froid en hiver, le sud de la France est magnifique !",
          submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          feedback: {
            score: 94,
            strengths:
              "Superb choice of vocabulary and correct subjunctive conjugation with 'réserver' and 'faire'.",
            improvements:
              "Practice combining relative pronouns with subjunctive triggers in longer compound sentences.",
            teacherNote:
              "Bravo ! Keep up the consistent writing exercises.",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
        },
      },
      resources: [],
    };

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentLessonReviewClient
          lesson={sampleData}
          studentTimezone={studentTimezone}
        />
      </main>
    );
  }

  // Fetch real lesson from database
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          teacher: {
            include: { user: true },
          },
          enrollments: {
            where: { studentProfileId: student.id },
          },
        },
      },
      session: {
        include: {
          aiAnalysis: {
            include: {
              vocabularyItems: true,
              corrections: true,
            },
          },
          transcript: {
            include: {
              segments: {
                orderBy: { startMs: "asc" },
              },
            },
          },
        },
      },
      resources: {
        orderBy: { createdAt: "desc" },
      },
      assignments: {
        include: {
          submissions: {
            where: { studentProfileId: student.id },
            include: { feedback: true },
          },
        },
      },
    },
  });

  if (!lesson || lesson.course.enrollments.length === 0) {
    notFound();
  }

  const assignment = lesson.assignments[0] || null;
  const submission = assignment?.submissions[0] || null;

  const formattedData = {
    id: lesson.id,
    title: lesson.title,
    courseTitle: lesson.course.title,
    courseId: lesson.course.id,
    language: lesson.course.language,
    level: lesson.course.level,
    scheduledAt: lesson.scheduledAt.toISOString(),
    durationMins: lesson.durationMins,
    objectives: lesson.objectives,
    teacher: {
      name: lesson.course.teacher.user.name,
      avatarUrl: lesson.course.teacher.user.avatarUrl,
    },
    aiSummary: lesson.session?.aiAnalysis
      ? {
          summaryText: lesson.session.aiAnalysis.summaryText,
          topicsCovered: lesson.session.aiAnalysis.topicsCovered,
        }
      : {
          summaryText:
            "During this session, we practiced active conversational dialogue, pronunciation accuracy, and situational vocabulary.",
          topicsCovered: ["Grammar Fundamentals", "Dialogue Practice", "Oral Expression"],
        },
    vocabulary:
      lesson.session?.aiAnalysis?.vocabularyItems &&
      lesson.session.aiAnalysis.vocabularyItems.length > 0
        ? lesson.session.aiAnalysis.vocabularyItems.map((v) => ({
            id: v.id,
            word: v.word,
            translation: v.translation,
            exampleSentence: v.exampleSentence,
            language: v.language,
            status: v.status as "NEW" | "LEARNING" | "LEARNED",
            isFavourited: v.isFavourited,
          }))
        : [
            {
              id: "v-default-1",
              word: "faire attention à",
              translation: "to pay attention to / be careful with",
              exampleSentence: "Faites attention à la prononciation des voyelles nasales.",
              language: lesson.course.language,
              status: "LEARNING" as const,
              isFavourited: false,
            },
          ],
    corrections:
      lesson.session?.aiAnalysis?.corrections &&
      lesson.session.aiAnalysis.corrections.length > 0
        ? lesson.session.aiAnalysis.corrections.map((c) => ({
            id: c.id,
            original: c.original,
            corrected: c.corrected,
            explanation: c.explanation,
            teacherNote: c.teacherNote,
          }))
        : [],
    transcriptSegments:
      lesson.session?.transcript?.segments &&
      lesson.session.transcript.segments.length > 0
        ? lesson.session.transcript.segments.map((s) => ({
            id: s.id,
            speakerRole: s.speakerRole as "TEACHER" | "STUDENT",
            startMs: s.startMs,
            text: s.text,
          }))
        : [
            {
              id: "s-1",
              speakerRole: "TEACHER" as const,
              startMs: 0,
              text: `Bonjour ! Bienvenue à la session de ${lesson.title}.`,
            },
          ],
    assignment: assignment
      ? {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description || "Review the lesson materials and complete the exercises.",
          dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
          submission: submission
            ? {
                id: submission.id,
                content: submission.content || "",
                submittedAt: submission.submittedAt ? submission.submittedAt.toISOString() : null,
                feedback: submission.feedback
                  ? {
                      score: submission.feedback.score,
                      strengths: submission.feedback.strengths,
                      improvements: submission.feedback.improvements,
                      teacherNote: submission.feedback.teacherNote,
                      publishedAt: submission.feedback.publishedAt
                        ? submission.feedback.publishedAt.toISOString()
                        : null,
                    }
                  : null,
              }
            : null,
        }
      : null,
    resources: lesson.resources.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      url: r.url,
      fileType: r.fileType,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StudentLessonReviewClient
        lesson={formattedData}
        studentTimezone={studentTimezone}
      />
    </main>
  );
}
