// src/app/store/reducers.ts

import { Action, createReducer, on } from '@ngrx/store';
import { incrementSuccess, decrementSuccess, resetSuccess, incrementError, decrementError, resetError } from './actions';
import { AppState, initialState } from './state';

/**
 * Создаем редьюсер для управления состоянием счетчика.
 */
const _counterReducer = createReducer(
  initialState,
  on(incrementSuccess, (state) => ({
    ...state,
    counter: state.counter + 1,
    error: null, 
  })),
  on(decrementSuccess, (state) => ({
    ...state,
    counter: state.counter - 1,
    error: null, 
  })),
  on(resetSuccess, (state) => ({
    ...state,
    counter: 0,
    error: null, 
  })),
  on(incrementError, (state, { error }) => ({
    ...state,
    error, 
  })),
  on(decrementError, (state, { error }) => ({
    ...state,
    error, 
  })),
  on(resetError, (state, { error }) => ({
    ...state,
    error, 
  })),
);

/**
 * Экспортируем редьюсер для использования в StoreModule.
 */
export function counterReducer(state: AppState | undefined, action: Action) {
  return _counterReducer(state, action);
}
