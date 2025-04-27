import { supabase } from "../lib/supabase"

enum Category {
    Person = 'PERSON',
    Place = 'PLACE',
    Object = 'OBJECT',
    Nature = 'NATURE',
    Food = 'FOOD',
    Action = 'ACTION',
}

enum Language {
    English = 'ENGLISH',
    Tagalog = 'TAGALOG',
}

export type GuessWord = {
    word: string
    category: Category
    language: Language
}


// TODO: Add error handling
export const getRandomGuessWord = async () => {
    const { data, error } = await supabase.rpc('get_random_guess_words')

    if (error) {
        console.error(`Error fetching random guess words: ${error.message}`)
        return null
    }

    if (data.length === 0) {
        console.error('No random guess words found')
        return null
    }

    const randomGuessWord = data[0] as GuessWord

    return randomGuessWord.word
}