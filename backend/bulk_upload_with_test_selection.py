#!/usr/bin/env python3
"""
Улучшенный скрипт для массовой загрузки вопросов с выбором теста
Использование: python bulk_upload_with_test_selection.py <csv_file> [test_id]
"""

import csv
import sys
import os
from sqlalchemy.orm import Session
from database import engine, Base
from models.question import Question
from models.category import Category
from models.test import Test
from models.user import User

def create_tables():
    """Создает таблицы в базе данных"""
    Base.metadata.create_all(bind=engine)

def list_existing_tests():
    """Показывает список существующих тестов"""
    with Session(engine) as db:
        tests = db.query(Test).all()
        if not tests:
            print("В базе данных нет тестов.")
            return []
        
        print("\n=== Существующие тесты ===")
        for test in tests:
            questions_count = db.query(Question).filter(Question.test_id == test.id).count()
            print(f"ID: {test.id} | Название: {test.title} | Вопросов: {questions_count}")
            if test.description:
                print(f"  Описание: {test.description}")
            print(f"  Создан: {test.created_at}")
            print()
        
        return tests

def get_or_create_category(db: Session, category_name: str) -> Category:
    """Получает или создает категорию"""
    category = db.query(Category).filter(Category.name == category_name).first()
    if not category:
        category = Category(name=category_name)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category

def get_test_by_id(test_id: int) -> Test:
    """Получает тест по ID"""
    with Session(engine) as db:
        test = db.query(Test).filter(Test.id == test_id).first()
        return test

def create_new_test(title: str, description: str = None, teacher_id: int = 1) -> Test:
    """Создает новый тест"""
    with Session(engine) as db:
        test = Test(title=title, description=description, created_by=teacher_id)
        db.add(test)
        db.commit()
        db.refresh(test)
        return test

def upload_questions_to_test(csv_file_path: str, test_id: int):
    """
    Загружает вопросы в конкретный тест
    
    Args:
        csv_file_path: путь к CSV файлу
        test_id: ID теста для загрузки
    """
    
    create_tables()
    
    # Проверяем существование теста
    test = get_test_by_id(test_id)
    if not test:
        print(f"Ошибка: Тест с ID {test_id} не найден!")
        return False
    
    print(f"Загружаем вопросы в тест: {test.title} (ID: {test.id})")
    
    with Session(engine) as db:
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            questions_added = 0
            for row_num, row in enumerate(reader, 1):
                try:
                    # Получаем или создаем категорию
                    category = get_or_create_category(db, row['category'])
                    
                    # Парсим options из строки JSON
                    import json
                    options = json.loads(row['options'].replace("'", '"'))
                    
                    # Создаем вопрос
                    question = Question(
                        test_id=test.id,
                        category_id=category.id,
                        text=row['text'],
                        options=options,
                        correct_answer=row['correct_answer'],
                        image_url=row['image_url'] if row['image_url'] else None,
                        table_data=json.loads(row['table_data']) if row['table_data'] else None
                    )
                    
                    db.add(question)
                    questions_added += 1
                    print(f"Добавлен вопрос {row_num}: {row['text'][:50]}...")
                    
                except Exception as e:
                    print(f"Ошибка в строке {row_num}: {e}")
                    continue
            
            db.commit()
            print(f"\n✅ Загрузка завершена!")
            print(f"📊 Добавлено вопросов: {questions_added}")
            print(f"📝 Тест: {test.title}")
            print(f"🆔 ID теста: {test.id}")
            
            return True

def interactive_test_selection():
    """Интерактивный выбор теста"""
    tests = list_existing_tests()
    
    if not tests:
        print("Создать новый тест? (y/n): ", end="")
        choice = input().lower()
        if choice == 'y':
            print("Введите название нового теста: ", end="")
            title = input().strip()
            print("Введите описание (необязательно): ", end="")
            description = input().strip() or None
            
            test = create_new_test(title, description)
            print(f"✅ Создан новый тест: {test.title} (ID: {test.id})")
            return test.id
        else:
            print("Операция отменена.")
            return None
    
    while True:
        print("\nВыберите действие:")
        print("1. Загрузить в существующий тест")
        print("2. Создать новый тест")
        print("3. Выход")
        
        choice = input("Введите номер (1-3): ").strip()
        
        if choice == "1":
            test_id = input("Введите ID теста: ").strip()
            try:
                test_id = int(test_id)
                test = get_test_by_id(test_id)
                if test:
                    return test_id
                else:
                    print(f"❌ Тест с ID {test_id} не найден!")
            except ValueError:
                print("❌ Неверный ID теста!")
        
        elif choice == "2":
            print("Введите название нового теста: ", end="")
            title = input().strip()
            print("Введите описание (необязательно): ", end="")
            description = input().strip() or None
            
            test = create_new_test(title, description)
            print(f"✅ Создан новый тест: {test.title} (ID: {test.id})")
            return test.id
        
        elif choice == "3":
            print("Операция отменена.")
            return None
        
        else:
            print("❌ Неверный выбор!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python bulk_upload_with_test_selection.py <csv_file> [test_id]")
        print("\nПримеры:")
        print("  python bulk_upload_with_test_selection.py questions.csv")
        print("  python bulk_upload_with_test_selection.py questions.csv 1")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    test_id = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    if not os.path.exists(csv_file):
        print(f"❌ Файл {csv_file} не найден!")
        sys.exit(1)
    
    # Если test_id не указан, предлагаем интерактивный выбор
    if test_id is None:
        test_id = interactive_test_selection()
        if test_id is None:
            sys.exit(0)
    
    # Загружаем вопросы
    success = upload_questions_to_test(csv_file, test_id)
    if success:
        print("\n🎉 Загрузка успешно завершена!")
    else:
        print("\n❌ Ошибка при загрузке!")
        sys.exit(1) 