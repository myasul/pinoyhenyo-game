import { DuoGameRole } from "shared"

const GameInstructionsMap = {
    [DuoGameRole.Guesser]: "Ask a yes-or-no questions to figure out the word. Start by narrowing down the category (person, place, object, nature, food, action). Then keep guessing!!",
    [DuoGameRole.ClueGiver]: "Give clues by answering your partner's questions. You can only answer with 'yes','no', or 'maybe'.",
}

export const GameInstructions = ({ role }: { role: DuoGameRole }) => (
    <div className="border-gray-300 border rounded-md p-2 w-full bg-fil-yellow">
        {GameInstructionsMap[role]}
    </div>
)