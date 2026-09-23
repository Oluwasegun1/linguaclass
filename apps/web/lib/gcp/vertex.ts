import { VertexAI } from "@google-cloud/vertexai";

const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "linguaclass-prod";
const location = process.env.GCP_LOCATION || "europe-west1";

// Initialize Vertex AI Client with Application Default Credentials (ADC)
const vertexAI = new VertexAI({
  project: projectId,
  location: location,
});

// Use Gemini 1.5 Pro / Flash for structured multimodal intelligence
const generativeModel = vertexAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2,
  },
});

export interface TranscriptSegmentInput {
  speakerId: string;
  speakerRole: "TEACHER" | "STUDENT";
  text: string;
}

export interface ExtractedCorrection {
  studentId: string;
  original: string;
  corrected: string;
  explanation: string;
}

export interface ExtractedVocabulary {
  word: string;
  translation: string;
  exampleSentence?: string;
  language: string;
}

export interface LessonAnalysisResult {
  summaryText: string;
  topicsCovered: string[];
  corrections: ExtractedCorrection[];
  vocabularyItems: ExtractedVocabulary[];
  modelVersion: string;
}

/**
 * Analyzes a completed lesson transcript using Vertex AI Gemini.
 * Extracts key topics, lesson summary, grammar corrections for students, and vocabulary.
 */
export async function analyzeLessonSession(
  segments: TranscriptSegmentInput[],
  language: string,
  level: string
): Promise<LessonAnalysisResult> {
  const formattedTranscript = segments
    .map((s) => `[${s.speakerRole} (${s.speakerId})]: ${s.text}`)
    .join("\n");

  const prompt = `
You are an expert language pedagogy AI assisting a language teacher in LinguaClass.
Language: ${language}
Target CEFR Level: ${level}

Analyze the following lesson transcript between a teacher and student(s).

Transcript:
"""
${formattedTranscript}
"""

Please produce a structured JSON response matching this JSON schema:
{
  "summaryText": "Brief 2-3 sentence overview of the lesson discussion",
  "topicsCovered": ["Topic 1", "Topic 2"],
  "corrections": [
    {
      "studentId": "userId of student who made the error",
      "original": "Exact phrase student spoke with error",
      "corrected": "Correct native phrasing",
      "explanation": "Brief grammatical/lexical reason"
    }
  ],
  "vocabularyItems": [
    {
      "word": "Target word/idiom introduced or practiced",
      "translation": "English translation or definition",
      "exampleSentence": "Example sentence in target language",
      "language": "${language.toLowerCase()}"
    }
  ]
}
`;

  try {
    const response = await generativeModel.generateContent(prompt);
    const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Vertex AI Gemini");
    }

    const parsed = JSON.parse(text) as Omit<LessonAnalysisResult, "modelVersion">;
    return {
      ...parsed,
      modelVersion: "gemini-1.5-flash",
    };
  } catch (error) {
    console.error("Failed to analyze lesson with Vertex AI:", error);
    throw error;
  }
}

/**
 * Generates an AI draft feedback for a student's assignment submission.
 */
export async function generateAssignmentAIFeedback(
  assignmentTitle: string,
  assignmentDescription: string,
  submissionContent: string,
  language: string,
  level: string
): Promise<{ strengths: string; improvements: string; aiDraft: string }> {
  const prompt = `
You are an AI teaching assistant.
Target Language: ${language} (Level: ${level})
Assignment: ${assignmentTitle}
Instructions: ${assignmentDescription}

Student Submission:
"""
${submissionContent}
"""

Provide structured constructive feedback for the teacher to review and publish.
Return JSON with the following schema:
{
  "strengths": "Highlights of what the student did well",
  "improvements": "Specific areas to practice and correct",
  "aiDraft": "A warm, motivating personalized feedback paragraph addressed to the student"
}
`;

  try {
    const response = await generativeModel.generateContent(prompt);
    const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Vertex AI Gemini");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate assignment feedback with Vertex AI:", error);
    throw error;
  }
}

export { vertexAI, generativeModel };
