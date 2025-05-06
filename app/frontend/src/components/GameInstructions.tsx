import { DuoGameRole } from "@henyo/shared"

const GameInstructionsMap = {
    [DuoGameRole.Guesser]: "Ask a yes-or-no questions to figure out the word. Start by narrowing down the category (person, place, object, nature, food, action). Then keep guessing!!",
    [DuoGameRole.ClueGiver]: "Give clues by answering your partner's questions. You can only answer with 'yes', 'no', or 'maybe'.",
    [DuoGameRole.Unknown]: "Shouldn't be here",
}

export const GameInstructions = ({ role }: { role: DuoGameRole }) => (
    <div className="border-2 rounded-md p-2 w-full bg-white border-fil-deepYellow animate-pulseJoin text-fil-darkText shadow-md">
        {GameInstructionsMap[role]}
    </div>
)