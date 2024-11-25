const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const namespace = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/namespace").toString();

const kc = new k8s.KubeConfig();
kc.loadFromCluster();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

// need a separate api client for custom objects
const routeApi = kc.makeApiClient(k8s.CustomObjectsApi);

async function createBot(username) {
    let botYaml = k8s.loadYaml(fs.readFileSync(process.cwd() + "/mindcraft_bot_template.yaml").toString());
    let pod = botYaml.pod;

    pod.metadata.generateName = `${username}-`;
    pod.spec.containers[0].env.push({name: "USERNAME", value: username});
    pod.spec.containers[0].env.push({name: "MINECRAFT_SERVER_HOST", value: process.env.MINECRAFT_SERVER_HOST});
    pod.spec.containers[0].env.push({name: "MINECRAFT_SERVER_PORT", value: process.env.MINECRAFT_SERVER_PORT});
    pod.spec.containers[0].env.push({name: "MINECRAFT_SERVER_VERSION", value: process.env.MINECRAFT_SERVER_VERSION});
    pod.spec.containers[0].env.push({name: "CHAT_MODEL_SERVER", value: process.env.CHAT_MODEL_SERVER});
    pod.spec.containers[0].env.push({name: "CHAT_MODEL_NAME", value: process.env.CHAT_MODEL_NAME});
    pod.spec.containers[0].env.push({name: "CHAT_MODEL_API_KEY", value: process.env.CHAT_MODEL_API_KEY});
    pod.spec.containers[0].env.push({name: "EMBEDDING_MODEL_SERVER", value: process.env.EMBEDDING_MODEL_SERVER});
    pod.spec.containers[0].env.push({name: "EMBEDDING_MODEL_NAME", value: process.env.EMBEDDING_MODEL_NAME});
    pod.spec.containers[0].env.push({name: "EMBEDDING_MODEL_API_KEY", value: process.env.EMBEDDING_MODEL_API_KEY});
    pod.spec.containers[0].env.push({name: "ELASTICSEARCH_SERVER", value: process.env.ELASTICSEARCH_SERVER});
    pod.spec.containers[0].env.push({name: "ELASTICSEARCH_USERNAME", value: process.env.ELASTICSEARCH_USERNAME});
    pod.spec.containers[0].env.push({name: "ELASTICSEARCH_PASSWORD", value: process.env.ELASTICSEARCH_PASSWORD});
    pod.spec.containers[0].env.push({name: "NODE_TLS_REJECT_UNAUTHORIZED", value: "0"});
    pod.spec.containers[0].env.push({name: "PROFILE", value: process.env.PROFILE});
    pod.spec.containers[0].image = process.env.MINDCRAFT_IMAGE;

    // Create pod and retrieve its name
    const res = await k8sApi.createNamespacedPod(namespace, pod);
    let matches = res.body.metadata.name.matchAll(/-(.[a-z0-9]+)$/g);
    let botGuid = matches.next().value[1];
    let botName = `${username}_${botGuid}`;

    // Add a label to the pod so we can route to it
    const patch = [
        {
            op: 'replace',
            path: '/metadata/labels',
            value: {
                botName: botName,
            },
        },
    ];
    const options = { headers: { 'Content-Type': k8s.PatchUtils.PATCH_FORMAT_JSON_PATCH } };
    k8sApi.patchNamespacedPod(`${username}-${botGuid}`, namespace, patch, undefined, undefined, undefined, undefined, undefined, options);

    // Create routing to the pod so we can view prismarine viewer
    let service = botYaml.service;
    service.metadata.name = `${username}-${botGuid}`;
    service.metadata.labels.botName = botName;
    service.spec.selector.botName = botName;
    await k8sApi.createNamespacedService(namespace, service);

    let route = botYaml.route;
    route.metadata.name = `${username}-${botGuid}`;
    route.spec.to.name = `${username}-${botGuid}`;
    route.metadata.labels.botName = botName;
    await routeApi.createNamespacedCustomObject("route.openshift.io", "v1", namespace, "routes", route);

    console.log(`Bot ${botName} created`);
    return botName;
};

module.exports = {
    createBot
};
