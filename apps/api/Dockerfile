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

# ADD test_display_data.sql /docker-entrypoint-initdb.d/
# ADD test_room_data.sql /docker-entrypoint-initdb.d/
# RUN chown mysql:root /docker-entrypoint-initdb.d/test_display_data.sql
# RUN chown mysql:root /docker-entrypoint-initdb.d/test_room_data.sql

RUN sed -i 's/MYSQL_DATABASE/'${MYSQL_DATABASE}'/g' /etc/mysql/data.sql
RUN cp /etc/mysql/data.sql /docker-entrypoint-initdb.d

EXPOSE 3306
