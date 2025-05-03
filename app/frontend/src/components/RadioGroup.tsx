type RadioOption<Value extends string | number> = {
    label: string
    value: Value
}

type Props<Value extends string | number> = {
    options: RadioOption<Value>[]
    selected: Value
    onSelect: (value: Value) => void
}

export const RadioGroup = <Value extends string | number>({ options, selected, onSelect }: Props<Value>) => {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {options.map((option) => (
                <button
                    type="button"
                    value={option.value}
                    onClick={() => onSelect(option.value)}
                    className={`px-4 py-2 rounded-xl font-medium  border-2 transition-colors duration-200 shadow-md
                            ${selected === option.value ? 'bg-fil-blue text-white border-fil-deepBlue' : 'bg-white text-fil-darkText border-fil-blue'}`
                    }
                    key={option.value}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}