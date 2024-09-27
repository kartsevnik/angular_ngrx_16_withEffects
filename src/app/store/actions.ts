// src/app/store/actions.ts

import { createAction, props } from '@ngrx/store';

/**
 * Действие для увеличения счетчика.
 */
export const increment = createAction('[Counter] Increment');
export const incrementSuccess = createAction('[Counter] Increment Success');
export const incrementError = createAction('[Counter] Increment Error', props<{ error: string }>());
/**
 * Действие для уменьшения счетчика.
 */
export const decrement = createAction('[Counter] Decrement');
export const decrementSuccess = createAction('[Counter] decrement Success');
export const decrementError = createAction('[Counter] decrement Error', props<{ error: string }>());
/**
 * Действие для сброса счетчика.
 */
export const reset = createAction('[Counter] Reset');
export const resetSuccess = createAction('[Counter] reset Success');
export const resetError = createAction('[Counter] reset Error', props<{ error: string }>());