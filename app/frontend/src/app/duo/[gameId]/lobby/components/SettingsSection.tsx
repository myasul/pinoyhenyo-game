import { CheckboxGroup } from "@/components/CheckboxGroup"
import { RadioGroup } from "@/components/RadioGroup"
import { SupportedLanguages } from "@henyo/shared"

type Props = {
    duration: number
    passes: number
    languagesUsed: SupportedLanguages[]
    onChangeDuration: (duration: number) => void
    onChangePasses: (passes: number) => void
    onChangeLanguagesUsed: (languagesUsed: SupportedLanguages[]) => void
}

const LanguageOptions = [
    { label: 'English', value: SupportedLanguages.English },
    { label: 'Tagalog', value: SupportedLanguages.Tagalog },
]

const SettingsOptions = {
    duration: [30, 60, 90, 120],
    passes: [0, 1, 2, 3, 4, 5],
    languagesUsed: LanguageOptions,
}

export const SettingsSection = ({
    duration,
    passes,
    languagesUsed,
    onChangeDuration,
    onChangeLanguagesUsed,
    onChangePasses
}: Props) => (
    <section className="flex flex-col items-center text-center gap-3">
        <h1 className="text-3xl font-extrabold text-fil-deepBlue">Settings</h1>
        <div className="flex flex-col gap-2">
            <label className="font-extrabold">Duration (seconds)</label>
            <RadioGroup
                options={SettingsOptions.duration.map((value) => ({
                    label: value.toString(),
                    value,
                }))}
                selected={duration}
                onSelect={onChangeDuration}
            />
        </div>
        <div className="flex flex-col gap-2">
            <label className="font-extrabold">Passes</label>
            <RadioGroup
                options={SettingsOptions.passes.map((value) => ({
                    label: value.toString(),
                    value,
                }))}
                selected={passes}
                onSelect={onChangePasses}
            />
        </div>
        <div className="flex flex-col gap-2">
            <label className="font-extrabold">Languages Used</label>
            <CheckboxGroup
                options={SettingsOptions.languagesUsed}
                selected={languagesUsed}
                onSelect={onChangeLanguagesUsed}
            />
        </div>
    </section>
)