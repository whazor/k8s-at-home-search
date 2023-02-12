[k8s_gateway](https://github.com/ori-edge/k8s_gateway) is a CoreDNS plugin that resolves all types of external Kubernetes resources. 

It will gather all domains from all services, ingresses, and HTTPRoutes resources and create a DNS record for each of them, corresponding to the service IPs. This ensures that all external resources are resolved from within the cluster, and traffic is not leaving the cluster.

Most people deploy the k8s_gateway together with CoreDNS and call the Helm Release 'k8s-gateway'. This can be supplimenting along side the kube-dns or default CoreDNS from k3s.