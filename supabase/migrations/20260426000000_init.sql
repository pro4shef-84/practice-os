-- ─────────────────────────────────────────────────────────────
-- Practice OS — initial schema
-- ─────────────────────────────────────────────────────────────

-- Waitlist (public, no auth required)
create table if not exists waitlist (
  id               uuid primary key default gen_random_uuid(),
  email            text not null unique,
  current_tool     text,
  biggest_pain     text,
  sessions_per_week text,
  switch_trigger   text,
  urgency          text,
  created_at       timestamptz default now()
);

-- Therapists
create table if not exists therapists (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users on delete cascade,
  full_name           text,
  license_type        text,
  license_number      text,
  npi                 text,
  practice_name       text,
  practice_address    jsonb,
  phone               text,
  email               text,
  stripe_customer_id  text,
  stripe_account_id   text,
  cancellation_hours  int default 24,
  late_cancel_fee     int,
  session_fee         int,
  capacity_max        int default 25,
  timezone            text,
  created_at          timestamptz default now()
);

-- Availability
create table if not exists availability (
  id            uuid primary key default gen_random_uuid(),
  therapist_id  uuid references therapists on delete cascade,
  day_of_week   int,
  start_time    time,
  end_time      time,
  is_active     bool default true
);

-- Clients
create table if not exists clients (
  id                        uuid primary key default gen_random_uuid(),
  therapist_id              uuid references therapists on delete cascade,
  user_id                   uuid references auth.users on delete set null,
  first_name                text,
  last_name                 text,
  email                     text,
  phone                     text,
  date_of_birth             date,
  stripe_customer_id        text,
  stripe_payment_method_id  text,
  diagnosis_code            text,
  session_frequency_target  int,
  source                    text,
  is_active                 bool default true,
  created_at                timestamptz default now()
);

-- Sessions
create table if not exists sessions (
  id                        uuid primary key default gen_random_uuid(),
  therapist_id              uuid references therapists on delete cascade,
  client_id                 uuid references clients on delete cascade,
  scheduled_at              timestamptz,
  duration_minutes          int default 50,
  status                    text default 'scheduled',
  cpt_code                  text default '90837',
  fee_charged               int,
  fee_collected             int,
  payment_status            text default 'pending',
  stripe_payment_intent_id  text,
  cancellation_reason       text,
  cancelled_at              timestamptz,
  created_at                timestamptz default now()
);

-- Notes
create table if not exists notes (
  id            uuid primary key default gen_random_uuid(),
  therapist_id  uuid references therapists on delete cascade,
  client_id     uuid references clients on delete cascade,
  session_id    uuid references sessions on delete cascade,
  template_type text,
  content       jsonb,
  is_signed     bool default false,
  signed_at     timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Intake documents
create table if not exists intake_documents (
  id            uuid primary key default gen_random_uuid(),
  therapist_id  uuid references therapists on delete cascade,
  client_id     uuid references clients on delete cascade,
  document_type text,
  content       jsonb,
  signed_at     timestamptz,
  storage_path  text,
  created_at    timestamptz default now()
);

-- Superbills
create table if not exists superbills (
  id                uuid primary key default gen_random_uuid(),
  therapist_id      uuid references therapists on delete cascade,
  client_id         uuid references clients on delete cascade,
  session_id        uuid references sessions on delete cascade,
  generated_at      timestamptz default now(),
  storage_path      text,
  emailed_to_client bool default false,
  emailed_at        timestamptz
);

-- SMS reminders log
create table if not exists reminders (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid references sessions on delete cascade,
  client_id          uuid references clients on delete cascade,
  reminder_type      text,
  sent_at            timestamptz,
  twilio_message_sid text,
  status             text
);

-- Caseload snapshots
create table if not exists caseload_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  therapist_id        uuid references therapists on delete cascade,
  snapshot_date       date,
  active_count        int,
  capacity_max        int,
  utilization_pct     numeric,
  at_risk_count       int,
  effective_hourly_rate int,
  created_at          timestamptz default now()
);

-- Risk flags
create table if not exists risk_flags (
  id            uuid primary key default gen_random_uuid(),
  therapist_id  uuid references therapists on delete cascade,
  client_id     uuid references clients on delete cascade,
  flag_type     text,
  flagged_at    timestamptz default now(),
  resolved_at   timestamptz,
  resolution    text
);

-- Data imports
create table if not exists data_imports (
  id            uuid primary key default gen_random_uuid(),
  therapist_id  uuid references therapists on delete cascade,
  import_type   text,
  imported_at   timestamptz default now(),
  row_count     int,
  status        text
);

-- Audit log (HIPAA)
create table if not exists audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid,
  actor_type    text,
  action        text,
  resource_type text,
  resource_id   uuid,
  ip_address    text,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

alter table waitlist          enable row level security;
alter table therapists        enable row level security;
alter table availability      enable row level security;
alter table clients           enable row level security;
alter table sessions          enable row level security;
alter table notes             enable row level security;
alter table intake_documents  enable row level security;
alter table superbills        enable row level security;
alter table reminders         enable row level security;
alter table caseload_snapshots enable row level security;
alter table risk_flags        enable row level security;
alter table data_imports      enable row level security;
alter table audit_logs        enable row level security;

-- Waitlist: public insert, service role reads
create policy "public can join waitlist"
  on waitlist for insert with check (true);

-- Therapists: own row only
create policy "therapists: own row"
  on therapists for all
  using (user_id = auth.uid());

-- Availability: therapist owns their availability
create policy "availability: own rows"
  on availability for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Clients: therapist sees only their clients
create policy "clients: own rows"
  on clients for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Sessions: therapist sees only their sessions
create policy "sessions: own rows"
  on sessions for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Notes: therapist sees only their notes
create policy "notes: own rows"
  on notes for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Intake documents: therapist sees only their intake docs
create policy "intake_documents: own rows"
  on intake_documents for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Superbills: therapist sees only their superbills
create policy "superbills: own rows"
  on superbills for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Reminders: therapist sees only their reminders
create policy "reminders: own rows"
  on reminders for all
  using (client_id in (select id from clients where therapist_id in (select id from therapists where user_id = auth.uid())));

-- Caseload snapshots: therapist sees only their snapshots
create policy "caseload_snapshots: own rows"
  on caseload_snapshots for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Risk flags: therapist sees only their flags
create policy "risk_flags: own rows"
  on risk_flags for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Data imports: therapist sees only their imports
create policy "data_imports: own rows"
  on data_imports for all
  using (therapist_id in (select id from therapists where user_id = auth.uid()));

-- Audit logs: therapist sees only their own audit entries
create policy "audit_logs: own rows"
  on audit_logs for all
  using (actor_id = auth.uid());
