import { AccessToken, RoomServiceClient, WebhookReceiver, TrackSource } from "livekit-server-sdk";

const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";
const livekitHost = process.env.NEXT_PUBLIC_LIVEKIT_URL || "https://livekit.linguaclass.app";

// Singleton LiveKit Room Service client for room lifecycle operations
export const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

// Webhook receiver to validate and process incoming LiveKit webhook events
export const webhookReceiver = new WebhookReceiver(apiKey, apiSecret);

export interface GenerateTokenOptions {
  roomName: string;
  participantIdentity: string;
  participantName: string;
  isTeacher: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a signed JWT access token for a student or teacher joining a live lesson room.
 */
export async function createLiveKitToken({
  roomName,
  participantIdentity,
  participantName,
  isTeacher,
  metadata = {},
}: GenerateTokenOptions): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
    metadata: JSON.stringify(metadata),
    ttl: "4h", // 4 hours maximum session duration
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canPublishSources: [
      TrackSource.CAMERA,
      TrackSource.MICROPHONE,
      TrackSource.SCREEN_SHARE,
      TrackSource.SCREEN_SHARE_AUDIO,
    ],
    // Teachers have admin powers within the room (mute participants, start cloud recording)
    roomAdmin: isTeacher,
    roomRecord: isTeacher,
  });

  return await at.toJwt();
}
