import ReactMarkdown from 'react-markdown';

const ProposalDetails = ({ proposalInfo }) => {
    return (
        <div className="col-span-5 bg-fadeBlack rounded-2xl p-4">
            <div className="text-primary text-xl font-bold">Operation</div>
            <div className="flex flex-col space-y-1 mt-2 text-white pl-8">
                {(proposalInfo.actions || []).map((s, idx) => (
                    <ReactMarkdown
                        className="text-xl"
                        key={idx}
                    >
                        {s.title}
                    </ReactMarkdown>
                ))}
            </div>
            <div className="text-primary text-xl font-bold mt-6">Description</div>
            <div className="text-white text-xl mt-4">
                <ReactMarkdown
                >
                    {proposalInfo.description}
                </ReactMarkdown>
            </div>
        </div>
    )
}

ProposalDetails.defaultProps = {
    proposalInfo: {}
}

export default ProposalDetails;
