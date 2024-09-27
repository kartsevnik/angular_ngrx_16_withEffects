Конечно! Давайте рассмотрим, как процесс обработки событий изменится, если в вашем приложении используются **Эффекты (Effects)**. Мы добавим пример использования эффектов в наш простой счетчик и подробно разберём, что происходит на каждом этапе при клике на кнопку.

## Обзор

**NgRx Effects** используются для обработки побочных эффектов, таких как асинхронные операции (например, HTTP-запросы), таймеры или доступ к внешним API. Они позволяют отделить логику побочных эффектов от компонентов и редьюсеров, делая код более чистым и тестируемым.

В нашем примере мы добавим эффект, который будет симулировать асинхронное увеличение счётчика. При клике на кнопку **"Увеличить"** будет отправлено действие `increment`, которое будет обрабатываться эффектом `IncrementEffect`. Этот эффект выполнит асинхронную операцию (например, задержку на 1 секунду) и после её завершения отправит действие `incrementSuccess`, которое уже будет обрабатываться редьюсером для обновления состояния.

## Обновлённая Файловая Структура

```
src/
├── app/
│   ├── store/
│   │   ├── actions.ts
│   │   ├── effects.ts
│   │   ├── reducers.ts
│   │   ├── selectors.ts
│   │   └── state.ts
│   ├── components/
│   │   └── counter/
│   │       ├── counter.component.ts
│   │       └── counter.component.html
```

## Шаги с использованием Effects

### Шаг 1: Обновление Действий (actions.ts)

Добавим новое действие `incrementSuccess`, которое будет отправляться после успешного выполнения эффекта.

```typescript
// src/app/store/actions.ts

import { createAction } from '@ngrx/store';

/**
 * Действие для инициации увеличения счетчика.
 */
export const increment = createAction('[Counter] Increment');

/**
 * Действие для уменьшения счетчика.
 */
export const decrement = createAction('[Counter] Decrement');

/**
 * Действие для сброса счетчика.
 */
export const reset = createAction('[Counter] Reset');

/**
 * Действие, отправляемое после успешного увеличения счетчика.
 */
export const incrementSuccess = createAction('[Counter] Increment Success');
```

### Шаг 2: Создание Эффекта (effects.ts)

Создадим эффект `IncrementEffect`, который будет реагировать на действие `increment`, выполнять асинхронную операцию и затем отправлять `incrementSuccess`.

```typescript
// src/app/store/effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { increment, incrementSuccess } from './actions';
import { map, delay } from 'rxjs/operators';

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
      map(() => incrementSuccess()) // После задержки отправляем действие incrementSuccess
    )
  );

  constructor(private actions$: Actions) {}
}
```

### Шаг 3: Обновление Редьюсера (reducers.ts)

Добавим обработку нового действия `incrementSuccess` в редьюсере.

```typescript
// src/app/store/reducers.ts

import { Action, createReducer, on } from '@ngrx/store';
import { increment, decrement, reset, incrementSuccess } from './actions';
import { AppState, initialState } from './state';

/**
 * Создаем редьюсер для управления состоянием счетчика.
 */
const _counterReducer = createReducer(
  initialState,
  on(incrementSuccess, (state) => ({
    ...state,
    counter: state.counter + 1, // Увеличиваем счетчик на 1 после успешного эффекта
  })),
  on(decrement, (state) => ({
    ...state,
    counter: state.counter - 1,
  })),
  on(reset, (state) => ({
    ...state,
    counter: 0,
  }))
);

/**
 * Экспортируем редьюсер для использования в StoreModule.
 */
export function counterReducer(state: AppState | undefined, action: Action) {
  return _counterReducer(state, action);
}
```

### Шаг 4: Обновление Селекторов (selectors.ts)

Селекторы остаются без изменений, так как мы всё ещё работаем с тем же состоянием.

```typescript
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
```

### Шаг 5: Обновление Компонента (counter.component.ts)

Компонент остаётся практически без изменений, за исключением того, что теперь при нажатии кнопки **"Увеличить"** будет происходить асинхронное увеличение.

```typescript
// src/app/components/counter/counter.component.ts

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { increment, decrement, reset } from '../../store/actions';
import { selectCounter } from '../../store/selectors';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
})
export class CounterComponent {
  counter$: Observable<number>;

  constructor(private store: Store) {
    /**
     * Используем селектор для получения значения счетчика.
     */
    this.counter$ = this.store.select(selectCounter);
  }

  /**
   * Инициирует асинхронное увеличение счетчика.
   */
  onIncrement() {
    this.store.dispatch(increment());
  }

  /**
   * Уменьшает счетчик на 1.
   */
  onDecrement() {
    this.store.dispatch(decrement());
  }

  /**
   * Сбрасывает счетчик до 0.
   */
  onReset() {
    this.store.dispatch(reset());
  }
}
```

### Шаг 6: Регистрация Эффектов в Модуле (app.module.ts)

Убедимся, что эффекты зарегистрированы в модуле приложения.

```typescript
// src/app/app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CounterComponent } from './components/counter/counter.component';

// Store
import { StoreModule } from '@ngrx/store';
import { counterReducer } from './store/reducers';
import { AppEffects } from './store/effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  declarations: [
    AppComponent,
    CounterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({ counter: counterReducer }),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }), // Опционально
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### Шаг 7: Обновление Шаблона Компонента (counter.component.html)

Добавим индикатор загрузки, чтобы показать пользователю, что операция выполняется.

```html
<!-- src/app/components/counter/counter.component.html -->

<h1>Счетчик: {{ counter$ | async }}</h1>
<button (click)="onIncrement()">Увеличить</button>
<button (click)="onDecrement()">Уменьшить</button>
<button (click)="onReset()">Сбросить</button>
```

Для отображения состояния загрузки, нам потребуется добавить дополнительное состояние и соответствующие действия. Однако, для простоты примера мы оставим индикатор загрузки вне области внимания.

## Полный Код с Эффектами

### actions.ts

```typescript
// src/app/store/actions.ts

import { createAction } from '@ngrx/store';

/**
 * Действие для инициации увеличения счетчика.
 */
export const increment = createAction('[Counter] Increment');

/**
 * Действие для уменьшения счетчика.
 */
export const decrement = createAction('[Counter] Decrement');

/**
 * Действие для сброса счетчика.
 */
export const reset = createAction('[Counter] Reset');

/**
 * Действие, отправляемое после успешного увеличения счетчика.
 */
export const incrementSuccess = createAction('[Counter] Increment Success');
```

### effects.ts

```typescript
// src/app/store/effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { increment, incrementSuccess } from './actions';
import { map, delay } from 'rxjs/operators';

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
      map(() => incrementSuccess()) // После задержки отправляем действие incrementSuccess
    )
  );

  constructor(private actions$: Actions) {}
}
```

### reducers.ts

```typescript
// src/app/store/reducers.ts

import { Action, createReducer, on } from '@ngrx/store';
import { increment, decrement, reset, incrementSuccess } from './actions';
import { AppState, initialState } from './state';

/**
 * Создаем редьюсер для управления состоянием счетчика.
 */
const _counterReducer = createReducer(
  initialState,
  on(incrementSuccess, (state) => ({
    ...state,
    counter: state.counter + 1, // Увеличиваем счетчик на 1 после успешного эффекта
  })),
  on(decrement, (state) => ({
    ...state,
    counter: state.counter - 1,
  })),
  on(reset, (state) => ({
    ...state,
    counter: 0,
  }))
);

/**
 * Экспортируем редьюсер для использования в StoreModule.
 */
export function counterReducer(state: AppState | undefined, action: Action) {
  return _counterReducer(state, action);
}
```

### selectors.ts

```typescript
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
```

### state.ts

```typescript
// src/app/store/state.ts

/**
 * Интерфейс состояния приложения.
 */
export interface AppState {
    counter: number;
  }
  
  /**
   * Начальное состояние приложения.
   */
  export const initialState: AppState = {
    counter: 0,
  };
```

### counter.component.ts

```typescript
// src/app/components/counter/counter.component.ts

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { increment, decrement, reset } from '../../store/actions';
import { selectCounter } from '../../store/selectors';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
})
export class CounterComponent {
  counter$: Observable<number>;

  constructor(private store: Store) {
    /**
     * Используем селектор для получения значения счетчика.
     */
    this.counter$ = this.store.select(selectCounter);
  }

  /**
   * Инициирует асинхронное увеличение счетчика.
   */
  onIncrement() {
    this.store.dispatch(increment());
  }

  /**
   * Уменьшает счетчик на 1.
   */
  onDecrement() {
    this.store.dispatch(decrement());
  }

  /**
   * Сбрасывает счетчик до 0.
   */
  onReset() {
    this.store.dispatch(reset());
  }
}
```

### counter.component.html

```html
<!-- src/app/components/counter/counter.component.html -->

<h1>Счетчик: {{ counter$ | async }}</h1>
<button (click)="onIncrement()">Увеличить</button>
<button (click)="onDecrement()">Уменьшить</button>
<button (click)="onReset()">Сбросить</button>
```

### app.module.ts

```typescript
// src/app/app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CounterComponent } from './components/counter/counter.component';

// Store
import { StoreModule } from '@ngrx/store';
import { counterReducer } from './store/reducers';
import { AppEffects } from './store/effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  declarations: [
    AppComponent,
    CounterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({ counter: counterReducer }),
    EffectsModule.forRoot([AppEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }), // Опционально
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### app.component.ts

```typescript
// src/app/app.component.ts

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

}
```

### app.component.html

```html
<!-- src/app/app.component.html -->

<app-counter></app-counter>
```

## Последовательность Действий при Клике на Кнопку с Использованием Эффектов

Теперь, когда мы добавили эффекты, давайте подробно разберём, что происходит при клике на кнопку **"Увеличить"**.

### Предположения

1. Пользователь кликает на кнопку **"Увеличить"**.
2. В приложении настроены **NgRx Store** и **Effects**.
3. Используется эффект `IncrementEffect`, который обрабатывает действие `increment`.

### Шаг за Шагом

#### Шаг 1: Клик Пользователя на Кнопку

- **Действие пользователя:** Пользователь нажимает на кнопку **"Увеличить"** в шаблоне `counter.component.html`.

  ```html
  <button (click)="onIncrement()">Увеличить</button>
  ```

#### Шаг 2: Вызов Метода `onIncrement` в Компоненте

- **Метод компонента:** Нажатие кнопки вызывает метод `onIncrement` в классе `CounterComponent`.

  ```typescript
  onIncrement() {
    this.store.dispatch(increment());
  }
  ```

#### Шаг 3: Диспетчеризация (Dispatch) Действия `increment`

- **Действие NgRx:** Метод `onIncrement` вызывает `this.store.dispatch(increment())`, что отправляет действие `increment` в **Store**.

  ```typescript
  export const increment = createAction('[Counter] Increment');
  ```

#### Шаг 4: Store Принимает Действие и Отправляет Его Редьюсерам

- **Store:** NgRx **Store** получает действие `increment` и передаёт его всем зарегистрированным редьюсерам для обработки. Однако, в нашем редьюсере `counterReducer` действие `increment` не обрабатывается напрямую, поэтому редьюсер не изменяет состояние.

#### Шаг 5: Эффект `IncrementEffect` Обрабатывает Действие `increment`

- **Effects:** Эффект `IncrementEffect` настроен на прослушивание действия `increment`. Когда действие `increment` поступает в **Store**, эффект активируется.

  ```typescript
  increment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(increment), // Слушаем действие increment
      delay(1000),       // Симулируем асинхронную операцию с задержкой 1 секунда
      map(() => incrementSuccess()) // После задержки отправляем действие incrementSuccess
    )
  );
  ```

- **Что происходит в эффекте:**
  1. **ofType(increment):** Эффект фильтрует действия и реагирует только на действие `increment`.
  2. **delay(1000):** Эффект ждёт 1 секунду, симулируя асинхронную операцию (например, запрос к серверу).
  3. **map(() => incrementSuccess()):** После задержки эффект отправляет новое действие `incrementSuccess`.

#### Шаг 6: Диспетчеризация Действия `incrementSuccess`

- **Эффект:** После выполнения задержки, эффект отправляет действие `incrementSuccess` в **Store**.

  ```typescript
  export const incrementSuccess = createAction('[Counter] Increment Success');
  ```

#### Шаг 7: Store Принимает Действие `incrementSuccess` и Отправляет Его Редьюсерам

- **Store:** NgRx **Store** получает действие `incrementSuccess` и передаёт его всем зарегистрированным редьюсерам.

#### Шаг 8: Редьюсер Обрабатывает Действие `incrementSuccess` и Обновляет Состояние

- **Редьюсер:** В нашем редьюсере `counterReducer` действие `incrementSuccess` обрабатывается и обновляет состояние, увеличивая значение `counter` на 1.

  ```typescript
  on(incrementSuccess, (state) => ({
    ...state,
    counter: state.counter + 1, // Увеличиваем счетчик на 1 после успешного эффекта
  })),
  ```

#### Шаг 9: Обновление Состояния в Store

- **Store:** После обработки действия редьюсером, **Store** обновляет своё состояние с новым значением `counter`.

#### Шаг 10: Селекторы Отслеживают Изменения Состояния

- **Селектор:** Компонент `CounterComponent` использует селектор `selectCounter` для получения текущего значения `counter`.

  ```typescript
  this.counter$ = this.store.select(selectCounter);
  ```

#### Шаг 11: Observable `counter$` Эмитирует Новое Значение

- **Observable:** После обновления состояния **Store**, селектор `selectCounter` эмитирует новое значение `counter`, которое передаётся в `counter$`.

  ```typescript
  this.counter$ = this.store.select(selectCounter);
  ```

#### Шаг 12: Обновление Представления (UI) Через Пайп `async`

- **Шаблон компонента:** В шаблоне `counter.component.html` используется пайп `async` для автоматической подписки на `counter$` и отображения его текущего значения.

  ```html
  <h1>Счетчик: {{ counter$ | async }}</h1>
  ```

- **UI Обновление:** Поскольку `counter$` эмитирует новое значение, Angular автоматически обновляет отображаемое значение счетчика на экране.

#### Шаг 13: Завершение Цикла

- **Завершение цикла:** Цикл завершается, и пользователь видит обновлённое значение счётчика через 1 секунду после нажатия кнопки **"Увеличить"**.

## Полная Цепочка Событий с Эффектами

Для наглядности, приведём полный цикл событий при клике на кнопку **"Увеличить"** с использованием эффектов:

1. **Пользователь** кликает на кнопку **"Увеличить"**.
2. **Метод** `onIncrement` вызывается в `CounterComponent`.
3. **Действие** `increment` диспетчеризуется через **Store**.
4. **Store** отправляет действие `increment` редьюсерам.
5. **Редьюсер** не обрабатывает действие `increment`, поэтому состояние остаётся без изменений.
6. **Эффект** `IncrementEffect` реагирует на действие `increment`.
7. **Эффект** выполняет асинхронную операцию (задержка 1 секунда).
8. **Эффект** диспетчеризует действие `incrementSuccess`.
9. **Store** отправляет действие `incrementSuccess` редьюсерам.
10. **Редьюсер** обрабатывает действие `incrementSuccess` и увеличивает значение `counter` на 1.
11. **Store** обновляет своё состояние с новым значением `counter`.
12. **Селектор** `selectCounter` отслеживает изменения состояния и эмитирует новое значение.
13. **Observable** `counter$` в `CounterComponent` получает новое значение.
14. **Шаблон** компонента обновляет отображение счётчика с новым значением через пайп `async`.
15. **Пользователь** видит обновлённое значение счётчика через 1 секунду после нажатия кнопки.

## Визуальное Представление Цепочки Событий

```
Пользователь кликает на кнопку "Увеличить"
            ↓
    Метод onIncrement() вызывается
            ↓
    Действие increment диспетчеризуется через Store
            ↓
    Store отправляет действие редьюсерам
            ↓
    Редьюсер не обрабатывает действие increment
            ↓
    Эффект IncrementEffect реагирует на действие increment
            ↓
    Эффект выполняет асинхронную операцию (задержка 1 секунда)
            ↓
    Эффект диспетчеризует действие incrementSuccess
            ↓
    Store отправляет действие incrementSuccess редьюсерам
            ↓
    Редьюсер обрабатывает действие incrementSuccess и обновляет состояние
            ↓
    Store обновляет своё состояние с новым значением counter
            ↓
    Селектор selectCounter отслеживает изменения состояния
            ↓
    Observable counter$ эмитирует новое значение
            ↓
    Шаблон компонента обновляет отображение счетчика
            ↓
    Пользователь видит обновлённое значение счетчика
```

## Аналогичный Процесс для Других Кнопок

### Кнопка "Уменьшить" и "Сбросить"

Процесс для кнопок **"Уменьшить"** и **"Сбросить"** аналогичен, за исключением того, что они не задействуют эффекты (в текущей реализации). Они напрямую обрабатываются редьюсерами:

1. **Пользователь** кликает на кнопку **"Уменьшить"** или **"Сбросить"**.
2. **Метод** `onDecrement` или `onReset` вызывается в `CounterComponent`.
3. **Действие** `decrement` или `reset` диспетчеризуется через **Store**.
4. **Store** отправляет действие редьюсерам.
5. **Редьюсер** обрабатывает действие и обновляет состояние (уменьшает или сбрасывает счетчик).
6. **Store** обновляет своё состояние.
7. **Селектор** `selectCounter` отслеживает изменения состояния и эмитирует новое значение.
8. **Observable** `counter$` в `CounterComponent` получает новое значение.
9. **Шаблон** компонента обновляет отображение счётчика с новым значением через пайп `async`.
10. **Пользователь** видит обновлённое значение счётчика.

### Расширение с Эффектами для Других Действий

Если вы захотите добавить эффекты для других действий (например, асинхронное уменьшение или сброс), процесс будет аналогичным:

1. **Создайте новые действия**, например, `decrementSuccess` и `resetSuccess`.
2. **Добавьте соответствующие эффекты**, которые будут обрабатывать `decrement` и `reset`, выполнять асинхронные операции и отправлять `decrementSuccess` и `resetSuccess`.
3. **Обновите редьюсеры** для обработки новых действий и обновления состояния.

## Пример Дополнения: Асинхронное Уменьшение Счетчика

### Добавление Новых Действий

```typescript
// src/app/store/actions.ts

import { createAction } from '@ngrx/store';

/**
 * Действие для инициации уменьшения счетчика.
 */
export const decrement = createAction('[Counter] Decrement');

/**
 * Действие, отправляемое после успешного уменьшения счетчика.
 */
export const decrementSuccess = createAction('[Counter] Decrement Success');
```

### Создание Эффекта для Уменьшения

```typescript
// src/app/store/effects.ts

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { increment, incrementSuccess, decrement, decrementSuccess } from './actions';
import { map, delay } from 'rxjs/operators';

@Injectable()
export class AppEffects {
  
  /**
   * Эффект для обработки действия increment.
   */
  increment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(increment),
      delay(1000),
      map(() => incrementSuccess())
    )
  );

  /**
   * Эффект для обработки действия decrement.
   */
  decrement$ = createEffect(() =>
    this.actions$.pipe(
      ofType(decrement),
      delay(1000),
      map(() => decrementSuccess())
    )
  );

  constructor(private actions$: Actions) {}
}
```

### Обновление Редьюсера

```typescript
// src/app/store/reducers.ts

import { Action, createReducer, on } from '@ngrx/store';
import { incrementSuccess, decrementSuccess, reset } from './actions';
import { AppState, initialState } from './state';

/**
 * Создаем редьюсер для управления состоянием счетчика.
 */
const _counterReducer = createReducer(
  initialState,
  on(incrementSuccess, (state) => ({
    ...state,
    counter: state.counter + 1,
  })),
  on(decrementSuccess, (state) => ({
    ...state,
    counter: state.counter - 1,
  })),
  on(reset, (state) => ({
    ...state,
    counter: 0,
  }))
);

/**
 * Экспортируем редьюсер для использования в StoreModule.
 */
export function counterReducer(state: AppState | undefined, action: Action) {
  return _counterReducer(state, action);
}
```

### Обновление Компонента

```typescript
// src/app/components/counter/counter.component.ts

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { increment, decrement, reset } from '../../store/actions';
import { selectCounter } from '../../store/selectors';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
})
export class CounterComponent {
  counter$: Observable<number>;

  constructor(private store: Store) {
    this.counter$ = this.store.select(selectCounter);
  }

  onIncrement() {
    this.store.dispatch(increment());
  }

  onDecrement() {
    this.store.dispatch(decrement());
  }

  onReset() {
    this.store.dispatch(reset());
  }
}
```

### Обновление Редьюсера

В редьюсере теперь обрабатываются как `incrementSuccess`, так и `decrementSuccess`.

## Итоговая Последовательность Действий с Использованием Эффектов

1. **Пользователь** кликает на кнопку **"Увеличить"** или **"Уменьшить"**.
2. **Метод** `onIncrement` или `onDecrement` вызывается в `CounterComponent`.
3. **Действие** `increment` или `decrement` диспетчеризуется через **Store**.
4. **Store** отправляет действие в редьюсеры, которые не обрабатывают `increment` или `decrement` напрямую.
5. **Эффект** `IncrementEffect` или `DecrementEffect` реагирует на действие `increment` или `decrement`.
6. **Эффект** выполняет асинхронную операцию (задержка 1 секунда).
7. **Эффект** диспетчеризует действие `incrementSuccess` или `decrementSuccess`.
8. **Store** отправляет действие `incrementSuccess` или `decrementSuccess` редьюсерам.
9. **Редьюсер** обрабатывает действие `incrementSuccess` или `decrementSuccess` и обновляет состояние (увеличивает или уменьшает счетчик).
10. **Store** обновляет своё состояние с новым значением `counter`.
11. **Селектор** `selectCounter` отслеживает изменения состояния и эмитирует новое значение.
12. **Observable** `counter$` в `CounterComponent` получает новое значение.
13. **Шаблон** компонента обновляет отображение счётчика с новым значением через пайп `async`.
14. **Пользователь** видит обновлённое значение счётчика через 1 секунду после нажатия кнопки.

## Заключение

Использование **NgRx Effects** позволяет обрабатывать асинхронные операции и побочные эффекты отдельно от компонентов и редьюсеров, что делает код более организованным и удобным для поддержки. В нашем примере эффекты используются для симуляции асинхронного увеличения и уменьшения счётчика, что демонстрирует, как можно интегрировать эффекты в ваш процесс управления состоянием.

### Дополнительные Рекомендации

1. **Обработка Ошибок:** В реальных приложениях эффекты часто взаимодействуют с внешними API, поэтому важно обрабатывать ошибки. Это можно сделать, добавив действия для ошибок и соответствующие обработчики в редьюсеры.

2. **Типизация:** Для улучшения типизации и предотвращения ошибок рекомендуется использовать интерфейсы и типы для действий и состояния.

3. **Организация Файлов:** При увеличении сложности приложения рекомендуется разделять действия, эффекты, редьюсеры и селекторы по отдельным файлам или даже модулям.

4. **Тестирование:** Используйте тестирование для проверки логики эффектов и редьюсеров, что поможет поддерживать качество кода при масштабировании приложения.