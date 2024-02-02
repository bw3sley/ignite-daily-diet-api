// eslint-disable-next-line
import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      meal_time: number
      is_on_diet: boolean
      created_at: string

      user_id: string
    }

    users: {
      id: string
      session_id: string
      username: string
      created_at: string
    }
  }
}
