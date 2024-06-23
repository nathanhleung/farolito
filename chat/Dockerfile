from python:3.11.1-buster

WORKDIR /

COPY requirements.txt .
RUN pip install -r requirements.txt

ADD api.py .

CMD [ "python", "-u", "/api.py" ]