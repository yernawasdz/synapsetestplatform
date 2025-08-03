# SynapseKZ: Exam Platform

Платформа для проведения экзаменов с поддержкой русского языка.

## Быстрый запуск с Docker

### 1. Сборка и запуск
```bash
# Собрать и запустить
docker-compose up --build

# Или только собрать образ
docker build -t synapsekz-exam .
docker run -p 8000:8000 synapsekz-exam
```

### 2. Доступ к приложению
- URL: http://localhost:8000
- Демо доступ: admin / admin123

## Ручной деплой

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

## Функции

### Для учителей:
- Создание и управление экзаменами
- Добавление вопросов и текстовых блоков
- Экспорт результатов в CSV
- Управление студентами

### Для студентов:
- Прохождение экзаменов
- Просмотр результатов
- Детальная статистика

## Технологии
- Backend: FastAPI, SQLAlchemy, SQLite
- Frontend: React, Axios
- Язык: Python, JavaScript
- Интерфейс: Русский 