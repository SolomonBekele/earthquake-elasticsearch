import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  node: process.env.ELASTIC_NODE,
  auth: {
    // username: 'elastic',
    // password: process.env.ELASTIC_PASSWORD,
    apiKey: process.env.ELASTICSEARCH_SERVICEACCOUNTTOKEN
  },
});
client.ping().then(() => {
  console.log("Elasticsearch cluster is up!");
}).catch((error) => {
  console.error("Elasticsearch cluster is down!", error);
});

export default client;