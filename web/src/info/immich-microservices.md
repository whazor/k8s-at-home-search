[Immich](https://github.com/immich-app/immich) is a self-hosted photo and video backup solution.

For immich, there are multiple helm deployments:

- [immich-web](./bjw-s.github.io-helm-charts-app-template-immich-web)
- [immich-server](./bjw-s.github.io-helm-charts-app-template-immich-server)
- [immich-typesense](./bjw-s.github.io-helm-charts-app-template-immich-typesense)
- [immich-machine-learning](./bjw-s.github.io-helm-charts-app-template-immich-machine-learning)
- [**immich-microservices**](./bjw-s.github.io-helm-charts-app-template-immich-microservices) **(this one)**

For redis and postgres, there are multiple helm charts:
- Redis: [app-template/redis](./bjw-s.github.io-helm-charts-app-template-immich-redis), [bitnami/redis](./charts.bitnami.com-bitnami-redis)
- PostgreSQL: operator [cloudnative-pg/cloudnative-pg](./cloudnative-pg.github.io-charts-cloudnative-pg-postgres), bitnami [bitnami/postgresql](./charts.bitnami.com-bitnami-postgresql)