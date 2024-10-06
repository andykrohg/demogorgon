const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const namespace = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/namespace").toString();

const kc = new k8s.KubeConfig();
kc.loadFromCluster();
const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

async function createBot(username) {
    let pod = k8s.loadYaml(fs.readFileSync(process.cwd() + "/mindcraft_pod_template.yaml").toString());

    // TODO: Update pod with my own env variables for Model server and stuff here
    pod.spec.containers[0].env.push({name: "USERNAME", value: username});
    const res = await k8sApi.createNamespacedPod(namespace, pod);
    let matches = res.body.metadata.name.matchAll(/-(.[a-z0-9]+)$/g);
    let botName = `${username}_${matches.next().value[1]}`;

    console.log(`Bot ${botName} created`);
    return botName;
};

module.exports = {
    createBot
};
