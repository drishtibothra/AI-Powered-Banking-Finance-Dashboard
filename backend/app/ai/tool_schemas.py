from google.genai import types

get_transactions_tool = types.FunctionDeclaration(
    name="get_transactions",
    description=(
        "Retrieve the user's financial entries within a date range, optionally filtered by "
        "category name or entry type. Use for questions about what the user spent, earned, "
        "or saved during a specific period."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "start_date": types.Schema(
                type="STRING", description="Start date, YYYY-MM-DD"
            ),
            "end_date": types.Schema(type="STRING", description="End date, YYYY-MM-DD"),
            "category_name": types.Schema(
                type="STRING", description="Optional category name, e.g. 'Food'"
            ),
            "entry_type": types.Schema(
                type="STRING", enum=["income", "expense", "savings"]
            ),
        },
        required=["start_date", "end_date"],
    ),
)

get_budget_status_tool = types.FunctionDeclaration(
    name="get_budget_status",
    description="Check the user's budget status for a specific expense category and month — allotted, spent, remaining.",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "category_name": types.Schema(
                type="STRING", description="Expense category name, e.g. 'Food'"
            ),
            "month": types.Schema(type="INTEGER", description="Month (1-12)"),
            "year": types.Schema(type="INTEGER", description="Year, e.g. 2026"),
        },
        required=["category_name", "month", "year"],
    ),
)

calculate_affordability_tool = types.FunctionDeclaration(
    name="calculate_affordability",
    description=(
        "Determine whether the user can afford a hypothetical future expense by a given date, "
        "using current savings, recurring commitments, and average free balance. Use for "
        "'can I afford X by Y' style questions."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "target_amount": types.Schema(
                type="NUMBER", description="Amount the user wants to spend"
            ),
            "target_date": types.Schema(
                type="STRING", description="Target date, YYYY-MM-DD"
            ),
        },
        required=["target_amount", "target_date"],
    ),
)

get_spending_trend_tool = types.FunctionDeclaration(
    name="get_spending_trend",
    description="Retrieve month-over-month spending trend, optionally for one category, over the last N months.",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "category_name": types.Schema(
                type="STRING", description="Optional category to narrow to"
            ),
            "months": types.Schema(
                type="INTEGER", description="Number of past months, default 6"
            ),
        },
        required=[],
    ),
)

create_budget_tool = types.FunctionDeclaration(
    name="create_budget",
    description="Create or update a monthly budget limit for an expense category, if the user asks to set one.",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "category_name": types.Schema(
                type="STRING", description="Expense category name"
            ),
            "limit_amount": types.Schema(
                type="NUMBER", description="Budget limit amount"
            ),
            "month": types.Schema(type="INTEGER", description="Month (1-12)"),
            "year": types.Schema(type="INTEGER", description="Year"),
        },
        required=["category_name", "limit_amount", "month", "year"],
    ),
)

flag_anomaly_tool = types.FunctionDeclaration(
    name="flag_anomaly",
    description="Check if spending in a category this month is significantly above historical average. Use for 'why did my spending spike' questions.",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "category_name": types.Schema(
                type="STRING", description="Optional category to check"
            ),
            "month": types.Schema(
                type="INTEGER", description="Month to check, defaults to current"
            ),
            "year": types.Schema(
                type="INTEGER", description="Year, defaults to current"
            ),
        },
        required=[],
    ),
)

semantic_search_tool = types.FunctionDeclaration(
    name="semantic_search_entries",
    description=(
        "Search entries by meaning, not exact category — e.g. find 'travel-related' spending "
        "even if never tagged 'Travel'. Use when the user's term doesn't map to an exact category."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "query": types.Schema(
                type="STRING", description="Natural-language concept to search for"
            ),
            "top_k": types.Schema(type="INTEGER", description="Max results, default 5"),
        },
        required=["query"],
    ),
)

finance_tools = types.Tool(
    function_declarations=[
        get_transactions_tool,
        get_budget_status_tool,
        calculate_affordability_tool,
        get_spending_trend_tool,
        create_budget_tool,
        flag_anomaly_tool,
        semantic_search_tool,
    ]
)
