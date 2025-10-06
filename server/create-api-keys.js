import client from "./elasticsearch/client.js";
import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

async function createApiKey() {
  try {
    const body = await client.security.createApiKey({
      body: {
        name: "earthquakes_app_key",
        expiration: "30d", // Set expiration for security
        role_descriptors: {
          earthquakes_app_role: {
            cluster: ["monitor"],
            indices: [  // Use "indices" instead of "index"
              {
                names: ["earthquakes"],
                privileges: ["create_index", "write", "read", "manage"]
              }
            ]
          }
        }
      }
    }); 
    
    console.log("✅ API Key created successfully!");
    console.log("API Key ID:", body.id);
    console.log("API Key Name:", body.name);
    
    // Create the encoded API key (id:api_key)
    const encodedApiKey = Buffer.from(`${body.id}:${body.api_key}`).toString('base64');
    console.log("🔑 Encoded API Key:", encodedApiKey);
    
    return encodedApiKey;
    
  } catch (error) {
    console.error("❌ Error creating API Key:");
    console.error("Error details:", error.meta?.body?.error || error.message);
    throw error;
  }
}

// Create and test the API key
async function main() {
  try {
    const apiKey = await createApiKey();
    
    // Test the new API key
    await testApiKey(apiKey);
    
  } catch (error) {
    console.error("Failed to create API key:", error.message);
  }
}

// Test the API key
async function testApiKey(encodedApiKey) {
  try {
    // Create a new client with the API key
    const testClient = new Client({
      node: process.env.ELASTIC_NODE,
      auth: {
        apiKey: encodedApiKey
      }
    });
    
    // Test the API key
    await testClient.ping();
    console.log("✅ API Key test: Connection successful!");
    
    // Test if we can create the earthquakes index
    await testClient.indices.create({
      index: 'earthquakes',
      body: {
        mappings: {
          properties: {
            magnitude: { type: 'float' },
            location: { type: 'text' },
            timestamp: { type: 'date' },
            coordinates: { type: 'geo_point' }
          }
        }
      }
    });
    console.log("✅ API Key test: Index creation successful!");
    
  } catch (error) {
    console.error("❌ API Key test failed:", error.meta?.body?.error?.reason);
  }
}

main();