from transformers import pipeline
import fasttext
import re
from dotenv import load_dotenv
import os
from share_data import user_language
load_dotenv()


class Filter:
    # Class variables instead of instance variables
    # Từ ngữ nhạy cảm cần filter
    lang_dict = {'vie':"Vietnamese",'eng':"English"}
    sensitive_words = [
        # Từ ngữ bạo lực - Tiếng Việt
        'fuck', 'shit', 'giết', 'chết', 'máu', 'đánh', 'bắn', 'cướp',
        'tử hình', 'sát hại', 'xác', 'kill', 'die', 'death',
        'murder', 'rob', 'ass', 'shitty',
        
        # Từ ngữ bạo lực bổ sung - Tiếng Việt
        'giết chóc', 'sát nhân', 'ám sát', 'thảm sát', 'đâm chém', 'chém giết',
        'thiêu đốt', 'đốt cháy', 'nổ tung', 'bom đạn', 'súng đạn', 'dao găm',
        'chặt đầu', 'treo cổ', 'bóp cổ', 'nghiền nát', 'tra tấn', 'hành hạ',
        'đánh đập', 'tàn sát', 'thủ tiêu', 'hạ sát', 'đoạt mạng', 'cướp mạng',
        'tự tử', 'tự sát', 'tự vẫn', 'tử vong', 'chết chóc', 'thi thể',
        'xác chết', 'thây ma', 'ma lai', 'quỷ dữ', 'ác quỷ',
        
        # Từ ngữ bạo lực bổ sung - Tiếng Anh
        'assault', 'attack', 'beat', 'stab', 'shoot', 'bomb', 'weapon', 'gun',
        'knife', 'blade', 'sword', 'poison', 'torture', 'abuse', 'violence',
        'brutal', 'savage', 'massacre', 'slaughter', 'execute', 'hang', 'drown',
        'suffocate', 'strangle', 'assassinate', 'terminate', 'eliminate',
        'suicide', 'homicide', 'genocide', 'corpse', 'cadaver', 'bloodshed',
        'carnage', 'butcher', 'slayer', 'killer', 'murderer', 'criminal',
        'terrorist', 'destroy', 'demolish', 'annihilate', 'exterminate',
        
        # Từ ngữ tình dục - Tiếng Việt
        'tình dục', 'quan hệ', 'làm tình', 'ân ái', 'giao hợp',
        'nude', 'khỏa thân', 'cởi truồng', 'khỏa thể', 'sex toy', 'đồ chơi tình dục',
        'porn', 'phim sex', 'phim khiêu dâm', 'khiêu dâm', 'dâm dục',
        'mại dâm', 'gái điếm', 'điếm đĩ', 'đĩ thỏa', 'cave', 'gái gọi',
        'massage', 'karaoke ôm', 'quán bar', 'pub girl',
        
        # Từ ngữ tình dục - Tiếng Anh
        'porn', 'porno', 'pornography', 'nude', 'naked', 'strip', 'sexy',
        'erotic', 'adult', 'xxx', 'sexual', 'intercourse', 'orgasm',
        'masturbate', 'prostitute', 'whore', 'slut', 'bitch', 'hooker',
        'escort', 'brothel', 'fetish', 'kinky', 'hardcore', 'softcore',
        
        # Từ ngữ chửi thề - Tiếng Việt
        'đồ chó', 'con chó', 'thằng chó', 'đồ lợn', 'con lợn', 'thằng lợn',
        'đồ khốn', 'thằng khốn', 'đồ súc sinh', 'đồ đần', 'thằng đần',
        'đồ ngu', 'thằng ngu', 'con ngu', 'đầu óc lợn', 'não lợn',
        'mặt lợn', 'mồm lợn', 'miệng hôi', 'ngu như lợn', 'ngu như chó',
        'chết tiệt', 'khốn nạn', 'đồ khốn kiếp', 'thằng khốn kiếp',
        'đú má', 'địt mẹ', 'cặc', 'lồn', 'buồi', 'cave', 'đĩ',
        'mẹ kiếp', 'đéo', 'vãi', 'vãi lồn', 'đụ má', 'đụ mẹ',
        
        # Từ ngữ chửi thề - Tiếng Anh
        'damn', 'bastard', 'asshole', 'dickhead', 'motherfucker',
        'bitch', 'cunt', 'dick', 'cock', 'pussy', 'tits', 'boobs',
        'nipple', 'penis', 'vagina', 'anus', 'rectum', 'testicle',
        'screw', 'piss', 'crap', 'bullshit', 'goddamn', 'jesus christ',
        'holy shit', 'what the fuck', 'son of a bitch',
        
        # Từ ngữ ma túy - Tiếng Việt
        'ma túy', 'thuốc phiện', 'heroin', 'cocaine', 'cần sa', 'cỏ Mỹ',
        'thuốc lắc', 'ecstasy', 'methamphetamine', 'ketamine', 'opium',
        'morphine', 'crystal meth', 'ice', 'speed', 'crack', 'lsd',
        'mdma', 'weed', 'marijuana', 'hashish', 'cannabis', 'ganja',
        
        # Từ ngữ chính trị nhạy cảm - Tiếng Việt
        'chống phá', 'phản động', 'tuyên truyền', 'xuyên tạc', 'bôi nhọ',
        'vu khống', 'làm loạn', 'gây rối', 'biểu tình', 'đình công',
        'chính quyền', 'độc tài', 'chuyên chế', 'dân chủ hóa', 'tự do hóa',
        
        # Từ ngữ tôn giáo nhạy cảm
        'dị giáo', 'ngoại đạo', 'tà giáo', 'ma quỷ', 'quỷ satan', 'địa ngục',
        'chúa trời', 'thượng đế', 'allah', 'buddha', 'phật tổ', 'chúa jesus',
        
        # Từ ngữ phân biệt chủng tộc
        'đen', 'da đen', 'da đỏ', 'da vàng', 'da trắng', 'thổ dân',
        'nigger', 'negro', 'chink', 'gook', 'slant', 'jap', 'nazi',
        
        # Từ viết tắt và biến thể
        'wtf', 'omfg', 'stfu', 'lmao', 'lmfao', 'dmm', 'vcl', 'vkl',
        'wtf', 'lol', 'rofl', 'lmao', 'rotfl', 'bff', 'smh', 'cmm', 'lmm',
        'loz', 'cc', 'dkm', 'cdm', 'dcm'
        
        # Số điện thoại và thông tin cá nhân pattern
        'sdt:', 'số điện thoại:', 'phone:', 'tel:', 'zalo:', 'facebook:',
        'fb:', 'messenger:', 'instagram:', 'ig:', 'tiktok:', 'telegram:',
    ]

    # Lời chào thông thường
    common_greetings = [
        # Tiếng Việt
        'hello', 'hi', 'lô', 'chào', 'xin chào', '2', 'alo', 'halo',
        'xin chao', 'chao', 'chào bạn', 'xin chào bạn', 'chào anh',
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
        # Tách câu thành các từ riêng biệt
        words_in_query = query_lower.split()
        found_words = []
        
        for word in cls.sensitive_words:
            word_lower = word.lower().strip()
            # Kiểm tra từ nhạy cảm có xuất hiện như một từ riêng biệt không
            if word_lower in words_in_query:
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
        
        # 3. Get top 2 languages with probabilities
        lang_results = cls.check_lang(query)
        print(lang_results)
        supported_langs = ['vie', 'eng']
        has_supported_lang = False
        userLang = 'vie'  # Default language
        
        for lang_code, prob in lang_results:
            if lang_code in supported_langs and prob > 0.4:
                has_supported_lang = True
                userLang = lang_code
                user_language = cls.lang_dict[lang_code]
                break
        
        if not has_supported_lang:
            return 1
                
        return 3, userLang