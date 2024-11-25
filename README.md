# Demogorgon
Server relay for a multi-mindcraft bot environment. This project also provides a frontend for users to join a game and transmit messages to their bot.

## Prerequisites
* NodeJS 18
* A Kubernetes cluster (tested with OpenShift 4.16)
* A Minecraft server (tested with 1.19.4)

## Running the server
At the moment, it's only supported to run this server on a Kubernetes cluster, since access to an internal Kubernetes service is expected.

You can deploy it to OpenShift like this:
```bash
oc new-app \
    -e MINECRAFT_SERVER_HOST=minecraft-server \
    -e MINECRAFT_SERVER_PORT=8080 \
    -e MINECRAFT_SERVER_VERSION=1.20.4 \
    -e CHAT_MODEL_SERVER=http://localhost:8080 \
    -e CHAT_MODEL_NAME=gpt-4 \
    -e CHAT_MODEL_API_KEY=blah \
    -e EMBEDDING_MODEL_SERVER=http://localhost:8080 \
    -e EMBEDDING_MODEL_NAME=nomic-embed-text \
    -e EMBEDDING_MODEL_API_KEY=blah \
    -e ELASTICSEARCH_SERVER=http://localhost:9200 \
    -e ELASTICSEARCH_USERNAME=elastic \
    -e ELASTICSEARCH_PASSWORD=blah \
    -e PROFILE=demojam \
    quay.io/akrohg/demogorgon

oc expose svc/demogorgon

# demogorgon needs edit privileges to be able to spawn pods in its namespace
oc adm policy add-role-to-user edit -z default
```

Then open the route in your browser.
