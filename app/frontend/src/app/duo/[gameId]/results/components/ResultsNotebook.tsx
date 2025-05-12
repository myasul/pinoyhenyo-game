import React from "react"

type Props = {
    title: string
    mainWord: string
    resultMessage: string
    passedWords: string[]
    subtext: string
}

export const ResultsNotebook = ({ title, mainWord, resultMessage, passedWords, subtext }: Props) => {
    return (
        <div className="p-6 bg-fil-white rounded-lg shadow-md w-full max-w-md mx-auto border-4 border-fil-yellow">
            <h2 className="text-3xl font-bold mb-4 text-center text-fil-darkText">{title}</h2>
            <div className="text-center mb-5 flex flex-col gap-2">
                <p className="text-2xl font-semibold text-fil-deepBlue">&quot;{mainWord}&quot;</p>
                <p className="text-lg text-fil-darkText">{resultMessage}</p>
            </div>
            <hr className="border-fil-yellow mb-4" />
            <div>
                <p className="text-xl font-semibold mb-2 text-fil-deepRed">Passed Words:</p>
                <ul className="space-y-2">
                    {passedWords.map((word, index) => (
                        <li key={index} className="flex flex-col">
                            <span className="text-lg">❌ {word}</span>
                            <span className="border-b-2 border-fil-yellow w-full"></span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="text-center mt-6">
                {subtext}
            </div>
        </div>
    )
}
