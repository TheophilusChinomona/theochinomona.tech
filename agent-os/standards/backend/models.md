# Database & Models

This document defines standards for database modeling, specifically focusing on **PostgreSQL (Supabase/Bun.sql)** and **Firestore (Firebase)**.

## General Principles

- **Naming:** Use `snake_case` for SQL (Postgres) and `camelCase` for NoSQL (Firestore).
- **Timestamps:** Every record/document MUST have `created_at` and `updated_at`.
- **IDs:** Use UUIDs (v4 or v7) for SQL; Auto-generated IDs for Firestore.

---

## PostgreSQL (Supabase / Bun.sql)

### 1. Schema Design
- **Relational:** Normalize data where appropriate (3NF).
- **Foreign Keys:** Always define foreign key constraints to ensure data integrity.
- **Indexes:** Index columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses.

### 2. Supabase Specifics
- **Row Level Security (RLS):** NEVER disable RLS. Write explicit policies for SELECT, INSERT, UPDATE, DELETE.
    ```sql
    -- Example Policy
    create policy "Users can view their own data"
    on profiles for select
    using ( auth.uid() = id );
    ```
- **Real-time:** Only enable real-time replication for tables that strictly require it (performance impact).

### 3. AI & Vector Embeddings (pgvector)
- **Extension:** Enable `vector` extension.
- **Column:** Use the `vector(384)` (or appropriate dimension) data type.
- **Indexing:** Use `hnsw` indexes for fast similarity search.

```sql
create table documents (
  id bigserial primary key,
  content text,
  embedding vector(1536) -- OpenAI embedding size
);

create index on documents using hnsw (embedding vector_cosine_ops);
```

### 4. Performance (Bun.sql)
- Use `Bun.sql` native driver for raw performance in backend services.
- Prepare statements for repeated queries.

---

## Firestore (Firebase)

### 1. Data Modeling
- **Denormalization:** Duplicate data to optimize for read performance (Read-heavy architecture).
- **Subcollections:** Use for data strictly hierarchical and owned by the parent document (e.g., `users/{uid}/settings`).
- **Root Collections:** Use for shared resources (e.g., `products`, `posts`).

### 2. Security Rules
- Write strict rules in `firestore.rules`.
- Validate data types and string lengths in security rules.

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 3. Querying
- Design data models based on your queries ("Query-driven modeling").
- Avoid complex logical OR queries; duplicate data or use separate queries instead.

---

## Model Checklist

- [ ] Timestamps included (`created_at`, `updated_at`)
- [ ] Appropriate ID strategy selected (UUID vs Auto-ID)
- [ ] Security Policies (RLS or Rules) defined and tested
- [ ] Indexes created for common query patterns
- [ ] (SQL) Foreign keys constraints active
- [ ] (NoSQL) Read/Write ratio considered for denormalization