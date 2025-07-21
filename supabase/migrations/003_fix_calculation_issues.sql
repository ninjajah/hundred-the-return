-- Обновление функции расчета сводки расходов для исправления проблем

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

-- Комментарии для объяснения логики
COMMENT ON FUNCTION calculate_expense_summary IS 'Функция расчета баланса участников группы. Потратил - сумма всех расходов участника. Должен - общие расходы группы деленные на количество участников. Баланс - разность между потраченным и долей к оплате.';
