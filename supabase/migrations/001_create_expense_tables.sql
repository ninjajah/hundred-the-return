-- Создание таблиц для учета совместных расходов

-- Группы расходов (например, "Поездка в Сочи", "День рождения Пети")
CREATE TABLE expense_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Участники в группах расходов
CREATE TABLE participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    expense_group_id UUID REFERENCES expense_groups(id) ON DELETE CASCADE NOT NULL,
    session_id UUID NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Расходы участников
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    participant_name VARCHAR(100) NOT NULL,
    expense_group_id UUID REFERENCES expense_groups(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Индексы для производительности
CREATE INDEX idx_participants_expense_group_id ON participants(expense_group_id);
CREATE INDEX idx_participants_session_id ON participants(session_id);
CREATE INDEX idx_expenses_expense_group_id ON expenses(expense_group_id);
CREATE INDEX idx_expenses_participant_name ON expenses(participant_name);

-- Политики безопасности (Row Level Security)
ALTER TABLE expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Политика для expense_groups - все могут читать активные группы
CREATE POLICY "Anyone can read active expense groups"
ON expense_groups FOR SELECT
USING (is_active = true);

-- Политика для expense_groups - все могут создавать группы
CREATE POLICY "Anyone can create expense groups"
ON expense_groups FOR INSERT
WITH CHECK (true);

-- Политика для participants - все могут читать участников
CREATE POLICY "Anyone can read participants"
ON participants FOR SELECT
USING (true);

-- Политика для participants - все могут добавлять себя как участника
CREATE POLICY "Anyone can insert participants"
ON participants FOR INSERT
WITH CHECK (true);

-- Политика для expenses - все могут читать расходы
CREATE POLICY "Anyone can read expenses"
ON expenses FOR SELECT
USING (true);

-- Политика для expenses - участники могут добавлять свои расходы
CREATE POLICY "Participants can insert their expenses"
ON expenses FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM participants 
        WHERE participants.expense_group_id = expenses.expense_group_id 
        AND participants.name = expenses.participant_name
    )
);

-- Политика для expenses - участники могут обновлять только свои расходы
CREATE POLICY "Participants can update their own expenses"
ON expenses FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM participants 
        WHERE participants.expense_group_id = expenses.expense_group_id 
        AND participants.name = expenses.participant_name
    )
);

-- Политика для expenses - участники могут удалять только свои расходы
CREATE POLICY "Participants can delete their own expenses"
ON expenses FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM participants 
        WHERE participants.expense_group_id = expenses.expense_group_id 
        AND participants.name = expenses.participant_name
    )
);

-- Функция для расчета сводки расходов
CREATE OR REPLACE FUNCTION calculate_expense_summary(group_id UUID)
RETURNS TABLE (
    participant_name TEXT,
    total_spent DECIMAL,
    should_pay DECIMAL,
    balance DECIMAL
) AS $$
DECLARE
    total_group_expenses DECIMAL;
    participants_count INTEGER;
    per_person_share DECIMAL;
BEGIN
    -- Получаем общую сумму расходов группы
    SELECT COALESCE(SUM(amount), 0) INTO total_group_expenses
    FROM expenses 
    WHERE expense_group_id = group_id;
    
    -- Получаем количество участников
    SELECT COUNT(DISTINCT name) INTO participants_count
    FROM participants 
    WHERE expense_group_id = group_id;
    
    -- Рассчитываем долю на человека
    IF participants_count > 0 THEN
        per_person_share := total_group_expenses / participants_count;
    ELSE
        per_person_share := 0;
    END IF;
    
    -- Возвращаем результат для каждого участника
    RETURN QUERY
    SELECT 
        p.name::TEXT as participant_name,
        COALESCE(e.total_spent, 0) as total_spent,
        per_person_share as should_pay,
        (COALESCE(e.total_spent, 0) - per_person_share) as balance
    FROM 
        (SELECT DISTINCT name FROM participants WHERE expense_group_id = group_id) p
    LEFT JOIN 
        (SELECT e.participant_name, SUM(e.amount) as total_spent 
         FROM expenses e 
         WHERE e.expense_group_id = group_id 
         GROUP BY e.participant_name) e 
    ON p.name = e.participant_name
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Комментарии к таблицам
COMMENT ON TABLE expense_groups IS 'Группы для учета совместных расходов';
COMMENT ON TABLE participants IS 'Участники групп расходов';
COMMENT ON TABLE expenses IS 'Индивидуальные расходы участников';
COMMENT ON FUNCTION calculate_expense_summary IS 'Функция расчета баланса участников группы';
