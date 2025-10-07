import express from 'express';
import axios from 'axios';
import client from '../elasticsearch/client.js';
// import logTimestamp from 'log-timestamp';

const router = express.Router();

const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

router.get('/earthquakes', async (req, res) => {
  console.log('Loading Application...');
  res.json('Running Application...');

  // Define indexData as a named async function
  const indexData = async () => {
    try {
      console.log('Retrieving data from the USGS API...');

      const EARTHQUAKES = await axios.get(URL, {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });

      console.log('Data retrieved!');

      const results = EARTHQUAKES.data.features;
      console.log(`Retrieved ${results.length} earthquake records.`);

      console.log('Indexing data into Elasticsearch...');

      // Use for...of for async/await instead of map
      for (const quake of results) {
        const earthquakeObject = {
          place: quake.properties.place,
          time: quake.properties.time,
          tz: quake.properties.tz,
          url: quake.properties.url,
          detail: quake.properties.detail,
          felt: quake.properties.felt,
          cdi: quake.properties.cdi,
          alert: quake.properties.alert,
          status: quake.properties.status,
          tsunami: quake.properties.tsunami,
          sig: quake.properties.sig,
          net: quake.properties.net,
          code: quake.properties.code,
          sources: quake.properties.sources,
          nst: quake.properties.nst,
          dmin: quake.properties.dmin,
          rms: quake.properties.rms,
          mag: quake.properties.mag,
          magType: quake.properties.magType,
          type: quake.properties.type,
          longitude: quake.geometry.coordinates[0],
          latitude: quake.geometry.coordinates[1],
          depth: quake.geometry.coordinates[2],
        };

        await client.index({
          index: 'earthquakes',
          id: quake.id,
          body: earthquakeObject,
          pipeline: 'earthquake_data_pipeline',
        });
      }
      console.log('✅ All data has been indexed successfully!');
    } catch (err) {
      console.error('❌ Error while indexing data:', err.message);
    }

    console.log('Preparing for the next round of indexing...');
  };

  // Run the function once when endpoint is hit
  await indexData();
});

export default router;
