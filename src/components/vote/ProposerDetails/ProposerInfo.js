import {withRouter} from "react-router-dom";
import {compose} from "redux";
import wallet from '../../../assets/icons/wallet.svg';
import {CopyToClipboard} from "react-copy-to-clipboard";
import toast from "../../UI/Toast";

const ProposerInfo = ({ address }) => {
    return (
        <div className="text-white">
            <div className="text-3xl text-primary">Details</div>
            <div className="flex items-center space-x-8 mt-2">
                <div className="text-xl">{address}</div>
                <CopyToClipboard
                    text={address}
                    onCopy={() => {
                        toast.success({
                            title: `Address copied`
                        });
                    }}
                >
                <img className="" src={wallet} alt="" />
                </CopyToClipboard>
            </div>
        </div>
    )
}


export default compose(withRouter)(ProposerInfo);
