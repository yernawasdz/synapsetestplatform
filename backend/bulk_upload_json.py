#!/usr/bin/env python3
"""
Скрипт для массовой загрузки вопросов из JSON файла
Использование:
1. Создайте JSON файл с вопросами (пример: questions.json)
2. Запустите: python bulk_upload_json.py questions.json
"""

import json
import sys
import os
from sqlalchemy.orm import Session
from database import engine, Base
from models.question import Question
from models.category import Category
from models.test import Test

def create_tables():
    """Создает таблицы в базе данных"""
    Base.metadata.create_all(bind=engine)

def get_or_create_category(db: Session, category_name: str) -> Category:
    """Получает или создает категорию"""
    category = db.query(Category).filter(Category.name == category_name).first()
    if not category:
        category = Category(name=category_name)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category

def get_or_create_test(db: Session, test_title: str, teacher_id: int) -> Test:
    """Получает или создает тест"""
    test = db.query(Test).filter(Test.title == test_title).first()
    if not test:
        test = Test(title=test_title, created_by=teacher_id)
        db.add(test)
        db.commit()
        db.refresh(test)
    return test

def upload_questions_from_json(json_file_path: str, test_title: str, teacher_id: int = 1):
    """
    Загружает вопросы из JSON файла
    
    Формат JSON:
    {
        "test_title": "Название теста",
        "questions": [
            {
                "category": "Биология",
                "text": "Вопрос 1",
                "options": ["A", "B", "C", "D", "E"],
                "correct_answer": "A",
                "image_url": "",
                "table_data": null
            }
        ]
    }
    """
    
    create_tables()
    
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    with Session(engine) as db:
        # Получаем или создаем тест
        test = get_or_create_test(db, test_title, teacher_id)
        
        for i, question_data in enumerate(data['questions'], 1):
            try:
                # Получаем или создаем категорию
                category = get_or_create_category(db, question_data['category'])
                
                # Создаем вопрос
                question = Question(
                    test_id=test.id,
                    category_id=category.id,
                    text=question_data['text'],
                    options=question_data['options'],
                    correct_answer=question_data['correct_answer'],
                    image_url=question_data.get('image_url'),
                    table_data=question_data.get('table_data')
                )
                
                db.add(question)
                print(f"Добавлен вопрос {i}: {question_data['text'][:50]}...")
                
            except Exception as e:
                print(f"Ошибка в вопросе {i}: {e}")
                continue
        
        db.commit()
        print(f"\nЗагрузка завершена! Добавлено {len(data['questions'])} вопросов в тест '{test_title}'")

def create_sample_json():
    """Создает пример JSON файла"""
    sample_data = {
        "test_title": "Пример теста",
        "questions": [
            {
                "category": "Биология",
                "text": "Какая органелла отвечает за синтез белка?",
                "options": ["Рибосома", "Митохондрия", "Ядро", "Лизосома", "Эндоплазматическая сеть"],
                "correct_answer": "Рибосома",
                "image_url": "",
                "table_data": None
            },
            {
                "category": "Химия",
                "text": "Какой элемент имеет атомный номер 1?",
                "options": ["Гелий", "Водород", "Литий", "Бериллий", "Бор"],
                "correct_answer": "Водород",
                "image_url": "",
                "table_data": None
            },
            {
                "category": "Физика",
                "text": "Какая формула описывает закон Ома?",
                "options": ["U = IR", "P = UI", "F = ma", "E = mc²", "F = kx"],
                "correct_answer": "U = IR",
                "image_url": "",
                "table_data": None
            }
        ]
    }
    
    with open('sample_questions.json', 'w', encoding='utf-8') as file:
        json.dump(sample_data, file, ensure_ascii=False, indent=2)
    
    print("Создан пример файла: sample_questions.json")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python bulk_upload_json.py <json_file> [test_title] [teacher_id]")
        print("\nДля создания примера JSON файла запустите:")
        print("python bulk_upload_json.py --create-sample")
        sys.exit(1)
    
    if sys.argv[1] == "--create-sample":
        create_sample_json()
        sys.exit(0)
    
    json_file = sys.argv[1]
    test_title = sys.argv[2] if len(sys.argv) > 2 else "Массовый тест"
    teacher_id = int(sys.argv[3]) if len(sys.argv) > 3 else 1
    
    if not os.path.exists(json_file):
        print(f"Файл {json_file} не найден!")
        sys.exit(1)
    
    upload_questions_from_json(json_file, test_title, teacher_id) 