import json
import logging
import io
from app.core.logging import StructuredJSONFormatter, correlation_id_var, request_id_var


def test_structured_logging_scrubs_secrets():
    # Setup log capture stream
    stream = io.StringIO()
    handler = logging.StreamHandler(stream)
    formatter = StructuredJSONFormatter()
    handler.setFormatter(formatter)

    logger = logging.getLogger("test_guardian")
    logger.handlers = [handler]
    logger.setLevel(logging.INFO)

    correlation_id_var.set("test-corr-id-111")
    request_id_var.set("test-req-id-222")

    logger.info("Connecting with api_key='secret-gemini-key-999'")

    # Read formatted log output
    output = stream.getvalue().strip()
    log_json = json.loads(output)

    assert log_json["correlation_id"] == "test-corr-id-111"
    assert log_json["request_id"] == "test-req-id-222"
    assert "secret-gemini-key-999" not in log_json["message"]
    assert "[REDACTED_BY_GUARDIAN]" in log_json["message"]
