# Быстрый старт: Массовая загрузка вопросов

## Для загрузки 120+ вопросов выполните следующие шаги:

### 1. Создайте Excel шаблон
```bash
python create_excel_template.py 120
```
Это создаст файл `questions_template_120_rows.xlsx` с пустыми строками.

### 2. Заполните Excel файл
Откройте созданный файл в Excel и заполните:
- **category**: категория (например, "Биология", "Химия")
- **text**: текст вопроса
- **options**: варианты ответов через точку с запятой (;)
- **correct_answer**: правильный ответ
- **image_url**: URL изображения (необязательно)
- **table_data**: данные таблицы (необязательно)

### 3. Конвертируйте в CSV
```bash
python excel_to_csv_converter.py questions_template_120_rows.xlsx my_questions.csv
```

### 4. Загрузите в базу данных
```bash
python bulk_upload_questions.py my_questions.csv "Название вашего теста"
```

## Альтернативные способы:

### JSON формат (для программистов)
```bash
# Создать пример
python bulk_upload_json.py --create-sample

# Загрузить
python bulk_upload_json.py questions.json "Название теста"
```

### Прямой CSV
```bash
# Создать пример
python bulk_upload_questions.py --create-sample

# Загрузить
python bulk_upload_questions.py questions.csv "Название теста"
```

## Структура данных:

| Поле | Описание | Пример |
|------|----------|--------|
| category | Категория вопроса | "Биология" |
| text | Текст вопроса | "Какая органелла отвечает за синтез белка?" |
| options | Варианты ответов | "Рибосома; Митохондрия; Ядро; Лизосома" |
| correct_answer | Правильный ответ | "Рибосома" |
| image_url | URL изображения | "http://example.com/image.jpg" |
| table_data | Данные таблицы | "" |

## Полезные команды:

```bash
# Создать шаблон на 150 вопросов
python create_excel_template.py 150

# Конвертировать Excel в CSV
python excel_to_csv_converter.py input.xlsx output.csv

# Загрузить вопросы
python bulk_upload_questions.py questions.csv "Тест по биологии"

# Создать примеры файлов
python bulk_upload_questions.py --create-sample
python bulk_upload_json.py --create-sample
python excel_to_csv_converter.py --create-sample
```

## Советы:
- Начните с нескольких вопросов для проверки формата
- Разделите большие файлы на части по 20-30 вопросов
- Проверьте правильность данных перед загрузкой
- Используйте Excel для удобного редактирования 