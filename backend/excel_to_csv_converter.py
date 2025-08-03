#!/usr/bin/env python3
"""
Конвертер Excel файлов в CSV для подготовки вопросов
Использование: python excel_to_csv_converter.py input.xlsx output.csv
"""

import pandas as pd
import sys
import os

def convert_excel_to_csv(excel_file: str, csv_file: str):
    """
    Конвертирует Excel файл в CSV для загрузки вопросов
    
    Ожидаемые колонки в Excel:
    - category: категория вопроса
    - text: текст вопроса
    - options: варианты ответов (через точку с запятой ;)
    - correct_answer: правильный ответ
    - image_url: URL изображения (опционально)
    - table_data: данные таблицы (опционально)
    """
    
    try:
        # Читаем Excel файл
        df = pd.read_excel(excel_file)
        
        # Проверяем обязательные колонки
        required_columns = ['category', 'text', 'options', 'correct_answer']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            print(f"Ошибка: Отсутствуют обязательные колонки: {missing_columns}")
            print(f"Доступные колонки: {list(df.columns)}")
            return False
        
        # Обрабатываем колонку options - конвертируем в JSON формат
        if 'options' in df.columns:
            df['options'] = df['options'].apply(lambda x: 
                str(x).split(';') if pd.notna(x) else []
            )
            df['options'] = df['options'].apply(lambda x: 
                [opt.strip() for opt in x] if isinstance(x, list) else []
            )
            df['options'] = df['options'].apply(lambda x: 
                str(x).replace("'", '"') if x else '[]'
            )
        
        # Заполняем пустые значения
        df['image_url'] = df.get('image_url', '').fillna('')
        df['table_data'] = df.get('table_data', '').fillna('')
        
        # Сохраняем в CSV
        df.to_csv(csv_file, index=False, encoding='utf-8')
        
        print(f"Успешно конвертирован файл: {excel_file} -> {csv_file}")
        print(f"Обработано строк: {len(df)}")
        
        # Показываем первые несколько строк для проверки
        print("\nПервые 3 строки результата:")
        print(df.head(3).to_string())
        
        return True
        
    except Exception as e:
        print(f"Ошибка при конвертации: {e}")
        return False

def create_sample_excel():
    """Создает пример Excel файла"""
    sample_data = {
        'category': ['Биология', 'Химия', 'Физика'],
        'text': [
            'Какая органелла отвечает за синтез белка?',
            'Какой элемент имеет атомный номер 1?',
            'Какая формула описывает закон Ома?'
        ],
        'options': [
            'Рибосома; Митохондрия; Ядро; Лизосома',
            'Гелий; Водород; Литий; Бериллий',
            'U = IR; P = UI; F = ma; E = mc²'
        ],
        'correct_answer': ['Рибосома', 'Водород', 'U = IR'],
        'image_url': ['', '', ''],
        'table_data': ['', '', '']
    }
    
    df = pd.DataFrame(sample_data)
    df.to_excel('sample_questions.xlsx', index=False)
    print("Создан пример Excel файла: sample_questions.xlsx")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python excel_to_csv_converter.py <excel_file> [csv_file]")
        print("\nДля создания примера Excel файла запустите:")
        print("python excel_to_csv_converter.py --create-sample")
        sys.exit(1)
    
    if sys.argv[1] == "--create-sample":
        create_sample_excel()
        sys.exit(0)
    
    excel_file = sys.argv[1]
    csv_file = sys.argv[2] if len(sys.argv) > 2 else excel_file.replace('.xlsx', '.csv')
    
    if not os.path.exists(excel_file):
        print(f"Файл {excel_file} не найден!")
        sys.exit(1)
    
    convert_excel_to_csv(excel_file, csv_file) 