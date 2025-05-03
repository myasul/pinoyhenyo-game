type CheckboxOption<Value extends string | number> = {
    label: string
    value: Value
}

type Props<Value extends string | number> = {
    options: CheckboxOption<Value>[]
    selected: Value[]
    onSelect: (selected: Value[]) => void
}

export const CheckboxGroup = <Value extends string | number>({ options, selected, onSelect }: Props<Value>) => {
    const handleSelect = (value: Value) => {
        if (selected.includes(value)) {
            onSelect(selected.filter((v) => v !== value))
        } else {
            onSelect([...selected, value])
        }
    }

    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {options.map((option) => (
                <button
                    type="button"
                    value={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-2 rounded-xl font-medium border transition-colors duration-200
                            ${selected.includes(option.value) ? 'bg-fil-blue text-white' : 'bg-white text-fil-darkText'}`
                    }
                    key={option.value}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}