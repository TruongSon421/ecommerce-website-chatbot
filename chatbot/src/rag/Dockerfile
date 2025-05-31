# Sử dụng Python 3.9 slim image
FROM python:3.9-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép requirements file trước để tận dụng Docker layer caching
COPY requirements.txt .

# Cài đặt dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Thiết lập environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Chạy ứng dụng
CMD ["python", "app.py"]