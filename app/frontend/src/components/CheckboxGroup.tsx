type CheckboxOption<Value extends string | number> = {
    label: string
    value: Value
}

type Props<Value extends string | number> = {
    options: CheckboxOption<Value>[]
    selected: Value[]
    isDisabled?: boolean
    onSelect: (selected: Value[]) => void
}

export const CheckboxGroup = <Value extends string | number>({ options, selected, isDisabled, onSelect }: Props<Value>) => {
    const handleSelect = (value: Value) => {
        const updatedSelected = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value]

        onSelect(updatedSelected)
    }

    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {options.map((option) => (
                <button
                    type="button"
                    value={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-2 rounded-xl font-medium  border-2 transition-colors duration-200 shadow-md
                            ${selected.includes(option.value) ? 'bg-fil-blue text-fil-deepBlue border-fil-deepBlue' : 'bg-white text-fil-darkText border-fil-blue'}
                            ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
                        `}
                    disabled={isDisabled}
                    key={option.value}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}