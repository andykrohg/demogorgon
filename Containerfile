FROM registry.access.redhat.com/ubi9/nodejs-18:1-123.1726663411

COPY . /app
WORKDIR /app
USER root
RUN npm install && \
    chown -R 1001:0 /app && \
    chmod -R g=u /app
RUN curl -L https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest-4.16/openshift-client-linux.tar.gz -o /tmp/oc.tar.gz && \
    tar xvzf /tmp/oc.tar.gz -C /usr/local/bin oc
USER 1001

ENV MINECRAFT_SERVER_HOST=localhost \ 
    MINECRAFT_SERVER_PORT=8080

EXPOSE 8082
    
ENTRYPOINT ["npm", "start"]
