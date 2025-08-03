#!/usr/bin/env python3
"""
Создает Excel шаблон для подготовки большого количества вопросов
Использование: python create_excel_template.py [количество_строк]
"""

import pandas as pd
import sys

def create_excel_template(num_rows=120):
    """
    Создает Excel шаблон с указанным количеством пустых строк
    
    Args:
        num_rows (int): Количество пустых строк для вопросов
    """
    
    # Создаем пустые данные
    empty_data = {
        'category': [''] * num_rows,
        'text': [''] * num_rows,
        'options': [''] * num_rows,
        'correct_answer': [''] * num_rows,
        'image_url': [''] * num_rows,
        'table_data': [''] * num_rows
    }
    
    # Создаем DataFrame
    df = pd.DataFrame(empty_data)
    
    # Добавляем пример в первую строку
    df.iloc[0] = {
        'category': 'Биология',
        'text': 'Какая органелла отвечает за синтез белка?',
        'options': 'Рибосома; Митохондрия; Ядро; Лизосома; Эндоплазматическая сеть',
        'correct_answer': 'Рибосома',
        'image_url': '',
        'table_data': ''
    }
    
    # Сохраняем в Excel
    filename = f'questions_template_{num_rows}_rows.xlsx'
    df.to_excel(filename, index=False)
    
    print(f"Создан Excel шаблон: {filename}")
    print(f"Количество строк: {num_rows}")
    print("\nСтруктура файла:")
    print("- category: категория вопроса (например, 'Биология', 'Химия')")
    print("- text: текст вопроса")
    print("- options: варианты ответов через точку с запятой (;)")
    print("- correct_answer: правильный ответ")
    print("- image_url: URL изображения (опционально)")
    print("- table_data: данные таблицы (опционально)")
    print("\nПример заполнения:")
    print("category: Биология")
    print("text: Какая органелла отвечает за синтез белка?")
    print("options: Рибосома; Митохондрия; Ядро; Лизосома; Эндоплазматическая сеть")
    print("correct_answer: Рибосома")
    print("\nПосле заполнения конвертируйте в CSV:")
    print(f"python excel_to_csv_converter.py {filename}")

if __name__ == "__main__":
    num_rows = int(sys.argv[1]) if len(sys.argv) > 1 else 120
    
    if num_rows <= 0:
        print("Количество строк должно быть больше 0!")
        sys.exit(1)
    
    create_excel_template(num_rows) 