// src/app/store/effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { decrement, increment, incrementSuccess, reset, decrementSuccess, resetSuccess, incrementError, decrementError, resetError } from './actions';
import { map, delay, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Класс для определения эффектов приложения.
 */
@Injectable()
export class AppEffects {

  /**
   * Эффект для обработки действия increment.
   * При получении действия increment, эффект ждёт 1 секунду и затем отправляет incrementSuccess.
   */
  increment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(increment), // Слушаем действие increment
      delay(1000),       // Симулируем асинхронную операцию с задержкой 1 секунда
      map(() => incrementSuccess()), // После задержки отправляем действие incrementSuccess
      catchError((error) => of(incrementError({ error: 'Ошибка при увеличении счетчика' })))
    )
  );

  decrement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(decrement), // Слушаем действие decrement
      delay(1000),       // Симулируем асинхронную операцию с задержкой 1 секунда
      map(() => decrementSuccess()), // После задержки отправляем действие decrementSuccess
      catchError((error) => of(incrementError({ error: 'Ошибка при увеличении счетчика' })))
    )
  );

  reset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reset), // Слушаем действие reset
      delay(1000),       // Симулируем асинхронную операцию с задержкой 1 секунда
      map(() => resetSuccess()), // После задержки отправляем действие resetSuccess
      catchError((error) => of(incrementError({ error: 'Ошибка при увеличении счетчика' })))
    )
  );

  // Дополнительный эффект для логирования ошибок
  logError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        incrementError,
        decrementError,
        resetError
      ),
      tap(action => {
        console.error('Ошибка действия:', action);
      })
    ),
    { dispatch: false } // Этот эффект не диспетчеризует новые действия
  );

  constructor(private actions$: Actions) { }
}
