import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// --- Data Layer ---
const dataProvider = {
  async getSalesData() {
    // Check if Supabase keys exist in the environment
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const dataSource = process.env.DATA_SOURCE || 'csv';

    if (dataSource === 'supabase' && supabaseUrl && supabaseKey) {
      console.log('Fetching data from Supabase DB (sales_data table)...');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('sales_data')
        .select('*')
        .order('date', { ascending: true });
        
      if (error) {
        throw new Error(`Supabase Error: ${error.message}`);
      }
      return data;
    } 
    
    // Fallback if no Supabase keys: local CSV reading
    console.log('Fetching data from local CSV (Fallback)...');
    
    const csvFilePath = path.join(__dirname, 'src', 'data', 'sales_data.csv');
    const csvFile = fs.readFileSync(csvFilePath, 'utf8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(new Error('Failed to parse CSV'))
      });
    });
  }
};

app.get('/api/sales', async (req, res) => {
  try {
    const data = await dataProvider.getSalesData();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to read data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Server running gracefully on http://localhost:${PORT}`);
});
