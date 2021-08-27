import Modal from "../../UI/Modal";
import closeWhite from '../../../assets/icons/closeWhite.svg';
import ReactMarkdown from 'react-markdown';

const ActionModal = ({
    proposal,
    visible,
    onClose,

}) => {

    const getTitle = descs => {
        const index = descs.findIndex(d => d !== '');
        if (index !== -1) {
            return descs[index];
        }
        return '';
    };

    const title = (
        <div
            className="flex justify-between items-center mt-4 mx-4 sm:mx-12 py-6
                  border-b border-solid border-lightGray"
        >
            <div className=""/>
            <div className="text-center text-36 font-bold">{getTitle(proposal.description?.split('\n'))}</div>
            <button
                className="focus:outline-none py-2 mb-2 rounded-md text-24 text-black"
                onClick={onClose}
            >
                <img src={closeWhite} alt="" />
            </button>
        </div>
    );

    const content = (
        <div className="py-6 mx-4 sm:mx-12 overflow-auto">
            <div className="text-24">Actions</div>
            {(proposal.actions || []).map((s, idx) => (

                <div className="flex mt-6" key={idx}>
                    <p
                        className="text-base"
                    >
                        {s.title}
                    </p>
                </div>
            ))}
        </div>
    )

    return (
        <div>
            <Modal
                title={title}
                content={content}
                open={visible}
                onCloseModal={onClose}
                afterCloseModal={() => {}}
                width="max-w-900"
            />
        </div>
    )
}

ActionModal.defaultProps = {
    proposal: {},
    visible: false,
    onClose: () => {}
}

export default ActionModal;
