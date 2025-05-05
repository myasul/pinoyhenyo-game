import { Check, X } from "react-feather"
import { WaveButton } from "./WaveButton"

type Props = {
    onBack?: () => void
    onContinue?: () => void
    isBackDisabled?: boolean
    isContinueDisabled?: boolean
    continueLabel?: React.ReactNode
    backLabel?: React.ReactNode
}

export const Footer = ({
    onBack,
    onContinue,
    isBackDisabled = false,
    isContinueDisabled = false,
    continueLabel = <Check size='28' strokeWidth='2.5' />,
    backLabel = <X size='28' strokeWidth='2.5' />
}: Props) => {
    return (
        <footer className="flex w-full gap-2">
            <WaveButton
                bgColor='bg-fil-deepBlue'
                textColor='text-white'
                className='w-1/4 border border-fil-blue'
                disabled={isBackDisabled}
                onClick={onBack}
            >
                {backLabel}
            </WaveButton>
            <WaveButton
                onClick={onContinue}
                disabled={isContinueDisabled}
                className="w-full border border-fil-yellow"
            >
                {continueLabel}
            </WaveButton>
        </footer>
    )
}