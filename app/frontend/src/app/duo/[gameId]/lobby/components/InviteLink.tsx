import { useState } from "react"
import { Button } from "../../../../../components/Button"

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
        <Button
            variant="secondary"
            className={`transition-all duration-500 w-3/4 shadow-md font-extrabold border
                ${copied ? 'bg-fil-deepYellow  text-fil-deepBlue' : 'bg-fil-deepBlue text-white border-fil-blue'}
              `}
            label={copied ? "Copied!" : "Copy invite link"}
            onClick={handleCopy}
        />
    )
}