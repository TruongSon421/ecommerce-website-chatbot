from transformers import pipeline
import fasttext
import re
from dotenv import load_dotenv
import env
load_dotenv()


class Filter:
    # Class variables instead of instance variables
    sensitive_words = ['fuck','shit','giết','chết','máu','đánh','bắn','cướp','tử hình','sát hại','xác','kill','die','death','sex','murder','rob','ass','shitty']
    common_greetings = ['hello', 'hi', 'lô', 'chào', 'xin chào', '2', 'alo','xin chao','chao']
    model_path = env.get("LANGUAGE_MODEL_PATH")
    
    @classmethod
    def check_sensitive_words(cls, query):
        query = query.lower()
        found_words = []
        
        for word in cls.sensitive_words:
            if word.lower() in query:
                found_words.append(word)
        
        return len(found_words) > 0, found_words
    
    
    
    @classmethod
    def check_lang(cls, query):
        model = fasttext.load_model(cls.model_path)
        
        # Get the top 3 language predictions
        labels, probabilities = model.predict(query, k=2)
        
        # Process the results
        detected_langs = []
        for i in range(len(labels)):
            if i < len(labels):  # Safety check
                label = labels[i]
                prob = probabilities[i] if i < len(probabilities) else 0
                
                # Extract language code
                label = label.replace('__label__', '')
                match = re.search(r'^([a-z]{3})', label)
                if match:
                    lang_code = match.group(1)
                    detected_langs.append((lang_code, prob))
        
        return detected_langs
        
    @classmethod
    def check_common_greetings(cls, query):
        query = query.lower()
        found_words = []
        
        for word in cls.common_greetings:
            if word.lower().strip() == query:
                found_words.append(word)
        return len(found_words) > 0, found_words

    @classmethod
    def filter_query(cls, query):
        if cls.check_sensitive_words(query)[0]:
            return 0
        
        # Get top 2 languages with probabilities
        lang_results = cls.check_lang(query)
        print(lang_results)
        supported_langs = ['vie', 'eng']
        has_supported_lang = False
        
        for lang_code, prob in lang_results:
            if lang_code in supported_langs and prob > 0.4:
                has_supported_lang = True
                userLang = lang_code
                break
        
        if not has_supported_lang:
            return 1
                
        if cls.check_common_greetings(query)[0]:
            return 2
                
        return 3, userLang