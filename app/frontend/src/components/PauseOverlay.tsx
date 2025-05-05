
import { WaveButton } from "./WaveButton";
import { LogOut, Play } from "react-feather";

type Props = {
    onResume: () => void;
    onExit: () => void;
}

export const PauseOverlay = ({ onExit, onResume }: Props) => {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn'>
            <div
                className={`
                    w-11/12 max-w-sm p-6 rounded-2xl shadow-xl 
                    bg-fil-yellow text-fil-darkText flex flex-col 
                    gap-4 items-center animate-zoomIn`
                }
            >
                <h2 className="text-lg font-semibold text-gray-800">⏸️ Game Paused</h2>
                <div className="flex gap-4 w-full">
                    <WaveButton
                        bgColor="bg-fil-deepRed"
                        textColor="text-fil-yellow"
                        className="w-1/2 border border-fil-red"
                        onClick={onExit}
                    >
                        <LogOut size='28' strokeWidth='2.5' />
                    </WaveButton>
                    <WaveButton
                        className="w-1/2 border border-fil-yellow"
                        onClick={() => setTimeout(onResume, 300)}
                    >
                        <Play size='28' strokeWidth='2.5' />
                    </WaveButton>
                </div>
            </div>
        </div>
    )
}