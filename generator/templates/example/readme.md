

# Example markdown print to console 

Use the README.md to print out instructions for the generated code

## Deployment with digital ocean

1. Go to digital ocean
2. Create a cluster with a load balancer
3. Install digital ocean cli `doctl`
4. Create digital ocean admin api key
5. `doctl auth init` authenticate with `doctl` 
6. `doctl kubernetes cluster kubeconfig save <cluster_name>` get connection info
7. `kubectl config view`
8. `kubectl config use-context <context_name>` Connect to cluster. With this you can also see logs, set secrets, etc. Same for going back to local
9. Set secrets, install nginx. Same instructions as for local above
10. Create github action for the service. Remember to add secrets in github.

```yaml
name: deploy-auth

on:
  push:
    branches:
      - main
    paths:
      - 'auth/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: cd auth && docker build -t matzapata/auth .
      - run: docker push matzapata/auth
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl kubernetes cluster kubeconfig save ticketing
      - run: kubectl rollout restart deployment auth-depl
```
