type RadionOption<Value extends string | number> = {
    label: string
    value: Value
}

type Props<Value extends string | number> = {
    options: RadionOption<Value>[]
    selected: Value
    onChange: (value: Value) => void
}

export const RadioGroup = <Value extends string | number>({ options, selected, onChange }: Props<Value>) => {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {options.map((option) => (
                <button
                    type="button"
                    value={option.value}
                    onClick={() => onChange(option.value)}
                    className={`px-4 py-2 rounded-xl font-medium border transition-colors duration-200
                            ${selected === option.value ? 'bg-fil-blue text-white' : 'bg-white text-fil-darkText'}`
                    }
                    key={option.value}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}