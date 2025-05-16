const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
require('dotenv').config({ path: '../app/backend/.env' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);
// Check if environment variables are set

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in the environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const csvFilePath = process.argv[2] || '/Users/matthewyasul/Code/side-projects/pinoyhenyo-game/guess_words.csv';

// Track statistics
let total = 0;
let inserted = 0;
let skipped = 0;
let errors = 0;

async function importWords() {
  console.log(`Importing words from: ${csvFilePath}`);

  const results = [];

  // Parse CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
      // Skip separator rows or empty entries
      if (data.word && data.word !== '-------') {
        results.push({
          word: data.word.trim(),
          category: data.category,
          language: data.language
        });
        total++;
      }
    })
    .on('end', async () => {
      console.log(`CSV parsing complete. Found ${total} valid entries.`);

      // Process each entry
      for (const entry of results) {
        try {
          // Check if word already exists
          const { data: existingData, error: checkError } = await supabase
            .from('guess_word')
            .select('id')
            .eq('word', entry.word)
            .limit(1);

          if (checkError) {
            console.error(`Error checking for existing word "${entry.word}":`, checkError);
            errors++;
            continue;
          }

          // If word doesn't exist, insert it
          if (existingData.length === 0) {
            const { error: insertError } = await supabase
              .from('guess_word')
              .insert([entry]);

            if (insertError) {
              console.error(`Error inserting "${entry.word}":`, insertError);
              errors++;
            } else {
              console.log(`✅ Inserted: ${entry.word} (${entry.category}, ${entry.language})`);
              inserted++;
            }
          } else {
            console.log(`⏩ Skipped duplicate: ${entry.word}`);
            skipped++;
          }
        } catch (error) {
          console.error(`Unexpected error processing "${entry.word}":`, error);
          errors++;
        }
      }

      // Print summary
      console.log('\n===== Import Summary =====');
      console.log(`Total entries processed: ${total}`);
      console.log(`Entries inserted: ${inserted}`);
      console.log(`Duplicates skipped: ${skipped}`);
      console.log(`Errors: ${errors}`);
      console.log('=========================');
    });
}

// Run the import
importWords();
