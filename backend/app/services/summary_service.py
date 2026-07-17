from app.models.entry import Entry
from app.models.enums import EntryType
from app.models.monthly_summary import MonthlySummary
from sqlalchemy import func
from sqlalchemy.orm import Session


def recalculate_monthly_summary(db: Session, user_id: int, month: int, year: int):
    totals = (
        db.query(Entry.entry_type, func.sum(Entry.amount).label("total"))
        .filter(
            Entry.user_id == user_id,
            func.extract("month", Entry.date) == month,
            func.extract("year", Entry.date) == year,
        )
        .group_by(Entry.entry_type)
        .all()
    )

    totals_map = {t.entry_type: t.total for t in totals}
    total_income = totals_map.get(EntryType.income, 0)
    total_expense = totals_map.get(EntryType.expense, 0)
    total_savings = totals_map.get(EntryType.savings, 0)
    net_free_balance = total_income - total_expense - total_savings

    summary = (
        db.query(MonthlySummary)
        .filter(
            MonthlySummary.user_id == user_id,
            MonthlySummary.month == month,
            MonthlySummary.year == year,
        )
        .first()
    )

    if summary:
        summary.total_income = total_income
        summary.total_expense = total_expense
        summary.total_savings = total_savings
        summary.net_free_balance = net_free_balance
    else:
        summary = MonthlySummary(
            user_id=user_id,
            month=month,
            year=year,
            total_income=total_income,
            total_expense=total_expense,
            total_savings=total_savings,
            net_free_balance=net_free_balance,
        )
        db.add(summary)

    db.commit()
