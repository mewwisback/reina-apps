CREATE TABLE card_definitions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 category text NOT NULL CHECK(category IN ('Hero','Spell','Trap'))
);
CREATE TABLE inventory_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_account_id uuid NOT NULL REFERENCES accounts(id),
 card_id uuid NOT NULL REFERENCES card_definitions(id),
 state text NOT NULL DEFAULT 'available' CHECK(state IN ('available','locked','consumed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inventory_owner ON inventory_items(owner_account_id);
CREATE TABLE operations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id uuid NOT NULL REFERENCES accounts(id),
 operation_key text NOT NULL CHECK(length(operation_key) BETWEEN 1 AND 128),
 request_hash text NOT NULL CHECK(request_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(account_id,operation_key)
);
