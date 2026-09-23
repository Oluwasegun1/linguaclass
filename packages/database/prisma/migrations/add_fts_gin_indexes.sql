-- LinguaClass — Full-Text Search GIN Indexes
-- Run this after `prisma migrate dev` to add PostgreSQL GIN tsvector indexes.
-- These cannot be expressed in schema.prisma directly; they require raw SQL.

-- Transcript segments: search on transcribed text
CREATE INDEX IF NOT EXISTS "TranscriptSegment_text_fts"
  ON "TranscriptSegment"
  USING gin(to_tsvector('english', "text"));

-- Vocabulary items: search on term + definition concatenated
CREATE INDEX IF NOT EXISTS "VocabularyItem_term_definition_fts"
  ON "VocabularyItem"
  USING gin(to_tsvector('english', term || ' ' || definition));

-- Notes: search on note content
CREATE INDEX IF NOT EXISTS "Note_content_fts"
  ON "Note"
  USING gin(to_tsvector('english', content));
