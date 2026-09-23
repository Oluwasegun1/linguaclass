import { NextRequest, NextResponse } from "next/server";
import { webhookReceiver } from "@/lib/video/livekit";
import { db, SessionStatus } from "@workspace/database";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
    }

    // Validate webhook event authenticity
    const event = await webhookReceiver.receive(rawBody, authHeader);

    const roomName = event.room?.name;
    if (!roomName) {
      return NextResponse.json({ received: true });
    }

    // Match session by videoRoomId or lessonId
    const session = await db.session.findFirst({
      where: {
        OR: [
          { videoRoomId: roomName },
          { videoRoomId: `room_${roomName}` },
        ],
      },
    });

    if (!session) {
      return NextResponse.json({ received: true, note: "Session not found in DB" });
    }

    switch (event.event) {
      case "room_started":
        await db.session.update({
          where: { id: session.id },
          data: {
            status: SessionStatus.LIVE,
            startedAt: new Date(),
          },
        });
        break;

      case "room_finished": {
        const endedAt = new Date();
        const durationSecs = session.startedAt
          ? Math.round((endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000)
          : null;

        await db.session.update({
          where: { id: session.id },
          data: {
            status: SessionStatus.COMPLETED,
            endedAt,
            ...(durationSecs ? { durationSecs } : {}),
          },
        });
        break;
      }

      case "egress_ended": {
        // LiveKit Cloud Egress recording finished
        const egressInfo = event.egressInfo;
        const fileResult = egressInfo?.fileResults?.[0];
        if (fileResult?.filename) {
          const storageKey = fileResult.filename;
          const sizeBytes = fileResult.size ? BigInt(fileResult.size) : null;
          const durationSecs = fileResult.duration
            ? Math.round(Number(fileResult.duration) / 1_000_000_000)
            : null;

          await db.recording.upsert({
            where: { sessionId: session.id },
            create: {
              sessionId: session.id,
              storageKey,
              sizeBytes,
              durationSecs,
            },
            update: {
              storageKey,
              sizeBytes,
              durationSecs,
            },
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing LiveKit webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
