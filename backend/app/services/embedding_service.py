import os
from openai import OpenAI

# Separate client, separate key — just for embeddings, not chat
embedding_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_embedding(text: str) -> list[float]:
    response = embedding_client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding