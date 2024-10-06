const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const token = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/token").toString();
const namespace = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/namespace").toString();

const cluster = {
    name: 'internal-server',
    server: 'https://kubernetes.default.svc',
    skipTLSVerify: true
};

const user = {
    token: token
};

const context = {
    name: 'my-context',
    user: user.name,
    cluster: cluster.name,
};

const kc = new k8s.KubeConfig();
kc.loadFromOptions({
    clusters: [cluster],
    users: [user],
    contexts: [context],
    currentContext: context.name,
});
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

async function createBot(username) {
    let pod = k8s.loadYaml(fs.readFileSync(process.cwd() + "/mindcraft_pod_template.yaml").toString());

    // TODO: Update pod with my own env variables for Model server and stuff here

    const res = await k8sApi.createNamespacedPod(namespace, pod);
    let matches = res.body.metadata.name.matchAll(/-(.[a-z0-9]+)$/g);
    let botName = `${username}_${matches.next().value[1]}`;
    console.log(`Bot ${botName} created`);
    return botName;
};

module.exports = {
    createBot
};
