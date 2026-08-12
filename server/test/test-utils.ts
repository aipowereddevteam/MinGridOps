import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, disconnect } from 'mongoose';

export class TestDatabase {
  private mongod: MongoMemoryServer;
  private connection: Connection;

  async start() {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    const conn = await connect(uri);
    this.connection = conn.connection;
    return uri;
  }

  async stop() {
    if (this.connection) {
      await disconnect();
    }
    if (this.mongod) {
      await this.mongod.stop();
    }
  }

  async clearDatabase() {
    if (this.connection) {
      const collections = this.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    }
  }
}
