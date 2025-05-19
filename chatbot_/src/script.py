import fasttext
from huggingface_hub import hf_hub_download

model_path = hf_hub_download(repo_id="facebook/fasttext-language-identification", filename="model.bin")
print(model_path)
model = fasttext.load_model(model_path)

print(model.predict("Hello, world!", k=5))
