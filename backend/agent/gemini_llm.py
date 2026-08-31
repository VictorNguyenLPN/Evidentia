import json
import logging
from typing import Any

from backend.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)


class GeminiLLMClient:
    """
    Wrapper for Google Gemini API.
    Supports Gemini 3.1 Flash Lite / Gemini 2.5 Flash Lite / configurable models.
    Provides precise token usage extraction across prompt, system, answer, and total tokens.
    """

    def __init__(self, api_key: str = GEMINI_API_KEY, model_name: str = GEMINI_MODEL):
        self.api_key = api_key
        self.model_name = model_name
        self._genai_client = None
        self._token_cache: dict[str, int] = {}
        if self.api_key:
            try:
                self._init_client()
            except Exception as e:
                logger.warning(f"Could not auto-initialize Gemini client during init: {e}")

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def is_ready(self) -> bool:
        return bool(self.api_key)

    def _init_client(self):
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured! Please provide your Gemini API key in .env"
            )

        from google import genai

        self._genai_client = genai.Client(api_key=self.api_key)
        logger.info(f"Initialized Google GenAI client with model: {self.model_name}")
        return self._genai_client

    def get_client(self):
        if self._genai_client is None:
            self._init_client()
        return self._genai_client

    def check_readiness(self) -> dict[str, Any]:
        """
        Verify Gemini API key and model readiness by testing connectivity.
        """
        if not self.is_configured():
            logger.warning("GEMINI_API_KEY is not configured in .env!")
            return {"ready": False, "model": self.model_name, "error": "missing_api_key"}

        try:
            client = self.get_client()
            # Test model availability
            client.models.get(model=self.model_name)
            logger.info(f"Gemini Model '{self.model_name}' is verified and ready")
            return {"ready": True, "model": self.model_name}
        except Exception as e:
            logger.error(f"Gemini Model '{self.model_name}' readiness check failed: {e}")
            return {"ready": False, "model": self.model_name, "error": str(e)}

    def count_tokens(self, text: str) -> int:
        """
        Count tokens for a given string using Gemini count_tokens API with caching and fallback.
        """
        if not text:
            return 0
        if text in self._token_cache:
            return self._token_cache[text]

        try:
            client = self.get_client()
            res = client.models.count_tokens(model=self.model_name, contents=text)
            token_count = int(res.total_tokens or 0)
            self._token_cache[text] = token_count
            return token_count
        except Exception as e:
            logger.warning(f"Gemini count_tokens failed (falling back to approximation): {e}")
            # Approximate fallback (~3-4 chars per token)
            approx = max(1, len(text) // 3)
            return approx

    def generate_with_usage(
        self, prompt: str, system_instruction: str | None = None, temperature: float = 0.2
    ) -> tuple[str, dict[str, int]]:
        """
        Generate response from Gemini model and return (generated_text, token_usage_dict).
        """
        client = self.get_client()
        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
            if temperature is not None:
                config["temperature"] = temperature

            response = client.models.generate_content(
                model=self.model_name, contents=prompt, config=config if config else None
            )

            text = response.text.strip() if response.text else ""

            system_tokens = self.count_tokens(system_instruction) if system_instruction else 0
            prompt_tokens = 0
            candidates_tokens = 0
            total_tokens = 0

            if hasattr(response, "usage_metadata") and response.usage_metadata:
                total_prompt = response.usage_metadata.prompt_token_count or 0
                candidates_tokens = response.usage_metadata.candidates_token_count or 0
                prompt_tokens = max(0, total_prompt - system_tokens)
                total_tokens = response.usage_metadata.total_token_count or (
                    prompt_tokens + system_tokens + candidates_tokens
                )
            else:
                prompt_tokens = self.count_tokens(prompt)
                candidates_tokens = self.count_tokens(text)
                total_tokens = prompt_tokens + system_tokens + candidates_tokens

            usage = {
                "prompt_tokens": prompt_tokens,
                "system_tokens": system_tokens,
                "answer_tokens": candidates_tokens,
                "total_tokens": total_tokens,
            }
            return text, usage
        except Exception as e:
            logger.error(f"Error invoking Gemini model ({self.model_name}): {e}", exc_info=True)
            raise e

    def generate(
        self, prompt: str, system_instruction: str | None = None, temperature: float = 0.2
    ) -> str:
        """
        Generate response from Gemini model (backwards compatible).
        """
        text, _ = self.generate_with_usage(prompt, system_instruction, temperature)
        return text

    def generate_stream_with_usage(
        self, prompt: str, system_instruction: str | None = None, temperature: float = 0.2
    ):
        """
        Generate streaming token chunks from Gemini model and yield events:
        {"type": "text", "content": chunk_text}
        {"type": "usage", "usage": token_usage_dict}
        """
        client = self.get_client()
        system_tokens = self.count_tokens(system_instruction) if system_instruction else 0

        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
            if temperature is not None:
                config["temperature"] = temperature

            response = client.models.generate_content_stream(
                model=self.model_name, contents=prompt, config=config if config else None
            )

            last_usage_metadata = None
            full_text = ""
            for chunk in response:
                if hasattr(chunk, "usage_metadata") and chunk.usage_metadata:
                    last_usage_metadata = chunk.usage_metadata
                if chunk.text:
                    full_text += chunk.text
                    yield {"type": "text", "content": chunk.text}

            if last_usage_metadata:
                total_prompt = last_usage_metadata.prompt_token_count or 0
                candidates_tokens = last_usage_metadata.candidates_token_count or 0
                prompt_tokens = max(0, total_prompt - system_tokens)
                total_tokens = last_usage_metadata.total_token_count or (
                    prompt_tokens + system_tokens + candidates_tokens
                )
            else:
                prompt_tokens = self.count_tokens(prompt)
                candidates_tokens = self.count_tokens(full_text)
                total_tokens = prompt_tokens + system_tokens + candidates_tokens

            usage = {
                "prompt_tokens": prompt_tokens,
                "system_tokens": system_tokens,
                "answer_tokens": candidates_tokens,
                "total_tokens": total_tokens,
            }
            yield {"type": "usage", "usage": usage}
        except Exception as e:
            logger.error(
                f"Error streaming from Gemini model ({self.model_name}): {e}", exc_info=True
            )
            raise e

    def generate_stream(
        self, prompt: str, system_instruction: str | None = None, temperature: float = 0.2
    ):
        """
        Generate streaming token chunks from Gemini model (backwards compatible).
        """
        for event in self.generate_stream_with_usage(prompt, system_instruction, temperature):
            if event.get("type") == "text":
                yield event.get("content", "")

    def generate_json_with_usage(
        self, prompt: str, system_instruction: str | None = None, temperature: float = 0.1
    ) -> tuple[dict[str, Any], dict[str, int]]:
        """
        Generate structured JSON response and token usage.
        """
        json_instruction = (
            (system_instruction or "")
            + "\nIMPORTANT: Your response MUST be valid JSON only. Do not enclose in markdown code blocks like ```json ... ``` unless necessary, or ensure it is clean parsable JSON."
        ).strip()

        raw_output, usage = self.generate_with_usage(
            prompt=prompt, system_instruction=json_instruction, temperature=temperature
        )

        # Clean potential markdown formatting
        cleaned = raw_output.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as err:
            logger.warning(
                f"Failed to parse JSON response from Gemini: {err}. Raw text: {raw_output}"
            )
            data = {"raw_text": raw_output, "error": "json_parse_failed"}

        return data, usage

    def generate_json(
        self, prompt: str, system_instruction: str | None = None, temperature: float = 0.1
    ) -> dict[str, Any]:
        """
        Generate structured JSON response (backwards compatible).
        """
        data, _ = self.generate_json_with_usage(prompt, system_instruction, temperature)
        return data


# Singleton instance
gemini_client = GeminiLLMClient()
