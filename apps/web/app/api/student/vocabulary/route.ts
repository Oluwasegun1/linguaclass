import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/auth";
import { db, VocabStatus, AIStatus } from "@workspace/database";

export async function GET(req: Request) {
  try {
    const session = await requireStudent();
    const student = session.dbUser.studentProfile;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const favouritedOnly = searchParams.get("favourited") === "true";

    const where: any = {
      studentProfileId: student.id,
      aiStatus: AIStatus.ACCEPTED,
    };

    if (status && Object.values(VocabStatus).includes(status as VocabStatus)) {
      where.status = status as VocabStatus;
    }

    if (favouritedOnly) {
      where.isFavourited = true;
    }

    const items = await db.vocabularyItem.findMany({
      where,
      orderBy: [{ isFavourited: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ vocabulary: items });
  } catch (error) {
    console.error("Failed to list student vocabulary:", error);
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireStudent();
    const student = session.dbUser.studentProfile;

    const { id, status, isFavourited } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Vocabulary item ID is required" }, { status: 400 });
    }

    const existing = await db.vocabularyItem.findUnique({
      where: { id },
    });

    if (!existing || existing.studentProfileId !== student.id) {
      return NextResponse.json({ error: "Item not found or forbidden" }, { status: 404 });
    }

    const data: any = {};
    if (status && Object.values(VocabStatus).includes(status as VocabStatus)) {
      data.status = status as VocabStatus;
    }
    if (typeof isFavourited === "boolean") {
      data.isFavourited = isFavourited;
    }

    const updated = await db.vocabularyItem.update({
      where: { id },
      data,
    });

    // Update Progress count if status changed to LEARNED
    if (data.status === VocabStatus.LEARNED) {
      const totalLearned = await db.vocabularyItem.count({
        where: {
          studentProfileId: student.id,
          status: VocabStatus.LEARNED,
        },
      });

      // Update student's first course progress record
      const enrollments = await db.enrollment.findMany({
        where: { studentProfileId: student.id },
      });

      if (enrollments[0]) {
        await db.progress.upsert({
          where: {
            studentProfileId_courseId: {
              studentProfileId: student.id,
              courseId: enrollments[0].courseId,
            },
          },
          create: {
            studentProfileId: student.id,
            courseId: enrollments[0].courseId,
            vocabulary: totalLearned,
          },
          update: {
            vocabulary: totalLearned,
          },
        });
      }
    }

    return NextResponse.json({ updated });
  } catch (error) {
    console.error("Failed to update vocabulary item:", error);
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 500 });
  }
}
