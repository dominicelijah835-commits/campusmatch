
DROP POLICY "Read messages in own accepted connections" ON public.messages;
DROP POLICY "Send messages in own accepted connections" ON public.messages;

CREATE POLICY "Read messages in own accepted connections"
  ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.id = messages.connection_id
      AND c.status = 'accepted'
      AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
  ));

CREATE POLICY "Send messages in own accepted connections"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.connections c
      WHERE c.id = messages.connection_id
        AND c.status = 'accepted'
        AND (c.sender_id = auth.uid() OR c.receiver_id = auth.uid())
    )
  );

DROP FUNCTION IF EXISTS public.is_connection_member(UUID, UUID);

DROP POLICY "Avatar images readable by authenticated" ON storage.objects;
