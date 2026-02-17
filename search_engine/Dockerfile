FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for caching
COPY search_engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
# We copy everything into /app/search_engine so checking imports work
COPY search_engine /app/search_engine

# Expose port
EXPOSE 8000

# Run commands
# We set PYTHONPATH to include /app so search_engine package is found
ENV PYTHONPATH=/app

CMD ["uvicorn", "search_engine.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
