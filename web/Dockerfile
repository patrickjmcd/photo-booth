FROM tiangolo/uvicorn-gunicorn-starlette:python3.7
RUN pip install aiofiles redis
COPY ./src /app

# FROM python:3.7
# RUN pip install fastapi uvicorn aoifiles redis
# EXPOSE 80
# COPY ./src /app
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]