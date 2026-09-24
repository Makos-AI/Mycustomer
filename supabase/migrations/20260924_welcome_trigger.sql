-- Trigger: auto-send welcome message from MyCustomer system account to every new user

CREATE OR REPLACE FUNCTION public.handle_new_user_welcome()
RETURNS TRIGGER AS $$
DECLARE
  v_conv_id UUID;
  v_system_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Create a new conversation
  INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO v_conv_id;

  -- Add both users as members
  INSERT INTO public.conversation_members (conversation_id, user_id)
  VALUES (v_conv_id, NEW.id), (v_conv_id, v_system_id);

  -- Send the welcome message as the system account
  INSERT INTO public.chat_messages (conversation_id, sender_id, content, type)
  VALUES (
    v_conv_id,
    v_system_id,
    E'Welcome to MyCustomer!\n\nHere you can:\n- Book rides with your trusted drivers\n- Negotiate fares without commissions\n- Track the reliability of your contacts\n\nNeed help? Email: support@mycustomer.app',
    'text'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate to avoid duplicate triggers on re-runs
DROP TRIGGER IF EXISTS trg_new_user_welcome ON public.profiles;

CREATE TRIGGER trg_new_user_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  -- Don't trigger for the system account itself
  WHEN (NEW.id != '00000000-0000-0000-0000-000000000001')
  EXECUTE FUNCTION public.handle_new_user_welcome();
