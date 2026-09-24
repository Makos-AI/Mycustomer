-- Create the reserved MyCustomer system account
-- Safe to run multiple times (ON CONFLICT DO NOTHING)

INSERT INTO auth.users (id, phone, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+00000000000',
  now(),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, phone, display_name, role, completion_rate, total_completed_rides)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '+00000000000',
  'MyCustomer',
  'rider',
  100.00,
  0
)
ON CONFLICT (id) DO NOTHING;
