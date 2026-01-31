from typing import Dict

from dotenv import load_dotenv
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

from .assistant_prompt import SYSTEM_PROMPT

# Load environment variables from a local .env file if present
load_dotenv()


def _build_base_chain():
    """
    Create the core Prometheus chain (prompt -> Llama 3 -> string output).

    This uses Groq's Llama 3 model via ChatGroq. Set GROQ_API_KEY in your
    environment or .env file.
    """
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder("chat_history", optional=True),
            ("human", "{input}"),
        ]
    )

    return prompt | llm | StrOutputParser()


_CHAT_HISTORY_STORE: Dict[str, InMemoryChatMessageHistory] = {}


def _get_session_history(session_id: str) -> InMemoryChatMessageHistory:
    if session_id not in _CHAT_HISTORY_STORE:
        _CHAT_HISTORY_STORE[session_id] = InMemoryChatMessageHistory()
    return _CHAT_HISTORY_STORE[session_id]


def get_agent_for_session(session_id: str) -> RunnableWithMessageHistory:
    """
    Return a RunnableWithMessageHistory bound to the given session ID.

    The returned object exposes .invoke(...) and keeps context across turns
    using in-memory chat history.
    """
    base_chain = _build_base_chain()
    runnable = RunnableWithMessageHistory(
        base_chain,
        _get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
    )
    # We don't need to pre-bind the session_id here; it's passed via config
    # at invocation time from the FastAPI layer.
    return runnable

