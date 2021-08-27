import ConnectWalletModal from "./ConnectWalletModal";
import React, {useState} from "react";

const ConnectWalletButton = (props) => {
    const [connectWalletsOpen, setConnectWalletsOpen] = useState(false);
    return (
        <>
            <button
                className="bg-primaryLight py-2 rounded px-32 transition-all
                        h-12 text-black disabled:opacity-50
                        flex items-center justify-center"
                onClick={() => setConnectWalletsOpen(true)}
            >
                Connect Wallet
            </button>
            <ConnectWalletModal
                open={connectWalletsOpen}
                onSetOpen={() => setConnectWalletsOpen(true)}
                onCloseModal={() => setConnectWalletsOpen(false)}
            />
        </>
    )
}

export default ConnectWalletButton;
