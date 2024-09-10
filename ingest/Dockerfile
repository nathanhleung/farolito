from python:3.11.1-buster

LABEL org.opencontainers.image.source https://github.com/nathanhleung/farolito

WORKDIR /

COPY requirements.txt .
RUN apt-get update
RUN apt-get --yes install poppler-utils
RUN pip install -r requirements.txt

ADD api.py .

CMD [ "fastapi", "run", "/api.py" ]

EXPOSE 8000