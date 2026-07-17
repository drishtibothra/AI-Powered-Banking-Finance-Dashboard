from app.services.ai_tools_service import (
    calculate_affordability,
    create_budget,
    flag_anomaly,
    get_budget_status,
    get_spending_trend,
    get_transactions,
    semantic_search_tool_wrapper,
)


def execute_tool(db, user_id: int, tool_name: str, args: dict) -> dict:
    dispatch = {
        "get_transactions": lambda: get_transactions(db, user_id, **args),
        "get_budget_status": lambda: get_budget_status(db, user_id, **args),
        "calculate_affordability": lambda: calculate_affordability(db, user_id, **args),
        "get_spending_trend": lambda: get_spending_trend(db, user_id, **args),
        "create_budget": lambda: create_budget(db, user_id, **args),
        "flag_anomaly": lambda: flag_anomaly(db, user_id, **args),
        "semantic_search_entries": lambda: semantic_search_tool_wrapper(
            db, user_id, **args
        ),
    }

    if tool_name not in dispatch:
        return {"error": f"Unknown tool: {tool_name}"}

    try:
        return dispatch[tool_name]()
    except Exception as e:
        return {"error": f"Tool execution failed: {str(e)}"}
