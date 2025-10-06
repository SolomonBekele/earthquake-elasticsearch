import epress from 'express';
import cors from 'cors';
import client from './elasticsearch/client.js';
import data from './data_management/retrieve_and_ingest_data.js';
import dotenv from 'dotenv';

dotenv.config();

const app = epress();
const port = process.env.PORT || 3004;

app.use(epress.json());
app.use(cors());
app.use('/ingest_data', data);
app.get('/results', (req, res) => {
  const passedType = req.query.type;
  const passedMag = req.query.mag;
  const passedLocation = req.query.location;
  const passedDateRange = req.query.dateRange;
  const passedSortOption = req.query.sortOption;
  

  async function sendESRequest() {
    const body = await client.search({
      index: 'earthquakes',
      body: {
        sort: [
          {
            mag: {
              order: passedSortOption,
            },
          },
        ],
        size: 300,
        query: {
          bool: {
            filter: [
              {
                term: { type: passedType },
              },
              {
                range: {
                  mag: {
                    gte: passedMag,
                  },
                },
              },
              {
                match: { place: passedLocation },
              },
              // for those who use prettier, make sure there is no whitespace.
              {
                range: {
                  '@timestamp': {
                    gte: `now-${passedDateRange}d/d`,
                    lt: 'now/d',
                  },
                },
              },
            ],
          },
        },
      },
    });
    res.json(body.hits.hits);
  }
  sendESRequest();
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});