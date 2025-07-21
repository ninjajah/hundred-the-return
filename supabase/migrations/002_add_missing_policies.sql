-- Add missing RLS policy for expense_groups creation
CREATE POLICY "Anyone can create expense groups"
ON expense_groups FOR INSERT
WITH CHECK (true);

-- Add policy for expense_groups updates (optional - for future use)
CREATE POLICY "Anyone can update expense groups"
ON expense_groups FOR UPDATE
USING (true)
WITH CHECK (true);
