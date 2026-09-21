# 📦 ПАКЕТ АКТИВАЦИИ - БРИГАДИР #1 (FRONTEND)

**От**: Координатор Stefan Engel  
**Кому**: Бригадир #1 (Frontend Team Lead)  
**Время**: 2026-09-21 08:00  
**Ветка**: feature/frontend-ui  
**Задача**: 55 минут, 5 блоков, React разработка

---

## 🎯 ВАШ КЛАСТЕР

Вы отвечаете за Frontend разработку. Под вашим управлением три агента:

- **Агент #2A**: React компоненты (Components)
- **Агент #2B**: Тестирование (Testing)
- **Агент #2C**: Интеграция (Integration)

---

## 📋 ВАШ ПОЛНЫЙ ПЛАН НА ДЕНЬ

### Блок 1 (0-10 минут): Инициализация
```bash
git checkout feature/frontend-ui
git pull origin feature/frontend-ui
npm install
npm --version  # должен быть 9+
node --version # должен быть 18+
```
**Ответственный**: Агент #2A  
**Валидация**: npm --version >= 9, node --version >= 18

### Блок 2 (10-25 минут): React компоненты
```
Создайте эти файлы:
✓ frontend/src/components/App.jsx (state management)
✓ frontend/src/components/TaskList.jsx (list display)
✓ frontend/src/components/TaskForm.jsx (form validation)
✓ frontend/src/components/TaskItem.jsx (task card)
✓ frontend/src/components/LoadingSpinner.jsx (loading UI)
✓ frontend/src/api.js (API service layer)
```
**Ответственный**: Агент #2A  
**Требования**: 
- Используйте правильный API контракт: `{ success, data, error, count }`
- PropTypes валидация для каждого компонента
- State management в App.jsx для tasks, loading, error, selectedTask

### Блок 3 (25-45 минут): Тесты (>80% coverage)
```
Напишите тесты:
✓ frontend/tests/api.test.js (8+ tests)
  - Test GET /api/tasks
  - Test POST /api/tasks
  - Test PUT /api/tasks/:id
  - Test DELETE /api/tasks/:id
  - Test error handling
  
✓ frontend/tests/App.test.js (6+ tests)
  - Test component rendering
  - Test state changes
  - Test API calls
```
**Ответственный**: Агент #2B  
**Валидация**: 14+ тестов, >80% coverage

### Блок 4 (45-50 минут): Запуск тестов
```bash
npm test -- --coverage
# Все тесты должны ПРОЙТИ
# Coverage должно быть >80%
```
**Ответственный**: Агент #2B  
**Валидация**: All tests pass, Coverage >80%

### Блок 5 (50-55 минут): Коммит и Push
```bash
git add frontend/ tests/
git commit -m "✨ feat: Implement React frontend with components and tests"
git push origin feature/frontend-ui
```
**Ответственный**: Агент #2C  
**Валидация**: git push успешен, коммит на feature/frontend-ui

---

## 📞 ВАША РОЛЬ КАК БРИГАДИРА

### Каждый час (09:00, 10:00, 11:00, 12:00):
```
Быстрая синхронизация со своими агентами:
1. Какой блок сейчас делаете?
2. Какой процент завершено?
3. Есть ли проблемы?
4. Нужна ли моя помощь?
```

### Каждые 2 часа (10:00, 12:00, 14:00):
```
Детальная проверка:
1. git log feature/frontend-ui -1 --oneline
   (есть ли новые коммиты?)
2. npm test запущен?
   (тесты проходят? нет ошибок?)
3. Синтаксис OK?
   (npm run lint?)
```

### 17:00 - Ежедневный отчет:
```
Координатору:

"Привет! Вот статус Frontend кластера:

БЛОКИ:
✅ Блок 1: Готов! (10 мин)
✅ Блок 2: Готов! (15 мин)
✅ Блок 3: Готов! (20 мин)
✅ Блок 4: Готов! (5 мин)
✅ Блок 5: Готов! (5 мин)

МЕТРИКИ:
- Coverage: 82% (target 80%) ✓
- Tests: 16/16 готовы ✓
- Commits: 5 новых коммитов ✓

БЛОКИРОВКИ: НЕТ ✓

ETA ЗАВЕРШЕНИЯ: ГОТОВ!

Нужна ли моя помощь? НЕТ, ВСЕ ГЛАДКО!"
```

---

## 🆘 ЕСЛИ ПРОБЛЕМЫ

**Вы НЕ пишете код!** Ваша роль:

```
1. Поговорите с агентом - в чем проблема?
2. Помогите диагностировать - что именно не работает?
3. Если сами не знаете → НЕМЕДЛЕННО координатору
4. Координатор поможет (но тоже не напишет код!)

ПРИМЕРЫ ПРАВИЛЬНОЙ ПОМОЩИ:

Агент: "npm test падает!"
Вы: "Давай посмотрим на ошибку:
     - Какая точная ошибка?
     - На какой файл указывает?
     - Посмотрел ли код в том месте?
     Попробуй, я помогу если нужно"

Агент: "Не знаю как написать тест для API"
Вы: "Окей, API должен:
     - Возвращать { success, data, error }
     - GET /api/tasks возвращает массив
     - POST должен создавать новую задачу
     Посмотри примеры в AGENT_SPECIFICATIONS.md
     и попробуй написать. Я проверю!"
```

---

## 📊 УСПЕХ = ВСЕ БЛОКИ ЗАВЕРШЕНЫ

```
✅ Блок 1: npm install работает
✅ Блок 2: 5 компонентов созданы
✅ Блок 3: 14+ тестов написано
✅ Блок 4: npm test --coverage >80%
✅ Блок 5: git push выполнен

ВРЕМЯ: 55 минут (на расписании!)
КАЧЕСТВО: Coverage >80%, все тесты проходят
ГОТОВНОСТЬ: К MERGE на main
```

---

## 🎯 ФИНАЛЬНАЯ КОНТРОЛЬНАЯ ТОЧКА

Перед 17:00 отчетом проверьте:

```
☑️ npm test прошел? (0 failures)
☑️ Coverage >80%? (npm test --coverage)
☑️ Синтаксис чист? (npm run lint)
☑️ git push выполнен? (git log -1)
☑️ Нет merge conflicts?
☑️ Коммиты регулярные (каждые 10-15 мин)?

ЕСЛИ ВСЕ ☑️: Отправьте мне 17:00 отчет!
ЕСЛИ ДА ❌: Исправьте и дайте координатору знать!
```

---

**Начинайте сейчас! Первый блок - это инициализация (npm install).**

Удачи! 🚀

---

_Пакет активации Бригадира #1_  
_Координатор Stefan Engel_  
_2026-09-21 08:00_
