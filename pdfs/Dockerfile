FROM python:3.11.1-buster

LABEL org.opencontainers.image.source https://github.com/nathanhleung/lighthouse

WORKDIR /

RUN apt-get update
RUN apt-get --yes install poppler-utils

COPY . .
RUN chmod +x /start.sh

CMD [ "/start.sh" ]

EXPOSE 8000