# Сводка инструментов для массовой загрузки вопросов

## Созданные файлы:

### 1. Основные скрипты загрузки:
- **`bulk_upload_questions.py`** - загрузка из CSV файла
- **`bulk_upload_json.py`** - загрузка из JSON файла

### 2. Вспомогательные инструменты:
- **`excel_to_csv_converter.py`** - конвертер Excel в CSV
- **`create_excel_template.py`** - создание Excel шаблона

### 3. Документация:
- **`README_BULK_UPLOAD.md`** - подробная инструкция
- **`QUICK_START.md`** - быстрый старт
- **`SUMMARY.md`** - эта сводка

### 4. Примеры файлов:
- **`sample_questions.csv`** - пример CSV
- **`sample_questions.json`** - пример JSON
- **`sample_questions.xlsx`** - пример Excel
- **`questions_template_150_rows.xlsx`** - шаблон на 150 вопросов

## Рекомендуемый процесс для 120+ вопросов:

### Шаг 1: Создание шаблона
```bash
python create_excel_template.py 120
```

### Шаг 2: Заполнение данных
Откройте `questions_template_120_rows.xlsx` в Excel и заполните:
- category: категория вопроса
- text: текст вопроса  
- options: варианты ответов через точку с запятой (;)
- correct_answer: правильный ответ
- image_url: URL изображения (опционально)
- table_data: данные таблицы (опционально)

### Шаг 3: Конвертация
```bash
python excel_to_csv_converter.py questions_template_120_rows.xlsx my_questions.csv
```

### Шаг 4: Загрузка
```bash
python bulk_upload_questions.py my_questions.csv "Название теста"
```

## Альтернативные способы:

### JSON формат:
```bash
# Создать пример
python bulk_upload_json.py --create-sample

# Загрузить
python bulk_upload_json.py questions.json "Название теста"
```

### Прямой CSV:
```bash
# Создать пример
python bulk_upload_questions.py --create-sample

# Загрузить
python bulk_upload_questions.py questions.csv "Название теста"
```

## Преимущества созданного решения:

1. **Удобство**: Excel интерфейс для редактирования
2. **Масштабируемость**: Поддержка 120+ вопросов
3. **Гибкость**: Множество форматов (CSV, JSON, Excel)
4. **Безопасность**: Проверка данных и обработка ошибок
5. **Простота**: Минимум команд для загрузки

## Структура данных:

| Поле | Обязательное | Описание |
|------|--------------|----------|
| category | Да | Категория вопроса |
| text | Да | Текст вопроса |
| options | Да | Варианты ответов |
| correct_answer | Да | Правильный ответ |
| image_url | Нет | URL изображения |
| table_data | Нет | Данные таблицы |

## Полезные команды:

```bash
# Создать шаблон на N вопросов
python create_excel_template.py 150

# Конвертировать Excel в CSV
python excel_to_csv_converter.py input.xlsx output.csv

# Загрузить вопросы
python bulk_upload_questions.py questions.csv "Тест по биологии"

# Создать примеры
python bulk_upload_questions.py --create-sample
python bulk_upload_json.py --create-sample
python excel_to_csv_converter.py --create-sample
```

## Тестирование:
Все скрипты протестированы и работают корректно. Примеры файлов созданы и готовы к использованию. 