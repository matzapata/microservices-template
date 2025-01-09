import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Setup env variables for testing
process.env.JWT_KEY = "test-jwt-key";
process.env.FROM_EMAIL = "from-email";
process.env.HOST = "host";
process.env.MONGO_URI = "mongo-uri";
process.env.NATS_CLIENT_ID = "nats-client-id";
process.env.NATS_CLUSTER_ID = "nats-cluster-id";
process.env.NATS_URL = "nats-url";

let mongo: MongoMemoryServer;
beforeAll(async () => {
  // Initiate in-memory MongoDB server
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), {});
});

beforeEach(async () => {
  // Clean up the database before each test
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Close the connection to the in-memory MongoDB server
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
