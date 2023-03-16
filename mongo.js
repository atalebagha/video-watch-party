const { MongoMemoryServer } = require('mongodb-memory-server'); // eslint-disable-line

(async function runMongo() {
	const mongod = await MongoMemoryServer.create();
  const uri = `${mongod.getUri()}`;
  // process.env.MONGODB_URI = uri;
  console.info('Mongo URI >>>> ', process.env.MONGODB_URI);
  process.send({ MONGODB_URI: uri })
}());
