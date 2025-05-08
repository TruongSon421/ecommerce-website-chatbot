from fast_langdetect import detect, detect_multilingual, LangDetector, LangDetectConfig, DetectError
from huggingface_hub import hf_hub_download

model_path = hf_hub_download(repo_id="facebook/fasttext-language-identification", filename="model.bin")

# Load model from local file
config = LangDetectConfig(
    custom_model_path=model_path, 
    disable_verify=True                
)
detector = LangDetector(config)
result = detector.detect("Tôi muốn buy a new phone. Bạn có thể giúp tôi không?")
print(result)
