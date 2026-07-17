from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.budget import Budget
from app.models.category import Category
from app.models.enums import EntryType
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetResponse])
def list_budgets(
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Budget).filter(Budget.user_id == current_user.id)

    if month:
        query = query.filter(Budget.month == month)
    if year:
        query = query.filter(Budget.year == year)

    return query.all()


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(
            Category.id == payload.category_id,
            (Category.user_id == current_user.id) | (Category.user_id.is_(None)),
        )
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Budgets only make sense for expense categories — you don't "budget" income or savings
    if category.entry_type != EntryType.expense:
        raise HTTPException(
            status_code=400,
            detail=f"Budgets can only be set on expense categories. '{category.name}' is type '{category.entry_type.value}'.",
        )

    new_budget = Budget(
        user_id=current_user.id,
        category_id=payload.category_id,
        limit_amount=payload.limit_amount,
        month=payload.month,
        year=payload.year,
    )
    db.add(new_budget)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="A budget already exists for this category and month. Use PUT to update it instead.",
        )

    db.refresh(new_budget)
    return new_budget


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    if payload.limit_amount is not None:
        budget.limit_amount = payload.limit_amount

    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()
    return None
