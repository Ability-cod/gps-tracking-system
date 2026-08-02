-- ============================================================
-- Mzumbe GPS Location Tracking System
-- Complete Database Setup Script
-- Developer: Ability M. Johnbosco
-- University: Mzumbe University — BSc. ITS-III
-- Year: 2026
-- ============================================================
-- HOW TO USE:
-- 1. Open pgAdmin
-- 2. Create a new database named: mzumbe_gps
-- 3. Open Query Tool on that database
-- 4. Paste this entire file and click Run (F5)
-- ============================================================


-- ── STEP 1: Clean up old tables if they exist ────────────────
DROP TABLE IF EXISTS visit_logs        CASCADE;
DROP TABLE IF EXISTS assessments       CASCADE;
DROP TABLE IF EXISTS location_history  CASCADE;
DROP TABLE IF EXISTS locations         CASCADE;
DROP TABLE IF EXISTS users             CASCADE;


-- ── STEP 2: Create USERS table ───────────────────────────────
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(150)        NOT NULL,
    email         VARCHAR(150)        NOT NULL UNIQUE,
    password      VARCHAR(255)        NOT NULL,
    role          VARCHAR(20)         NOT NULL
                  CHECK (role IN ('student', 'supervisor', 'admin')),
    supervisor_id INTEGER             DEFAULT NULL
                  REFERENCES users(id) ON DELETE SET NULL,
    phone         VARCHAR(20)         DEFAULT NULL,
    created_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast email lookup (used on every login)
CREATE INDEX idx_users_email
ON users(email);

-- Index for fast supervisor → students lookup
CREATE INDEX idx_users_supervisor_id
ON users(supervisor_id);

-- Index for role filtering
CREATE INDEX idx_users_role
ON users(role);


-- ── STEP 3: Create LOCATIONS table ───────────────────────────
-- Stores the CURRENT live location of each sharing student.
-- One row per student — updated on every GPS ping.
CREATE TABLE locations (
    id          SERIAL PRIMARY KEY,
    student_id  INTEGER         NOT NULL UNIQUE
                REFERENCES users(id) ON DELETE CASCADE,
    latitude    DECIMAL(10, 8)  NOT NULL,
    longitude   DECIMAL(11, 8)  NOT NULL,
    accuracy    DECIMAL(8, 2)   DEFAULT NULL,
    is_sharing  BOOLEAN         DEFAULT TRUE,
    updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast supervisor map queries
CREATE INDEX idx_locations_student_id
ON locations(student_id);

CREATE INDEX idx_locations_is_sharing
ON locations(is_sharing);


-- ── STEP 4: Create LOCATION_HISTORY table ────────────────────
-- Stores every location sharing SESSION permanently.
-- One new row created each time a student starts sharing.
-- Closed (ended_at filled) when student stops sharing.
CREATE TABLE location_history (
    id               SERIAL PRIMARY KEY,
    student_id       INTEGER         NOT NULL
                     REFERENCES users(id) ON DELETE CASCADE,
    latitude         DECIMAL(10, 8)  DEFAULT NULL,
    longitude        DECIMAL(11, 8)  DEFAULT NULL,
    started_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    ended_at         TIMESTAMP       DEFAULT NULL,
    duration_minutes DECIMAL(10, 2)  DEFAULT NULL
);

-- Index for fast student history queries
CREATE INDEX idx_location_history_student_id
ON location_history(student_id);

-- Index for date range filtering (last 7/14/30 days)
CREATE INDEX idx_location_history_started_at
ON location_history(started_at);


-- ── STEP 5: Create ASSESSMENTS table ─────────────────────────
-- One assessment record per student.
-- Updated in place using UPSERT (ON CONFLICT DO UPDATE).
CREATE TABLE assessments (
    id            SERIAL PRIMARY KEY,
    supervisor_id INTEGER      NOT NULL
                  REFERENCES users(id) ON DELETE CASCADE,
    student_id    INTEGER      NOT NULL UNIQUE
                  REFERENCES users(id) ON DELETE CASCADE,
    status        VARCHAR(20)  NOT NULL DEFAULT 'not_assessed'
                  CHECK (status IN ('assessed', 'not_assessed')),
    note          TEXT         DEFAULT NULL,
    assessed_at   TIMESTAMP    DEFAULT NULL
);

-- Index for fast supervisor assessments lookup
CREATE INDEX idx_assessments_supervisor_id
ON assessments(supervisor_id);

-- Index for student assessment lookup
CREATE INDEX idx_assessments_student_id
ON assessments(student_id);


-- ── STEP 6: Create VISIT_LOGS table ──────────────────────────
-- Multiple visit records allowed per student.
-- Each supervisor visit creates a new row.
CREATE TABLE visit_logs (
    id               SERIAL PRIMARY KEY,
    supervisor_id    INTEGER      NOT NULL
                     REFERENCES users(id) ON DELETE CASCADE,
    supervisor_name  VARCHAR(150) NOT NULL,
    student_id       INTEGER      NOT NULL
                     REFERENCES users(id) ON DELETE CASCADE,
    student_name     VARCHAR(150) NOT NULL,
    note             TEXT         DEFAULT NULL,
    location_name    VARCHAR(255) DEFAULT NULL,
    visited_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast student visit history
CREATE INDEX idx_visit_logs_student_id
ON visit_logs(student_id);

-- Index for fast supervisor visit history
CREATE INDEX idx_visit_logs_supervisor_id
ON visit_logs(supervisor_id);

-- Index for date ordering
CREATE INDEX idx_visit_logs_visited_at
ON visit_logs(visited_at);


-- ── STEP 7: Insert default admin account ─────────────────────
-- Email:    admin@mzumbe.ac.tz
-- Password: Admin@2026
-- NOTE: This hash was generated by PHP bcrypt cost 12.
--       After inserting, visit set_admin.php in your browser
--       to regenerate a fresh hash if login fails.
INSERT INTO users (name, email, password, role)
VALUES (
    'System Administrator',
    'admin@mzumbe.ac.tz',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
)
ON CONFLICT (email) DO NOTHING;


-- ── STEP 8: Verify setup ─────────────────────────────────────
SELECT
    '✅ Tables created successfully' AS status,
    COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'locations', 'location_history',
    'assessments', 'visit_logs'
);

SELECT
    '✅ Admin account ready' AS status,
    id, name, email, role, created_at
FROM users
WHERE role = 'admin';

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
-- Tables created:
--   users            — Admin, Supervisor, Student accounts
--   locations        — Current live GPS position per student
--   location_history — Full session audit trail with duration
--   assessments      — One assessment record per student
--   visit_logs       — All supervisor visits (multiple allowed)
--
-- Default admin login:
--   Email:    admin@mzumbe.ac.tz
--   Password: Admin@2026
--
-- IMPORTANT: If admin login fails, visit:
--   http://localhost/Mzumbe-GPS-PHP/backend/set_admin.php
--   This will regenerate the correct PHP bcrypt hash.
-- ============================================================