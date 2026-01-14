import json
import random
import sys
import time


class bcolors:
    CORRECT = '\033[92m'
    INCORRECT = '\033[91m'
    NORMAL = '\033[0m'
    BLUE = '\033[94m'


def display_welcome():
    """Display welcome message and instructions."""
    print("Welcome to the quiz!")
    print(
        "You will be asked a series of multiple choice questions, "
        "and you must answer them correctly."
    )
    print(
        "Write with lowercase all the corresponding letters of the "
        "answers you think are correct."
    )
    print(
        "For the answers that are not multiple choice, write the "
        "answer you think is correct."
    )


def select_question_file():
    """Prompt user to select a question file and return the filename."""
    available_files = ["course.json", "lab.json"]
    
    while True:
        print("\nWhich question file would you like to load?")
        for idx, filename in enumerate(available_files, 1):
            print(f"{idx}) {filename}")
        
        file_choice = input("Enter your choice: ").strip().lower()
        
        # Accept number or filename
        if file_choice == "1" or file_choice == "course.json":
            return "course.json"
        elif file_choice == "2" or file_choice == "lab.json":
            return "lab.json"
        else:
            print("Invalid choice. Please try again.")


def load_questions(filename):
    """Load questions from a JSON file with error handling."""
    try:
        with open(filename, 'r', encoding='utf-8-sig') as f:
            questions = json.load(f)
        
        if not questions:
            print(f"Error: {filename} contains no questions.")
            sys.exit(1)
        
        return questions
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{filename}': {e}")
        sys.exit(1)


def get_quiz_settings(total_questions):
    """Get the number of questions and shuffle preference from user."""
    # Get number of questions
    while True:
        user_input = input(
            "\nHow many questions do you want to answer? "
            "(write 'all' for all questions): "
        ).strip().lower()
        
        if user_input == "all":
            nr_of_questions = total_questions
            break
        
        try:
            nr_of_questions = int(user_input)
            if nr_of_questions <= 0:
                print("Please enter a positive number.")
                continue
            if nr_of_questions > total_questions:
                print(f"Only {total_questions} questions available. Using all.")
                nr_of_questions = total_questions
            break
        except ValueError:
            print("Invalid input. Please enter a number or 'all'.")
    
    # Get shuffle preference
    while True:
        user_input = input("Do you want to shuffle the options? (y/n): ").strip().lower()
        if user_input in ('y', 'yes'):
            shuffle = True
            break
        elif user_input in ('n', 'no'):
            shuffle = False
            break
        else:
            print("Please enter 'y' or 'n'.")
    
    return nr_of_questions, shuffle


def display_question(question, index, total, shuffle):
    """Display a single question with its options."""
    if shuffle:
        random.shuffle(question['answers'])
    
    print(f"\n{bcolors.NORMAL}Question {index + 1}/{total}")
    print(f"{bcolors.NORMAL}{question['question']}")
    
    for j, answer in enumerate(question['answers']):
        print(f"{chr(j + 97)}) {answer['statement']}")


def get_valid_answer(num_options):
    """Get and validate user answer input."""
    valid_letters = set(chr(97 + i) for i in range(num_options))
    
    while True:
        user_answer = input("Your answer: ").strip().lower()
        
        if not user_answer:
            print("Please enter at least one answer.")
            continue
        
        # Check all characters are valid answer letters
        invalid_chars = set(user_answer) - valid_letters
        if invalid_chars:
            max_letter = chr(96 + num_options)
            print(f"Invalid input. Please use letters a-{max_letter} only.")
            continue
        
        return user_answer


def run_quiz(questions, nr_of_questions, shuffle):
    """Run the quiz and return score and list of wrong questions."""
    # Select random questions using random.sample
    selected_questions = random.sample(questions, nr_of_questions)
    
    user_score = 0
    wrong_questions = []
    
    for i, q in enumerate(selected_questions):
        display_question(q, i, nr_of_questions, shuffle)
        
        num_options = len(q['answers'])
        user_answer = get_valid_answer(num_options)
        
        # Calculate correct answers
        correct_answers = [
            chr(97 + idx) 
            for idx, ans in enumerate(q['answers']) 
            if ans['correct']
        ]
        
        # Check if user input is correct
        if sorted(user_answer) == sorted(correct_answers):
            print(f"{bcolors.CORRECT}Correct!")
            user_score += 1
        else:
            print(f"{bcolors.INCORRECT}Incorrect!")
            print(f"The correct answer was: {''.join(correct_answers)}")
            wrong_questions.append((q, user_answer))
    
    return user_score, wrong_questions


def review_mistakes(wrong_questions):
    """Display review of incorrect answers with color coding."""
    if not wrong_questions:
        print(f"{bcolors.NORMAL}No mistakes to review!")
        return
    
    print(f"\n{bcolors.NORMAL}=== Review of Mistakes ===")
    
    for q, user_answer in wrong_questions:
        print(f"\n{bcolors.NORMAL}{q['question']}")
        
        correct_indices = {
            idx for idx, ans in enumerate(q['answers']) 
            if ans['correct']
        }
        user_indices = {ord(c) - 97 for c in user_answer}
        
        for j, answer in enumerate(q['answers']):
            letter = chr(j + 97)
            is_correct = j in correct_indices
            was_selected = j in user_indices
            
            # Color coding:
            # - Green: correct answer
            # - Red: user selected but wrong
            # - Normal: not selected and not correct
            if is_correct:
                color = bcolors.CORRECT
                marker = " [correct]"
            elif was_selected:
                color = bcolors.INCORRECT
                marker = " [your answer]"
            else:
                color = bcolors.NORMAL
                marker = ""
            
            print(f"{color}{letter}) {answer['statement']}{marker}")
        
        print(f"{bcolors.NORMAL}Your answer: {user_answer}")


def main():
    """Main entry point for the quiz application."""
    display_welcome()
    
    filename = select_question_file()
    questions = load_questions(filename)
    
    while True:
        nr_of_questions, shuffle = get_quiz_settings(len(questions))
        
        user_score, wrong_questions = run_quiz(questions, nr_of_questions, shuffle)
        
        # Display score as percentage
        percentage = user_score / nr_of_questions * 100
        print(f"\n{bcolors.BLUE}You got {percentage:.1f}% ({user_score}/{nr_of_questions})")
        
        # Offer mistake review
        user_input = input(
            f"{bcolors.NORMAL}Do you want to review your mistakes? (y/n): "
        ).strip().lower()
        if user_input in ('y', 'yes'):
            review_mistakes(wrong_questions)
        
        # Ask to play again
        user_input = input("\nDo you want to play again? (y/n): ").strip().lower()
        if user_input in ('n', 'no'):
            print("Thank you for playing!")
            time.sleep(2)
            break
        else:
            print("Starting again...")
            time.sleep(1)


if __name__ == "__main__":
    main()
