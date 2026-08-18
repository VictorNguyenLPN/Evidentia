import json
# pyrefly: ignore [missing-import]
from backend.config import DATA_DIR

origin_data_path = DATA_DIR / "data.json"
example_data_path = DATA_DIR / "data.json.example"

with open(origin_data_path, "r") as file:
    origin_data = json.load(file)

example_data = origin_data[:10]

with open(example_data_path, "w", encoding="utf-8") as file:
    json.dump(example_data, file, ensure_ascii=False, indent=2)

print(f"Origin: {len(origin_data)}")
print(f"Save success example: {len(example_data)}")
