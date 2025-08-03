#!/usr/bin/env python3
"""
Скрипт для просмотра информации о тестах
Использование: python list_tests.py [test_id]
"""

import sys
from sqlalchemy.orm import Session
from database import engine
from models.test import Test
from models.question import Question
from models.category import Category

def list_all_tests():
    """Показывает список всех тестов"""
    with Session(engine) as db:
        tests = db.query(Test).all()
        
        if not tests:
            print("В базе данных нет тестов.")
            return
        
        print("\n" + "="*60)
        print("📋 СПИСОК ВСЕХ ТЕСТОВ")
        print("="*60)
        
        for test in tests:
            questions_count = db.query(Question).filter(Question.test_id == test.id).count()
            
            print(f"\n🆔 ID: {test.id}")
            print(f"📝 Название: {test.title}")
            print(f"📊 Вопросов: {questions_count}")
            
            if test.description:
                print(f"📄 Описание: {test.description}")
            
            print(f"📅 Создан: {test.created_at}")
            print(f"👤 Создатель ID: {test.created_by}")
            
            # Показываем категории вопросов
            if questions_count > 0:
                categories = db.query(Category).join(Question).filter(Question.test_id == test.id).distinct().all()
                if categories:
                    print(f"🏷️  Категории: {', '.join([cat.name for cat in categories])}")
            
            print("-" * 40)

def show_test_details(test_id: int):
    """Показывает детальную информацию о конкретном тесте"""
    with Session(engine) as db:
        test = db.query(Test).filter(Test.id == test_id).first()
        
        if not test:
            print(f"❌ Тест с ID {test_id} не найден!")
            return
        
        questions = db.query(Question).filter(Question.test_id == test_id).all()
        
        print("\n" + "="*60)
        print(f"📋 ДЕТАЛЬНАЯ ИНФОРМАЦИЯ О ТЕСТЕ")
        print("="*60)
        
        print(f"\n🆔 ID: {test.id}")
        print(f"📝 Название: {test.title}")
        print(f"📄 Описание: {test.description or 'Нет описания'}")
        print(f"📊 Всего вопросов: {len(questions)}")
        print(f"📅 Создан: {test.created_at}")
        print(f"👤 Создатель ID: {test.created_by}")
        
        if questions:
            print(f"\n📝 ВОПРОСЫ:")
            print("-" * 40)
            
            for i, question in enumerate(questions, 1):
                category = db.query(Category).filter(Category.id == question.category_id).first()
                print(f"\n{i}. {question.text}")
                print(f"   🏷️  Категория: {category.name if category else 'Неизвестно'}")
                print(f"   ✅ Правильный ответ: {question.correct_answer}")
                print(f"   📋 Варианты: {', '.join(question.options)}")
                
                if question.image_url:
                    print(f"   🖼️  Изображение: {question.image_url}")
                
                if question.table_data:
                    print(f"   📊 Таблица: есть данные")
        else:
            print(f"\n❌ В тесте нет вопросов.")

def show_test_statistics():
    """Показывает статистику по всем тестам"""
    with Session(engine) as db:
        tests = db.query(Test).all()
        
        if not tests:
            print("В базе данных нет тестов.")
            return
        
        total_questions = db.query(Question).count()
        total_categories = db.query(Category).count()
        
        print("\n" + "="*60)
        print("📊 СТАТИСТИКА ПЛАТФОРМЫ")
        print("="*60)
        
        print(f"\n📋 Всего тестов: {len(tests)}")
        print(f"❓ Всего вопросов: {total_questions}")
        print(f"🏷️  Всего категорий: {total_categories}")
        
        # Статистика по категориям
        print(f"\n📈 СТАТИСТИКА ПО КАТЕГОРИЯМ:")
        categories = db.query(Category).all()
        for category in categories:
            questions_count = db.query(Question).filter(Question.category_id == category.id).count()
            if questions_count > 0:
                print(f"   {category.name}: {questions_count} вопросов")
        
        # Самый большой тест
        largest_test = None
        max_questions = 0
        for test in tests:
            questions_count = db.query(Question).filter(Question.test_id == test.id).count()
            if questions_count > max_questions:
                max_questions = questions_count
                largest_test = test
        
        if largest_test:
            print(f"\n🏆 Самый большой тест: {largest_test.title} ({max_questions} вопросов)")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            test_id = int(sys.argv[1])
            show_test_details(test_id)
        except ValueError:
            print("❌ Неверный ID теста!")
            sys.exit(1)
    else:
        list_all_tests()
        show_test_statistics() 