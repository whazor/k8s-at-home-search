[Node Feature Discovery](https://github.com/kubernetes-sigs/node-feature-discovery) is a Kubernetes add-on that helps automate the discovery and configuration of node features such as CPU, memory, and network interfaces.

Most people in k8s at home use Node Feature Discovery to ensure that pods that need video transcoding capabilities are running on a node with an Intel GPU (which has excellent video transcoding capabilities). But also for detecting a Zigbee/Z-Wave USB sticks.

For example, the following code would guarantee that a node will run on a Node with Intel GPU:
```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
          - key: feature.node.kubernetes.io/custom-intel-gpu
            operator: In
            values:
              - "true"
```

Node Feature Discovery, would figure out a node has an Intel GPU and add the `feature.node.kubernetes.io/custom-intel-gpu: true` label.