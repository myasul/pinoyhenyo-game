import { Check, X } from "react-feather"
import { WaveButton } from "./WaveButton"

type Props = {
    onBack?: () => void
    onContinue?: () => void
    isBackDisabled?: boolean
    isContinueDisabled?: boolean
    continueLabel?: React.ReactNode
    backLabel?: React.ReactNode
    isBackHidden?: boolean
    isContinueHidden?: boolean
}

export const Footer = ({
    onBack,
    onContinue,
    isBackDisabled = false,
    isContinueDisabled = false,
    isBackHidden = false,
    isContinueHidden = false,
    continueLabel = <Check size='28' strokeWidth='2.5' />,
    backLabel = <X size='28' strokeWidth='2.5' />
}: Props) => {
    return (
        <footer className="flex w-full gap-2">
            {!isBackHidden && <WaveButton
                bgColor='bg-fil-deepBlue'
                textColor='text-fil-deepYellow'
                className={`border border-fil-blue ${isContinueHidden ? 'w-full' : 'w-1/4'}`}
                disabled={isBackDisabled}
                onClick={onBack}
            >
                {backLabel}
            </WaveButton>}
            {!isContinueHidden && <WaveButton
                onClick={onContinue}
                disabled={isContinueDisabled}
                className="w-full border border-fil-yellow"
            >
                {continueLabel}
            </WaveButton>}
        </footer>
    )
}