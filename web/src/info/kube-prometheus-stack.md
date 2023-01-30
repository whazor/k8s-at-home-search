[kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) is a Helm collection that deploys:
- [Grafana](https://grafana.com/grafana/) for dashboarding
- [Prometheus](https://prometheus.io/) as metric database, together with an operator to manage it.
- [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) for exposing k8s metrics
- [prometheus-node-exporter](https://github.com/prometheus/node_exporter) for exposing node metrics
- [alertmanager](https://github.com/prometheus/alertmanager) for setting up alerts based on metrics or logs

Overall, kube-prometheus-stack is comperehensive and heavily configures all the tools.
