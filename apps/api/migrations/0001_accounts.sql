BEGIN;
CREATE TABLE accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE auth_identities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id uuid NOT NULL REFERENCES accounts(id),
 provider text NOT NULL,
 subject text NOT NULL
);
CREATE UNIQUE INDEX identity_provider_subject ON auth_identities(provider, subject);
COMMIT;
