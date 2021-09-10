import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const Styles = styled.div`
  .overflow-wrap-break-word {
    overflow-wrap: break-word;
  }
  h1 {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }
  h2 {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
  p {
    font-size: 1rem;
    line-height: 1.5rem;
    --tw-text-opacity: 1;
    color: rgba(113,117,121,var(--tw-text-opacity));
  }
  a {
      color: #4fd000;
  }

`;

const ProposalDetails = ({ proposalInfo }) => {
    return (
        <div className="col-span-5 bg-fadeBlack rounded-2xl p-4">
            <Styles>
                <div className="text-primary text-xl font-bold">Operation</div>
                <div className="flex flex-col space-y-1 mt-2 text-white pl-8">
                    {(proposalInfo.actions || []).map((s, idx) => (
                        <ReactMarkdown
                            className="text-xl overflow-wrap-break-word"
                            key={idx}
                        >
                            {s.title}
                        </ReactMarkdown>
                    ))}
                </div>
                <div className="text-primary text-xl font-bold mt-6">Description</div>
                <div className="text-white text-xl mt-4 pl-8">
                    <ReactMarkdown
                    >
                        {proposalInfo.description}
                    </ReactMarkdown>
                </div>
            </Styles>
        </div>
    )
}

ProposalDetails.defaultProps = {
    proposalInfo: {}
}

export default ProposalDetails;
