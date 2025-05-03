import { useState } from "react"
import { WaveButton } from "@/components/WaveButton"

export const InviteLinkBtn = () => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const inviteLink = window.location.href
        try {
            await navigator.clipboard.writeText(inviteLink)
            setCopied(true)

            setTimeout(() => setCopied(false), 1000)
        } catch (err) {
            console.error('Failed to copy invite link: ', err)
            setCopied(false)
        }
    }

    return (
        <WaveButton
            className="transition-all duration-500 w-3/4 shadow-md font-extrabold border border-fil-blue rounded-xl text-lg h-10"
            bgColor={copied ? 'bg-fil-deepYellow' : 'bg-fil-deepBlue'}
            textColor={copied ? 'text-fil-deepBlue' : 'text-white'}
            onClick={handleCopy}
        >
            {copied ? "Copied!" : "Copy invite link"}
        </WaveButton>
    )
}