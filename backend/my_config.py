from dotenv import load_dotenv
import os
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig


load_dotenv()

openrouter_key = os.getenv("OPENROUTER_API_KEY")

if not openrouter_key:
    raise ValueError("OPENROUTER_API_KEY not found in environment variables")

openrouter_client = AsyncOpenAI(
    api_key=openrouter_key,
    base_url="https://openrouter.ai/api/v1",
)

openrouter_model = OpenAIChatCompletionsModel(
    model="meta-llama/llama-3.3-70b-instruct:free",  # Better free model
    openai_client=openrouter_client
)

config = RunConfig(
    model=openrouter_model,
    tracing_disabled=True,  # Critical: Disable tracing to avoid OpenAI calls
)
