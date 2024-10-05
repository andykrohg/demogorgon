FROM registry.access.redhat.com/ubi8/nodejs-18:1-127

COPY . /app
WORKDIR /app
USER root
RUN npm install && \
    chown -R 1001:0 /app && \
    chmod -R g=u /app
USER 1001

ENV MINECRAFT_SERVER_HOST=localhost \ 
    MINECRAFT_SERVER_PORT=8080
    
EXPOSE 8082
    
ENTRYPOINT ["npm", "start"]
