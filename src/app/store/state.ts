// src/app/store/state.ts

/**
 * Интерфейс состояния приложения.
 */
export interface AppState {
  counter: number;
  error: string | null; // Информация об ошибке, если она произошла
}

/**
 * Начальное состояние приложения.
 */
export const initialState: AppState = {
  counter: 0,
  error: null, // Изначально ошибок нет
};
