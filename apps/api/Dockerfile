# MYSQL Version
FROM mysql:latest

RUN chown -R mysql:root /var/lib/mysql/

ARG MYSQL_DATABASE
ARG MYSQL_USER
ARG MYSQL_PASSWORD
ARG MYSQL_ROOT_PASSWORD
ARG MYSQL_PORT
ARG DB_HOST

ENV MYSQL_DATABASE=$MYSQL_DATABASE
ENV MYSQL_USER=$MYSQL_USER
ENV MYSQL_PASSWORD=$MYSQL_PASSWORD
ENV MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
ENV MYSQL_PORT=$MYSQL_PORT
ENV DB_HOST=$DB_HOST

ADD test_data.sql /etc/mysql/data.sql

RUN sed -i 's/MYSQL_DATABASE/'${MYSQL_DATABASE}'/g' /etc/mysql/data.sql
RUN cp /etc/mysql/data.sql /docker-entrypoint-initdb.d

EXPOSE 3306

# # Add wait-for-it
# COPY wait-for-it.sh wait-for-it.sh 
# RUN chmod +x wait-for-it.sh
# CMD ["./wait-for-it.sh", "api:3306", "--strict" , "--timeout=300" ,'ECHO successfuly waited']
