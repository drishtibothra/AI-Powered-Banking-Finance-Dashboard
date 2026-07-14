import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

embedding_client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def generate_embedding(
    text: str,
    task_type: str = "SEMANTIC_SIMILARITY"
) -> list[float]:

    response = embedding_client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config={
            "task_type": task_type
        }
    )

    return response.embeddings[0].values