// src/app/store/selectors.ts

import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './state';

/**
 * Выбираем состояние счетчика из Store по ключу 'counter'.
 */
export const selectCounterState = createFeatureSelector<AppState>('counter');

/**
 * Создаем селектор для получения значения счетчика.
 */
export const selectCounter = createSelector(
    selectCounterState,
    (state: AppState) => state.counter
);

/**
 * Создаем селектор для получения информации об ошибке.
 */
export const selectError = createSelector(
    selectCounterState,
    (state: AppState) => state.error
  );
