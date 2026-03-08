import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const dataProvider = {
  async getSalesData() {
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
    
    console.log('Fetching data from local CSV (Fallback)...');
    
    // In Next.js, current working dir is root of project.
    const csvFilePath = path.join(process.cwd(), 'src', 'data', 'sales_data.csv');
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

export async function GET() {
  try {
    const data = await dataProvider.getSalesData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to read data' }, { status: 500 });
  }
}
