# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем Node.js для сборки фронтенда
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY backend/requirements.txt .
COPY frontend/package*.json ./frontend/

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Устанавливаем Node.js зависимости
WORKDIR /app/frontend
RUN npm install

# Копируем весь код
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Собираем фронтенд
WORKDIR /app/frontend
RUN npm run build

# Переходим в backend директорию
WORKDIR /app/backend

# Создаем папку для загрузок
RUN mkdir -p uploads

# Открываем порт
EXPOSE 8000

# Команда запуска
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 