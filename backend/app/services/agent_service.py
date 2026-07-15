import os
import json
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.ai.tool_schemas import finance_tools
from app.ai.tool_executor import execute_tool
from app.models.ai_conversation import AIConversation
from app.models.ai_message import AIMessage
from app.models.enums import MessageRole

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = (
    "You are a helpful, grounded financial assistant inside a personal finance app. "
    "You have access to tools that query the user's REAL financial data — always use them "
    "rather than guessing or assuming numbers. When answering, be specific and cite the actual "
    "figures returned by your tools. Keep answers concise and practical."
)

MAX_TOOL_ITERATIONS = 5


def run_agent_chat(db: Session, user_id: int, message: str, conversation_id: int | None = None) -> dict:
    if conversation_id:
        conversation = db.query(AIConversation).filter(
            AIConversation.id == conversation_id, AIConversation.user_id == user_id
        ).first()
        if not conversation:
            conversation = AIConversation(user_id=user_id)
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
    else:
        conversation = AIConversation(user_id=user_id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    user_msg = AIMessage(conversation_id=conversation.id, role=MessageRole.user, content=message)
    db.add(user_msg)
    db.commit()

    past_messages = db.query(AIMessage).filter(
        AIMessage.conversation_id == conversation.id, AIMessage.role != MessageRole.tool
    ).order_by(AIMessage.created_at.asc()).all()

    contents = []
    for m in past_messages:
        role = "user" if m.role == MessageRole.user else "model"
        contents.append(types.Content(role=role, parts=[types.Part(text=m.content)]))

    config = types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT, tools=[finance_tools])

    iterations = 0
    final_text = None

    while iterations < MAX_TOOL_ITERATIONS:
        iterations += 1
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=contents,
            config=config,
        )

        candidate = response.candidates[0]
        parts = candidate.content.parts
        function_calls = [p.function_call for p in parts if p.function_call]

        if not function_calls:
            final_text = response.text
            contents.append(candidate.content)
            break

        contents.append(candidate.content)
        tool_response_parts = []

        for fc in function_calls:
            tool_name = fc.name
            tool_args = dict(fc.args) if fc.args else {}
            result = execute_tool(db, user_id, tool_name, tool_args)

            tool_msg = AIMessage(
                conversation_id=conversation.id,
                role=MessageRole.tool,
                content=json.dumps(result),
                tool_calls={"name": tool_name, "arguments": tool_args},
            )
            db.add(tool_msg)

            tool_response_parts.append(
                types.Part.from_function_response(name=tool_name, response={"result": result})
            )

        db.commit()
        contents.append(types.Content(role="user", parts=tool_response_parts))

    if final_text is None:
        final_text = "I wasn't able to fully process that — could you rephrase or ask something more specific?"

    assistant_msg = AIMessage(conversation_id=conversation.id, role=MessageRole.assistant, content=final_text)
    db.add(assistant_msg)
    db.commit()

    return {"conversation_id": conversation.id, "response": final_text}