import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для TypeScript
export interface Database {
    public: {
        Tables: {
            expense_groups: {
                Row: {
                    id: string
                    title: string
                    created_at: string
                    is_active: boolean
                }
                Insert: {
                    id?: string
                    title: string
                    created_at?: string
                    is_active?: boolean
                }
                Update: {
                    id?: string
                    title?: string
                    created_at?: string
                    is_active?: boolean
                }
            }
            expenses: {
                Row: {
                    id: string
                    description: string
                    amount: number
                    participant_name: string
                    expense_group_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    description: string
                    amount: number
                    participant_name: string
                    expense_group_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    description?: string
                    amount?: number
                    participant_name?: string
                    expense_group_id?: string
                    created_at?: string
                }
            }
            participants: {
                Row: {
                    id: string
                    name: string
                    expense_group_id: string
                    session_id: string
                    joined_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    expense_group_id: string
                    session_id: string
                    joined_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    expense_group_id?: string
                    session_id?: string
                    joined_at?: string
                }
            }
        }
    }
}
