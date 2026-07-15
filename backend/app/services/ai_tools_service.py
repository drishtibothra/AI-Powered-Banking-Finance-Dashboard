from datetime import date as date_type
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.entry import Entry
from app.models.category import Category
from app.models.budget import Budget
from app.models.monthly_summary import MonthlySummary
from app.models.enums import EntryType
from app.services.search_service import semantic_search_entries


def _resolve_category(db: Session, user_id: int, category_name: str):
    return db.query(Category).filter(
        func.lower(Category.name) == category_name.lower().strip(),
        (Category.user_id == user_id) | (Category.user_id.is_(None)),
    ).first()


def get_transactions(db: Session, user_id: int, start_date: str, end_date: str,
                      category_name: str | None = None, entry_type: str | None = None) -> dict:
    start = date_type.fromisoformat(start_date)
    end = date_type.fromisoformat(end_date)

    query = db.query(Entry).filter(Entry.user_id == user_id, Entry.date >= start, Entry.date <= end)

    if category_name:
        category = _resolve_category(db, user_id, category_name)
        if not category:
            return {"error": f"Category '{category_name}' not found"}
        query = query.filter(Entry.category_id == category.id)

    if entry_type:
        query = query.filter(Entry.entry_type == entry_type.lower().strip())

    entries = query.order_by(Entry.date.desc()).all()
    total = sum(e.amount for e in entries)

    return {
        "count": len(entries),
        "total_amount": float(total),
        "entries": [
            {"date": str(e.date), "category": e.category.name, "amount": float(e.amount), "description": e.description}
            for e in entries
        ],
    }


def get_budget_status(db: Session, user_id: int, category_name: str, month: int, year: int) -> dict:
    category = _resolve_category(db, user_id, category_name)
    if not category:
        return {"error": f"Category '{category_name}' not found"}

    budget = db.query(Budget).filter(
        Budget.user_id == user_id, Budget.category_id == category.id,
        Budget.month == month, Budget.year == year,
    ).first()
    if not budget:
        return {"error": f"No budget set for '{category_name}' in {month}/{year}"}

    spent = db.query(func.sum(Entry.amount)).filter(
        Entry.user_id == user_id, Entry.category_id == category.id,
        func.extract("month", Entry.date) == month, func.extract("year", Entry.date) == year,
    ).scalar() or 0

    remaining = budget.limit_amount - spent
    percent_used = round(float(spent / budget.limit_amount * 100), 1) if budget.limit_amount else None

    return {
        "category": category_name,
        "limit_amount": float(budget.limit_amount),
        "spent_so_far": float(spent),
        "remaining": float(remaining),
        "percent_used": percent_used,
    }


def calculate_affordability(db: Session, user_id: int, target_amount: float, target_date: str) -> dict:
    target = date_type.fromisoformat(target_date)
    today = date_type.today()
    months_until = max(0, (target.year - today.year) * 12 + (target.month - today.month))

    summaries = db.query(MonthlySummary).filter(
        MonthlySummary.user_id == user_id
    ).order_by(MonthlySummary.year.desc(), MonthlySummary.month.desc()).limit(6).all()

    if not summaries:
        return {"error": "Not enough financial history yet to project affordability"}

    avg_monthly_net = sum(s.net_free_balance for s in summaries) / len(summaries)
    cumulative_free_balance = sum(s.net_free_balance for s in summaries)
    projected_available = cumulative_free_balance + (avg_monthly_net * months_until)

    return {
        "target_amount": float(target_amount),
        "target_date": str(target),
        "months_until_target": months_until,
        "average_monthly_net_balance": round(float(avg_monthly_net), 2),
        "projected_available_by_target_date": round(float(projected_available), 2),
        "can_afford": projected_available >= target_amount,
        "note": "Simplified linear projection based on average monthly free balance (income - expenses - savings) over recent history, plus current accumulated balance. Not a guarantee.",
    }


def get_spending_trend(db: Session, user_id: int, category_name: str | None = None, months: int = 6) -> dict:
    if category_name:
        category = _resolve_category(db, user_id, category_name)
        if not category:
            return {"error": f"Category '{category_name}' not found"}

        rows = db.query(
            func.extract("month", Entry.date).label("month"),
            func.extract("year", Entry.date).label("year"),
            func.sum(Entry.amount).label("total"),
        ).filter(
            Entry.user_id == user_id, Entry.category_id == category.id,
        ).group_by("month", "year").order_by("year", "month").limit(months).all()

        return {
            "category": category_name,
            "trend": [{"month": int(r.month), "year": int(r.year), "total": float(r.total)} for r in rows],
        }

    summaries = db.query(MonthlySummary).filter(
        MonthlySummary.user_id == user_id
    ).order_by(MonthlySummary.year.desc(), MonthlySummary.month.desc()).limit(months).all()
    summaries = list(reversed(summaries))

    return {
        "trend": [
            {"month": s.month, "year": s.year, "income": float(s.total_income),
             "expense": float(s.total_expense), "savings": float(s.total_savings)}
            for s in summaries
        ]
    }


def create_budget(db: Session, user_id: int, category_name: str, limit_amount: float, month: int, year: int) -> dict:
    category = _resolve_category(db, user_id, category_name)
    if not category:
        return {"error": f"Category '{category_name}' not found"}

    if category.entry_type != EntryType.expense:
        return {"error": f"Budgets can only be set on expense categories. '{category_name}' is type '{category.entry_type.value}'"}

    existing = db.query(Budget).filter(
        Budget.user_id == user_id, Budget.category_id == category.id,
        Budget.month == month, Budget.year == year,
    ).first()

    if existing:
        existing.limit_amount = limit_amount
        db.commit()
        return {"status": "updated", "category": category_name, "limit_amount": float(limit_amount), "month": month, "year": year}

    new_budget = Budget(user_id=user_id, category_id=category.id, limit_amount=limit_amount, month=month, year=year)
    db.add(new_budget)
    db.commit()
    return {"status": "created", "category": category_name, "limit_amount": float(limit_amount), "month": month, "year": year}


def flag_anomaly(db: Session, user_id: int, category_name: str | None = None,
                  month: int | None = None, year: int | None = None) -> dict:
    today = date_type.today()
    month = month or today.month
    year = year or today.year

    categories_query = db.query(Category).filter(
        (Category.user_id == user_id) | (Category.user_id.is_(None)),
        Category.entry_type == EntryType.expense,
    )
    if category_name:
        categories_query = categories_query.filter(func.lower(Category.name) == category_name.lower().strip())
    categories = categories_query.all()

    anomalies = []
    for cat in categories:
        current = db.query(func.sum(Entry.amount)).filter(
            Entry.user_id == user_id, Entry.category_id == cat.id,
            func.extract("month", Entry.date) == month, func.extract("year", Entry.date) == year,
        ).scalar() or 0

        hist_rows = db.query(
            func.extract("month", Entry.date).label("m"),
            func.extract("year", Entry.date).label("y"),
            func.sum(Entry.amount).label("total"),
        ).filter(Entry.user_id == user_id, Entry.category_id == cat.id).group_by("m", "y").all()

        past_totals = [float(r.total) for r in hist_rows if not (int(r.m) == month and int(r.y) == year)]
        if not past_totals:
            continue

        avg_past = sum(past_totals) / len(past_totals)
        if avg_past > 0 and current > avg_past * 1.5:
            anomalies.append({
                "category": cat.name,
                "current_month_total": float(current),
                "historical_average": round(avg_past, 2),
                "percent_increase": round(((float(current) - avg_past) / avg_past) * 100, 1),
            })

    if not anomalies:
        return {"anomalies_found": False, "message": "No significant spending anomalies detected."}
    return {"anomalies_found": True, "anomalies": anomalies}


def semantic_search_tool_wrapper(db: Session, user_id: int, query: str, top_k: int = 5) -> dict:
    results = semantic_search_entries(db, user_id, query, top_k=top_k)
    return {
        "results": [
            {"description": e.description, "amount": float(e.amount), "date": str(e.date), "similarity_distance": round(float(d), 4)}
            for e, d in results
        ]
    }