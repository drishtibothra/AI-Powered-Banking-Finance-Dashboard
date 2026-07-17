from calendar import monthrange
from datetime import date

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.category import Category
from app.models.entry import Entry
from app.models.enums import EntryType
from app.models.monthly_summary import MonthlySummary
from app.models.user import User
from app.schemas.analytics import (
    BurnRateResponse,
    CategoryBreakdownItem,
    SummaryResponse,
    TrendPoint,
)
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=SummaryResponse)
def get_summary(
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summary = (
        db.query(MonthlySummary)
        .filter(
            MonthlySummary.user_id == current_user.id,
            MonthlySummary.month == month,
            MonthlySummary.year == year,
        )
        .first()
    )

    if not summary:
        return SummaryResponse(
            month=month,
            year=year,
            total_income=0,
            total_expense=0,
            total_savings=0,
            net_free_balance=0,
        )

    return summary


@router.get("/trend", response_model=list[TrendPoint])
def get_trend(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    summaries = (
        db.query(MonthlySummary)
        .filter(
            MonthlySummary.user_id == current_user.id,
        )
        .order_by(MonthlySummary.year.desc(), MonthlySummary.month.desc())
        .limit(months)
        .all()
    )

    return list(reversed(summaries))


@router.get("/category-breakdown", response_model=list[CategoryBreakdownItem])
def get_category_breakdown(
    month: int = Query(...),
    year: int = Query(...),
    entry_type: str = Query("expense"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = (
        db.query(
            Category.id.label("category_id"),
            Category.name.label("category_name"),
            func.sum(Entry.amount).label("total_amount"),
        )
        .join(Entry, Entry.category_id == Category.id)
        .filter(
            Entry.user_id == current_user.id,
            Entry.entry_type == entry_type.lower().strip(),
            func.extract("month", Entry.date) == month,
            func.extract("year", Entry.date) == year,
        )
        .group_by(Category.id, Category.name)
        .order_by(func.sum(Entry.amount).desc())
        .all()
    )

    return results


@router.get("/burn-rate", response_model=BurnRateResponse)
def get_burn_rate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    summary = (
        db.query(MonthlySummary)
        .filter(
            MonthlySummary.user_id == current_user.id,
            MonthlySummary.month == today.month,
            MonthlySummary.year == today.year,
        )
        .first()
    )

    if not summary:
        return BurnRateResponse(
            current_balance=0, average_daily_spend=0, days_remaining=None
        )

    days_elapsed = today.day
    days_in_month = monthrange(today.year, today.month)[1]
    days_left_in_month = days_in_month - days_elapsed

    avg_daily_spend = (summary.total_expense / days_elapsed) if days_elapsed > 0 else 0
    current_balance = summary.net_free_balance

    if avg_daily_spend > 0:
        projected_days_at_current_rate = float(current_balance / avg_daily_spend)
        days_remaining = min(projected_days_at_current_rate, days_left_in_month)
    else:
        days_remaining = None

    return BurnRateResponse(
        current_balance=current_balance,
        average_daily_spend=round(avg_daily_spend, 2),
        days_remaining=round(days_remaining, 1) if days_remaining is not None else None,
    )
