import { Collection, MongoClient } from 'mongodb';

export const MongoHelper = {
  client: null as MongoClient,

  async connect(url: string): Promise<void> {
    this.client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  },

  async disconnect(): Promise<void> {
    this.client.close()
  },

  getCollection(name: string): Collection {
    return this.client.db().collection(name);
  },

  idMapper(data: any):any {
    const { _id, ...account } = data;
    return { ...account, id: _id }
  }
}
