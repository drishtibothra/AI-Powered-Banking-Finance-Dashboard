import csv
import io
from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.entry import Entry
from app.models.category import Category
from app.schemas.entry import EntryCreate, EntryUpdate, EntryResponse
from app.services.summary_service import recalculate_monthly_summary
from app.services.embedding_service import generate_embedding
from app.services.search_service import semantic_search_entries

router = APIRouter(prefix="/entries", tags=["entries"])

@router.get("", response_model=list[EntryResponse])
def list_entries(
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None),
    category_id: int | None = Query(None),
    entry_type: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Entry).filter(Entry.user_id == current_user.id)

    if month:
        query = query.filter(func.extract("month", Entry.date) == month)
    if year:
        query = query.filter(func.extract("year", Entry.date) == year)
    if category_id:
        query = query.filter(Entry.category_id == category_id)
    if entry_type:
        query = query.filter(Entry.entry_type == entry_type.lower().strip())

    return query.order_by(Entry.date.desc()).all()

@router.post("", response_model=EntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    payload: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(
        Category.id == payload.category_id,
        (Category.user_id == current_user.id) | (Category.user_id.is_(None)),
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.entry_type != payload.entry_type:
        raise HTTPException(
            status_code=400,
            detail=f"entry_type '{payload.entry_type.value}' does not match category '{category.name}', which is type '{category.entry_type.value}'",
        )

    text_to_embed = f"""
    Category: {category.name}
    Entry Type: {payload.entry_type.value}
    Description: {payload.description or "No description"}
    Amount: ₹{payload.amount}
    """
    try:
        embedding = generate_embedding(
            text_to_embed,
            task_type="RETRIEVAL_DOCUMENT"
        )
    except Exception as e:
        print(f"Embedding generation failed: {e}")
        embedding = None

    new_entry = Entry(
        user_id=current_user.id,
        category_id=payload.category_id,
        amount=payload.amount,
        entry_type=payload.entry_type,
        description=payload.description,
        date=payload.date,
        frequency=payload.frequency,
        recurrence_day=payload.recurrence_day,
        embedding=embedding,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    recalculate_monthly_summary(db, current_user.id, new_entry.date.month, new_entry.date.year)
    return new_entry

@router.put("/{entry_id}", response_model=EntryResponse)
def update_entry(
    entry_id: int,
    payload: EntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id, Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    old_month, old_year = entry.date.month, entry.date.year
    update_data = payload.model_dump(exclude_unset=True)

    resulting_category_id = update_data.get("category_id", entry.category_id)
    resulting_entry_type = update_data.get("entry_type", entry.entry_type)

    category = db.query(Category).filter(Category.id == resulting_category_id).first()
    if category and category.entry_type != resulting_entry_type:
        raise HTTPException(
            status_code=400,
            detail=f"entry_type '{resulting_entry_type}' does not match category '{category.name}', which is type '{category.entry_type.value}'",
        )

    for field, value in update_data.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)

    recalculate_monthly_summary(db, current_user.id, old_month, old_year)
    recalculate_monthly_summary(db, current_user.id, entry.date.month, entry.date.year)
    return entry

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id, Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    month, year = entry.date.month, entry.date.year
    db.delete(entry)
    db.commit()

    recalculate_monthly_summary(db, current_user.id, month, year)
    return None


@router.post("/import-csv", status_code=status.HTTP_201_CREATED)
def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    required_columns = {"category_id", "amount", "entry_type", "date", "frequency"}
    if not required_columns.issubset(reader.fieldnames or []):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain columns: {', '.join(required_columns)}",
        )

    created_count = 0
    affected_months = set()
    errors = []

    for i, row in enumerate(reader, start=1):
        try:
            entry_date = date_type.fromisoformat(row["date"])
            new_entry = Entry(
                user_id=current_user.id,
                category_id=int(row["category_id"]),
                amount=row["amount"],
                entry_type=row["entry_type"].lower().strip(),
                description=row.get("description"),
                date=entry_date,
                frequency=row["frequency"].lower().strip(),
                recurrence_day=row.get("recurrence_day") or None,
            )
            db.add(new_entry)
            created_count += 1
            affected_months.add((entry_date.month, entry_date.year))
        except Exception as e:
            errors.append(f"Row {i}: {str(e)}")

    db.commit()

    for month, year in affected_months:
        recalculate_monthly_summary(db, current_user.id, month, year)

    return {"created": created_count, "errors": errors}

@router.get("/search")
def search_entries(
    q: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = semantic_search_entries(db, current_user.id, q)

    return [
        {
            "id": e.id,
            "description": e.description,
            "amount": str(e.amount),
        }
        for e in results
    ]