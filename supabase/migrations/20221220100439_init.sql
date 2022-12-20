CREATE TABLE did_documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name text,
    document jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);