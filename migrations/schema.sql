-- KnowledgeBrain Supabase PostgreSQL + pgvector Schema Migration
-- Run this script in the Supabase SQL Editor to initialize tables and vector index.

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    domain TEXT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    content_text TEXT NOT NULL,
    entities_json JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536) -- Optional for high-dimensional vector search
);

-- 2. Patterns Table
CREATE TABLE IF NOT EXISTS public.patterns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'CRITICAL')),
    badge TEXT NOT NULL,
    occurrence_count INT NOT NULL DEFAULT 1,
    document_ids TEXT[] DEFAULT '{}',
    document_names TEXT[] DEFAULT '{}',
    first_detected TEXT,
    last_detected TEXT,
    summary TEXT,
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Chat History Table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL DEFAULT 'default',
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    confidence INT,
    documents_referenced TEXT[] DEFAULT '{}',
    suggested_followups TEXT[] DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Compliance Mappings Table
CREATE TABLE IF NOT EXISTS public.compliance_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT,
    filename TEXT,
    standard_name TEXT NOT NULL,
    clause_reference TEXT NOT NULL,
    status TEXT NOT NULL,
    gap_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on chat history session_id for lightning-fast retrieval
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON public.chat_history(session_id);
