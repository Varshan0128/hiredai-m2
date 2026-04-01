FROM python:3.10-slim

WORKDIR /app

COPY requirements_fullstack.txt .

RUN pip install --no-cache-dir -r requirements_fullstack.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
