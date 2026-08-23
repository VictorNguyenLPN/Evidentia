import json
import logging
from typing import Optional, Dict, Any

from backend.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

class GeminiLLMClient:
    """
    Wrapper for Google Gemini API.
    Supports Gemini 3.1 Flash Lite / Gemini 2.5 Flash Lite / configurable models.
    """
    def __init__(self, api_key: str = GEMINI_API_KEY, model_name: str = GEMINI_MODEL):
        self.api_key = api_key
        self.model_name = model_name
        self._genai_client = None
        if self.api_key:
            try:
                self._init_client()
            except Exception as e:
                logger.warning(f"Could not auto-initialize Gemini client during init: {e}")

    def is_configured(self) -> bool:
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

    def check_readiness(self) -> Dict[str, Any]:
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

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        """
        Generate response from Gemini model.
        """
        client = self.get_client()
        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
            if temperature is not None:
                config["temperature"] = temperature

            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config if config else None
            )

            # print(response.text.strip())

            return response.text.strip()
        except Exception as e:
            logger.error(f"Error invoking Gemini model ({self.model_name}): {e}", exc_info=True)
            raise e

    def generate_stream(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2
    ):
        """
        Generate streaming token chunks from Gemini model.
        """
        client = self.get_client()
        try:
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
            if temperature is not None:
                config["temperature"] = temperature

            response = client.models.generate_content_stream(
                model=self.model_name,
                contents=prompt,
                config=config if config else None
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Error streaming from Gemini model ({self.model_name}): {e}", exc_info=True)
            raise e

    def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.1
    ) -> Dict[str, Any]:
        """
        Generate structured JSON response.
        """
        json_instruction = (
            (system_instruction or "") +
            "\nIMPORTANT: Your response MUST be valid JSON only. Do not enclose in markdown code blocks like ```json ... ``` unless necessary, or ensure it is clean parsable JSON."
        ).strip()

        raw_output = self.generate(prompt=prompt, system_instruction=json_instruction, temperature=temperature)
        
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
            return json.loads(cleaned)
        except json.JSONDecodeError as err:
            logger.warning(f"Failed to parse JSON response from Gemini: {err}. Raw text: {raw_output}")
            return {"raw_text": raw_output, "error": "json_parse_failed"}

# Singleton instance
gemini_client = GeminiLLMClient()