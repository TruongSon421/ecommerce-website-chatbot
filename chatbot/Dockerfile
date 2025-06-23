# Sử dụng base image có sẵn build tools
FROM python:3.11

WORKDIR /app

# Install additional dependencies nếu cần
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        cmake && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./src .

# Environment variables
ENV PYTHONPATH=/app

EXPOSE 5500

CMD ["uvicorn", "main:asgi_app", "--host", "0.0.0.0", "--port", "5500"]