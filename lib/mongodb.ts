import { Db, MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "promesse";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise() {
  if (clientPromise) return clientPromise;
  if (global.__mongoClientPromise) return global.__mongoClientPromise;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to your environment variables.");
  }

  const nextPromise = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
    socketTimeoutMS: 5000
  })
    .connect()
    .catch((error) => {
      if (clientPromise === nextPromise) {
        clientPromise = undefined;
      }
      if (global.__mongoClientPromise === nextPromise) {
        global.__mongoClientPromise = undefined;
      }
      throw error;
    });

  clientPromise = nextPromise;

  if (process.env.NODE_ENV !== "production") {
    global.__mongoClientPromise = clientPromise;
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
