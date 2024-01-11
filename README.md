
# Microservices template

# Generator

Make use of the generator to leverage your development speed.

# Instructions

## Running and debugging

1. Setup kubectl secrets.
2. Setup the local development domain in hosts
3. Start all services with skaffold -> `skaffold dev`. You should see the logs right away.
4. Do changes, skaffold will handle reloading

## Common package

1. Publish the common npm package

To do so, first pick a name for your common package, for example: `@username/common-project-name`.
Then login to npm -> `npm login`
And lastly publish it with -> `npm publish --access public` (ideally it's private but you'll pay for it)

2. Each time you issue updates to the common package do `npm patch` or similar accordingly to update the version of the package and `npm run clean && npm run build && npm publish`

## Ingress NGINX events

Check here quick start here: https://kubernetes.github.io/ingress-nginx/deploy/ 
At the moment:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

This is used for your `ingress-srv.yaml` so set up the host in `/etc/hosts` adding

```txt
127.0.0.1	microservices-base.com 
```


## Create a new express microservice

1. Setup the express server from the base. Copy paste.
2. Create an image with `docker build -t [tag=username/project-name_service-name] .` and later push it with `docker push [tag]`
3. Create kubernetes deployment. Example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          image: matzapata/auth
---
apiVersion: v1
kind: Service
metadata:
  name: auth-srv
spec:
  selector:
    app: auth
  ports:
    - name: auth
      protocol: TCP
      port: 3000
      targetPort: 3000
```

Change the name. Make sure the port matches with the app.listen.
The service portion exposes that service inside the cluster so if it won't communicate with anyone remove it. Also, here you can set secrets.

3. Update the `skaffold.yaml` adding the new artifact with your image tag

```yaml
apiVersion: skaffold/v2alpha3
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
      - ./infra/k8s-dev/*
build:
  local:
    push: false
  artifacts:
    - image: matzapata/auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.ts'
            dest: .
    
```

4. Update ingress controller if you need to expose any endpoint

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-service
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: 'true'
spec:
  rules:
    - host: ticketing.dev
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: auth-srv # this is your service name from the deployment in infra/k8s/name-depl.yaml
                port:
                  number: 3000
```

3. Create github action for deployment

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

4. Create github action for testing

```yaml
name: tests-auth

on:
  pull_request:
    paths:
      - 'auth/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd auth && npm install && npm run test:ci
```


## Add new environment variable to a service

Make sure to stay in the correct kubectl context.
Run:

```bash
kubectl create secret generic [secret-name] --from-literal=[key]=[value]
```

Add it to your `/infra/k8s/service-depl.yaml` like this:

```yaml
spec:
      containers:
        - name: auth
          image: matzapata/auth
          env:
			- name: MONGO_URI
				value: 'not secret' 
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
```

Add it to `src/env.ts` to check on it:

```ts
import { from, logger }from 'env-var';

// Log missing env variables
const env = from(process.env, {}, logger)

// Export env variables
export const JWT_KEY: string = env.get('JWT_KEY').required().asString();
// Add it here...
```

Import it wherever necessary from here.

## Notes on testing

Remember testing happens outside of the containers, so don't count with services running, use mocks.

### Nats and events

Create tests for the listeners that contain business logic. Use the mock of the nats wrapper. Check down below there's an example

### Mongodb

Use `mongodb-memory-server` -> https://www.npmjs.com/package/mongodb-memory-server

```ts
let mongo: any;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
```

### Express

Use `supertest`

### Redis

Use `RedisMemoryServer` -> https://www.npmjs.com/package/redis-memory-server

### Postgress

Use `pg-mem` -> https://www.npmjs.com/package/pg-mem

### Authentication

Mock auth middleware

## Events, listeners, publishers and types

### Create new event:

1. In common create a subject in `src/events/subjects.ts`
2. In common create a event type in `src/events/name-event.ts` and define the data

```ts
import { Subjects } from "./subjects";
import { OrderStatus } from "./types/order-status";

export interface ExampleEvent {
  subject: Subjects.EXAMPLE_SUBJECT;
  data: {
    id: string;
    version: number;
    status: OrderStatus;
    userId: string;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
```

3. Export it from index.ts


### Publish new event

1. Create a publisher from the base published in `src/events/publishers/event-name-publisher.ts`

```ts
import { Subjects, Publisher, OrderCancelledEvent } from '@matzapata/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
```

Publish an event:


```ts
new OrderCancelledPublisher(natsWrapper.client).publish({
  id: order.id,
  version: order.version,
  ticket: {
    id: order.ticket.id
  }
});
```


### Listen to new event

Create a listener from a base listener:

```ts
import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@matzapata/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    // NOTE: Here all the business logic we do on the event

    const ticket = await Ticket.findByEvent(data);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack(); // NOTE: Important, this tells nats to not retry the message
  }
}
```

Start listening events in the index file:

```ts
const start = async () => {
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    // More listeners
    
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!!!!!!!!');
  });
}
```

Create a test for the listener:

```ts
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@matzapata/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 999,
    userId: 'ablskdjf',
  };

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { msg, data, ticket, listener };
};

it('finds, updates, and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
```


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

## Logs

https://www.loggly.com/blog/effective-logging-in-node-js-microservices/
https://www.appsignal.com/plans
https://blog.appsignal.com/2023/05/18/transport-your-logs-with-winston-to-appsignal.html

## Emails

Nodemailer
https://www.mailersend.com/pricing

## UI

For designs refer to `https://preline.co/docs/index.html`
Make use of the classname library for combining classes.
Check button.tsx as an example


# TODO

- TODO: Auth with passport for google oauth
- TODO: Check merging updates strategy
- TODO: Complete generator templates

