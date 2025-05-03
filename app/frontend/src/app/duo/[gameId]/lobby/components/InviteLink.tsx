import { useState } from "react"
import { Button } from "../../../../../components/Button"

export const InviteLinkBtn = () => {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const inviteLink = window.location.href
        try {
            await navigator.clipboard.writeText(inviteLink)
            setCopied(true)

            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy invite link: ', err)
            setCopied(false)
        }
    }

    return (
        <Button
            variant="secondary"
            className={`transition-all duration-500 w-3/4
                ${copied ? 'bg-fil-yellow hover:bg-yellow-300 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
              `}
            label={copied ? "Copied!" : "Copy invite link"}
            onClick={handleCopy}
        />
    )
}