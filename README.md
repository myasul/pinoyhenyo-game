# Pinoy Henyo 🧠💡

A digital version of the classic Filipino word-guessing game. Play online with friends and family!

## 🎮 About the Game

Pinoy Henyo is a popular Filipino party game where one player has to guess a word/phrase on their forehead based on yes/no/maybe questions they ask their partner.

## ✨ Features

- 👥 Duo Mode: Play with a friend - one as the Clue Giver and one as the Guesser
- ⚙️ Customizable Settings: Adjust game duration, number of passes, and languages used
- 🔄 Real-time Communication: Instant feedback between players using WebSockets
- 📱 Mobile-Friendly: Responsive design works on both desktop and mobile devices

## 📂 Project Structure
This project uses a monorepo structure:

- `app/frontend` - Next.js frontend application
- `app/backend` - Node.js backend server (Socket.IO)
- `shared` - Shared TypeScript types and constants

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (v20.18.1 or later recommended)
- Yarn (for package management)
- Supabase account (for backend database)

### 🛠️ Setting up the Frontend

1. Navigate to the root directory and install dependencies:
   ```
   yarn install
   ```

2. Create a `.env` file in the frontend directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001 # or your backend URL
   ```

3. Run the development server:
   ```
   yarn workspace frontend dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### ⚙️ Setting up the Backend

1. Create a `.env` file in the backend directory:
   ```
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. Run the development server:
   ```
   yarn workspace backend dev
   ```

### 🗃️ Setting up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. After creating your project, go to Settings > API to find your:
   - Project URL
   - API Keys (anon key and service role key)

3. Create the necessary tables and types in Supabase:

   - **Create enum types**:
     ```sql
     CREATE type language as ENUM('ENGLISH', 'TAGALOG');
     CREATE type category as ENUM('PERSON', 'OBJECT', 'PLACE', 'FOOD','NATURE','ACTION');
     ```

   - **guess_word** table:
     ```sql
     CREATE TABLE guess_word (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       word TEXT NOT NULL,
       category category NOT NULL,
       language language NOT NULL
     );
     ```

4. Create the stored procedure for getting random guess words:
   ```sql
   create or replace function get_random_guess_words(languages text[], count int)
   returns setof guess_word as $$
   begin
     if array_length(languages, 1) is null then
       -- If no languages are provided, return words in any language
       return query
       select *
       from guess_word
       order by random()
       limit count;
     else
       return query
       select *
       from guess_word
       where lower(language) = any (array(select unnest(languages)))
       order by random()
       limit count;
     end if;
   end;
   $$ language plpgsql;
   ```

5. Insert some initial words in your database for the game.

## Deployment

### Frontend
```bash
yarn workspace frontend build
# Deploy to Vercel, Netlify, or your preferred platform
```

### Backend
```bash
yarn workspace backend build
# Deploy to Railway, Heroku, or your preferred platform
```

## How to Play

1. Open http://localhost:3000 in your browser
2. Click "New Game"
3. Share the game link with a friend
4. Configure game settings (duration, passes, languages)
5. Start the game
6. The Clue Giver sees a word and answers yes/no questions
7. The Guesser asks questions to figure out the word before time runs out

## License

MIT License

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## Acknowledgements

- Inspired by the classic Filipino party game "Pinoy Henyo"
- Built with love for the Filipino community worldwide
