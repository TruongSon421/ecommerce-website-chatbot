from transformers import pipeline
import fasttext
import re
from dotenv import load_dotenv
import os
load_dotenv()


class Filter:
    # Class variables instead of instance variables
    lang_dict = {'vie':"tiếng Việt",'eng':"tiếng Anh"}
    
    # Load sensitive words from external files
    @classmethod
    def _load_sensitive_words(cls):
        """Load sensitive words from Vietnamese and English text files"""
        sensitive_words = []
        
        # Đường dẫn tới các file từ nhạy cảm
        vie_file = os.path.join(os.path.dirname(__file__), 'sensitive_words_vie.txt')
        en_file = os.path.join(os.path.dirname(__file__), 'sensitive_words_en.txt')
        
        # Load từ tiếng Việt
        try:
            with open(vie_file, 'r', encoding='utf-8') as f:
                vie_words = [line.strip() for line in f if line.strip()]
                sensitive_words.extend(vie_words)
                print(f"Loaded {len(vie_words)} Vietnamese sensitive words")
        except Exception as e:
            print(f"Error loading Vietnamese sensitive words: {e}")
        
        # Load từ tiếng Anh
        try:
            with open(en_file, 'r', encoding='utf-8') as f:
                en_words = [line.strip() for line in f if line.strip()]
                sensitive_words.extend(en_words)
                print(f"Loaded {len(en_words)} English sensitive words")
        except Exception as e:
            print(f"Error loading English sensitive words: {e}")
        
        print(f"Total sensitive words loaded: {len(sensitive_words)}")
        return sensitive_words
    
    # Initialize sensitive_words as None, will be loaded on first access
    _sensitive_words_cache = None
    
    @classmethod
    def get_sensitive_words(cls):
        """Get sensitive words, loading them if not already cached"""
        if cls._sensitive_words_cache is None:
            cls._sensitive_words_cache = cls._load_sensitive_words()
        return cls._sensitive_words_cache
    
    @classmethod
    def sensitive_words(cls):
        """Property to access sensitive words"""
        return cls.get_sensitive_words()

    # Lời chào thông thường
    common_greetings = [
        # Tiếng Việt
        'hello', 'hi', 'lô', 'chào', 'xin chào', '2', 'alo', 'halo',
        'xin chao', 'xin chaof','chao', 'chào bạn', 'xin chào bạn', 'chào anh',
        'chào chị', 'chào em', 'xin chào anh', 'xin chào chị', 'xin chào em',
        'good morning', 'good afternoon', 'good evening', 'good night',
        'chào buổi sáng', 'chào buổi chiều', 'chào buổi tối', 'chúc ngủ ngon',
        'hey', 'yo', 'sup', 'wassup', "what's up", 'howdy', 'greetings',
        
        # Các cách chào hỏi khác
        'bạn khỏe không', 'khỏe không', 'có khỏe không', 'sao rồi',
        'how are you', 'how do you do', 'nice to meet you', 'pleased to meet you',
        'rất vui được gặp bạn', 'hân hạnh được gặp', 'vui được làm quen',
        
        # Lời chào formal
        'kính chào', 'kính thưa', 'thưa anh', 'thưa chị', 'thưa ông', 'thưa bà',
        'dear sir', 'dear madam', 'to whom it may concern', 'respectfully',
        
        # Lời chào thân mật
        'ê', 'ê bạn', 'ê bro', 'ê sis', 'ê anh', 'ê chị', 'ê em',
        'bro', 'sis', 'dude', 'buddy', 'mate', 'pal', 'friend',
        'bạn ơi', 'anh ơi', 'chị ơi', 'em ơi',
        
        # Lời chào theo thời gian
        'chúc buổi sáng tốt lành', 'chúc buổi chiều vui vẻ', 
        'chúc buổi tối an lành', 'chúc một ngày tốt lành',
        'have a good day', 'have a nice day', 'have a great day',
        'good luck', 'take care', 'see you later', 'goodbye', 'bye',
        'tạm biệt', 'hẹn gặp lại', 'chúc bạn may mắn', 'giữ gìn sức khỏe',
    ]
    model_path = os.getenv("LANGUAGE_MODEL_PATH")
    
    @classmethod
    def check_sensitive_words(cls, query):
        """Kiểm tra xem query có chứa từ nhạy cảm riêng biệt không"""
        query_lower = query.lower()
        # Tách query thành các từ riêng biệt
        words_in_query = query_lower.split()
        # Chuẩn hóa query: thay thế dấu _ bằng dấu cách
        query_normalized = query_lower.replace('_', ' ')
        found_words = []
        
        for word in cls.get_sensitive_words():
            word_lower = word.lower().strip()
            
            # Chuẩn hóa: thay thế dấu _ bằng dấu cách
            word_normalized = word_lower.replace('_', ' ')
            
            # Kiểm tra 3 trường hợp:
            # 1. Từ gốc là một từ riêng biệt trong query 
            if word_lower in words_in_query:
                found_words.append(word)
                continue
                
            # 2. Từ chuẩn hóa là một cụm từ chính xác trong query chuẩn hóa
            if f" {word_normalized} " in f" {query_normalized} ":
                found_words.append(word)
                continue
                
            # 3. Từ chuẩn hóa là toàn bộ câu query
            if word_normalized == query_normalized:
                found_words.append(word)
                continue
        
        return len(found_words) > 0, found_words
    
    @classmethod
    def check_lang(cls, query):
        model = fasttext.load_model(cls.model_path)
        
        # Get the top 3 language predictions
        labels, probabilities = model.predict(query, k=3)
        
        # Process the results
        detected_langs = []
        for i in range(len(labels)):
            label = labels[i]
            prob = probabilities[i] 
            
            # Extract language code
            label = label.replace('__label__', '')
            match = re.search(r'^([a-z]{3})', label)
            if match:
                lang_code = match.group(1)
                detected_langs.append((lang_code, prob))
        
        return detected_langs
        
    @classmethod
    def check_common_greetings(cls, query):
        """Kiểm tra xem query có phải là lời chào chính xác không"""
        # Kiểm tra chính xác: query.strip() phải giống hoàn toàn với một từ chào hỏi
        query_stripped = query.strip().lower()
        found_words = []
        
        for word in cls.common_greetings:
            if word.lower().strip() == query_stripped:
                found_words.append(word)
        return len(found_words) > 0, found_words

    @classmethod
    def filter_query(cls, query):
        
        # 1. Kiểm tra lời chào trước (chính xác hoàn toàn)
        if cls.check_common_greetings(query)[0]:
            return 2
        
        # 2. Kiểm tra từ nhạy cảm (chứa trong câu)
        if cls.check_sensitive_words(query)[0]:
            return 0
        
        # 3. Nếu query ngắn hơn 5 ký tự, pass với tiếng Việt
        if len(query.strip()) <= 5:
            print(f"Short query detected (length: {len(query.strip())}), defaulting to Vietnamese")
            return 3, 'vie'
        
        # 4. Kiểm tra ngôn ngữ cho query dài hơn 5 ký tự
        lang_results = cls.check_lang(query)
        print(f"Fasttext results: {lang_results}")
        
        supported_langs = ['vie', 'eng']
        has_supported_lang = False
        userLang = 'vie'  # Default language
        
        # Kiểm tra xem có ngôn ngữ supported nào trong results không
        vie_prob = next((prob for lang_code, prob in lang_results if lang_code == 'vie'), 0.0)
        eng_prob = next((prob for lang_code, prob in lang_results if lang_code == 'eng'), 0.0)
        
        # Lấy confidence cao nhất từ tất cả predictions (bao gồm cả ngôn ngữ không support)
        max_confidence = max([prob for _, prob in lang_results]) if lang_results else 0.0
        
        print(f"Vietnamese confidence: {vie_prob:.4f}")
        print(f"English confidence: {eng_prob:.4f}")
        print(f"Max confidence from all languages: {max_confidence:.4f}")
        
        # Nếu confidence cao nhất < 0.55 thì pass với tiếng Việt
        if max_confidence < 0.55:
            print(f"Max confidence ({max_confidence:.4f}) < 0.55, allowing query to pass with Vietnamese")
            
            # Nếu có vie hoặc eng trong results, chọn cái có confidence cao hơn
            if vie_prob > 0 or eng_prob > 0:
                userLang = 'vie' if vie_prob >= eng_prob else 'eng'
                print(f"Choosing {userLang} based on higher confidence")
                return 3, userLang
            
            # Nếu không có vie/eng, default về tiếng Việt
            print("No Vietnamese/English detected, defaulting to Vietnamese")
            return 3, 'vie'
        
        # Kiểm tra ngôn ngữ supported với threshold
        for lang_code, prob in lang_results:
            if lang_code in supported_langs:
                # Giảm threshold cho việc detect ngôn ngữ supported
                threshold = 0.3 if lang_code == 'vie' else 0.4
                if prob > threshold:
                    has_supported_lang = True
                    userLang = lang_code
                    print(f"Language detected: {lang_code} with confidence {prob:.4f}")
                    break
        
        if not has_supported_lang:
            print("No supported language detected")
            return 1
                
        return 3, userLang