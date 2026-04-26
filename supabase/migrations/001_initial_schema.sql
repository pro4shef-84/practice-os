-- Practice OS — Initial Schema
-- All tables with RLS enabled from day one (HIPAA requirement)
-- Run: supabase db push

-- ─── Enable UUID extension ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Therapists ───────────────────────────────────────────────────────────────
create table therapists (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references auth.users not null unique,
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
  cancellation_hours  int not null default 24,
  late_cancel_fee     int,
  session_fee         int,
  capacity_max        int not null default 25,
  timezone            text,
  created_at          timestamptz not null default now()
);

alter table therapists enable row level security;

create policy "therapist_own_record" on therapists
  for all using (user_id = auth.uid());

-- ─── Availability ─────────────────────────────────────────────────────────────
create table availability (
  id            uuid primary key default uuid_generate_v4(),
  therapist_id  uuid references therapists not null,
  day_of_week   int not null check (day_of_week between 0 and 6),
  start_time    time not null,
  end_time      time not null,
  is_active     bool not null default true
);

alter table availability enable row level security;

create policy "therapist_own_availability" on availability
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

-- ─── Clients ──────────────────────────────────────────────────────────────────
create table clients (
  id                         uuid primary key default uuid_generate_v4(),
  therapist_id               uuid references therapists not null,
  user_id                    uuid references auth.users,
  first_name                 text not null,
  last_name                  text not null,
  email                      text,
  phone                      text,
  date_of_birth              date,
  stripe_customer_id         text,
  stripe_payment_method_id   text,
  diagnosis_code             text,
  session_frequency_target   int,
  source                     text,
  is_active                  bool not null default true,
  created_at                 timestamptz not null default now()
);

alter table clients enable row level security;

create policy "therapist_own_clients" on clients
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

create policy "client_own_record" on clients
  for select using (user_id = auth.uid());

-- ─── Sessions ─────────────────────────────────────────────────────────────────
create table sessions (
  id                       uuid primary key default uuid_generate_v4(),
  therapist_id             uuid references therapists not null,
  client_id                uuid references clients not null,
  scheduled_at             timestamptz not null,
  duration_minutes         int not null default 50,
  status                   text not null default 'scheduled'
                             check (status in ('scheduled','completed','cancelled','no_show','late_cancel')),
  cpt_code                 text not null default '90837',
  fee_charged              int,
  fee_collected            int,
  payment_status           text check (payment_status in ('pending','paid','waived')),
  stripe_payment_intent_id text,
  cancellation_reason      text,
  cancelled_at             timestamptz,
  created_at               timestamptz not null default now()
);

alter table sessions enable row level security;

create policy "therapist_own_sessions" on sessions
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

create policy "client_own_sessions" on sessions
  for select using (
    client_id in (select id from clients where user_id = auth.uid())
  );

-- ─── Notes ────────────────────────────────────────────────────────────────────
create table notes (
  id             uuid primary key default uuid_generate_v4(),
  therapist_id   uuid references therapists not null,
  client_id      uuid references clients not null,
  session_id     uuid references sessions not null unique,
  template_type  text not null check (template_type in ('SOAP','DAP','BIRP','progress')),
  content        jsonb not null default '{}',
  is_signed      bool not null default false,
  signed_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table notes enable row level security;

-- Notes are ONLY visible to the therapist — never to clients
create policy "therapist_own_notes" on notes
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

-- Auto-update updated_at on every write
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger notes_updated_at
  before update on notes
  for each row execute function update_updated_at();

-- ─── Intake Documents ─────────────────────────────────────────────────────────
create table intake_documents (
  id             uuid primary key default uuid_generate_v4(),
  therapist_id   uuid references therapists not null,
  client_id      uuid references clients not null,
  document_type  text not null check (document_type in (
    'consent_to_treat','telehealth_consent','cancellation_policy','intake_form','card_authorization'
  )),
  content        jsonb not null default '{}',
  signed_at      timestamptz,
  storage_path   text,
  created_at     timestamptz not null default now()
);

alter table intake_documents enable row level security;

create policy "therapist_own_intake_docs" on intake_documents
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

create policy "client_own_intake_docs" on intake_documents
  for select using (
    client_id in (select id from clients where user_id = auth.uid())
  );

-- ─── Superbills ───────────────────────────────────────────────────────────────
create table superbills (
  id                 uuid primary key default uuid_generate_v4(),
  therapist_id       uuid references therapists not null,
  client_id          uuid references clients not null,
  session_id         uuid references sessions not null,
  generated_at       timestamptz not null default now(),
  storage_path       text,
  emailed_to_client  bool not null default false,
  emailed_at         timestamptz
);

alter table superbills enable row level security;

create policy "therapist_own_superbills" on superbills
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

create policy "client_own_superbills" on superbills
  for select using (
    client_id in (select id from clients where user_id = auth.uid())
  );

-- ─── Reminders ────────────────────────────────────────────────────────────────
create table reminders (
  id                  uuid primary key default uuid_generate_v4(),
  session_id          uuid references sessions not null,
  client_id           uuid references clients not null,
  reminder_type       text not null check (reminder_type in ('48hr','24hr','2hr','confirmation')),
  sent_at             timestamptz,
  twilio_message_sid  text,
  status              text check (status in ('sent','delivered','failed'))
);

alter table reminders enable row level security;

create policy "therapist_own_reminders" on reminders
  for all using (
    session_id in (
      select id from sessions where therapist_id = (
        select id from therapists where user_id = auth.uid()
      )
    )
  );

-- ─── Caseload Snapshots ───────────────────────────────────────────────────────
create table caseload_snapshots (
  id                   uuid primary key default uuid_generate_v4(),
  therapist_id         uuid references therapists not null,
  snapshot_date        date not null,
  active_count         int not null,
  capacity_max         int not null,
  utilization_pct      numeric not null,
  at_risk_count        int not null,
  effective_hourly_rate int,
  created_at           timestamptz not null default now(),
  unique (therapist_id, snapshot_date)
);

alter table caseload_snapshots enable row level security;

create policy "therapist_own_snapshots" on caseload_snapshots
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

-- ─── Risk Flags ───────────────────────────────────────────────────────────────
create table risk_flags (
  id            uuid primary key default uuid_generate_v4(),
  therapist_id  uuid references therapists not null,
  client_id     uuid references clients not null,
  flag_type     text not null check (flag_type in (
    'cancellation_pattern','cadence_drift','long_gap','no_future_session'
  )),
  flagged_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolution    text check (resolution in ('intentional','re-engaged','discharged'))
);

alter table risk_flags enable row level security;

create policy "therapist_own_risk_flags" on risk_flags
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

-- ─── Data Imports ─────────────────────────────────────────────────────────────
create table data_imports (
  id            uuid primary key default uuid_generate_v4(),
  therapist_id  uuid references therapists not null,
  import_type   text not null check (import_type in ('simplepractice_csv','manual')),
  imported_at   timestamptz not null default now(),
  row_count     int,
  status        text not null default 'processing'
                  check (status in ('processing','complete','failed'))
);

alter table data_imports enable row level security;

create policy "therapist_own_imports" on data_imports
  for all using (
    therapist_id = (select id from therapists where user_id = auth.uid())
  );

-- ─── Audit Logs ───────────────────────────────────────────────────────────────
create table audit_logs (
  id             uuid primary key default uuid_generate_v4(),
  actor_id       uuid,
  actor_type     text check (actor_type in ('therapist','client')),
  action         text not null,
  resource_type  text,
  resource_id    uuid,
  ip_address     text,
  created_at     timestamptz not null default now()
);

alter table audit_logs enable row level security;

-- Therapists can read their own audit log entries; no one can delete
create policy "therapist_own_audit_logs" on audit_logs
  for select using (
    actor_id = auth.uid()
    or resource_id in (
      select id from clients where therapist_id = (
        select id from therapists where user_id = auth.uid()
      )
    )
  );

-- Service role can insert audit logs (done server-side, bypasses RLS intentionally)
create policy "service_insert_audit_logs" on audit_logs
  for insert with check (true);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index idx_sessions_therapist_scheduled on sessions (therapist_id, scheduled_at);
create index idx_sessions_client on sessions (client_id);
create index idx_notes_session on notes (session_id);
create index idx_risk_flags_therapist_unresolved on risk_flags (therapist_id) where resolved_at is null;
create index idx_reminders_session on reminders (session_id);
create index idx_audit_logs_actor on audit_logs (actor_id, created_at);
