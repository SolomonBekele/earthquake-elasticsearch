import epress from 'express';
import cors from 'cors';
import client from './elasticsearch/client.js';
import dotenv from 'dotenv';

dotenv.config();

const app = epress();
const port = process.env.PORT || 3004;

app.use(epress.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});