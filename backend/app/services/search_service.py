from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.entry import Entry
from app.services.embedding_service import generate_embedding


def semantic_search_entries(db: Session, user_id: int, query: str, top_k: int = 5):

    expanded_query = f"""
    Financial search query:
    {query}
    """

    query_embedding = generate_embedding(
        expanded_query,
        task_type="RETRIEVAL_QUERY"
    )

    distance = Entry.embedding.cosine_distance(query_embedding)

    rows = db.execute(
        select(
            Entry.description,
            distance.label("distance")
        )
        .filter(
            Entry.user_id == user_id,
            Entry.embedding.is_not(None)
        )
        .order_by(distance)
    ).all()

    print("\n========== DISTANCES ==========")

    for desc, dist in rows:
        print(f"{dist:.4f} --> {desc}")

    print("==============================\n")

    return db.scalars(
        select(Entry)
        .filter(Entry.user_id == user_id)
        .order_by(distance)
        .limit(top_k)
    ).all()