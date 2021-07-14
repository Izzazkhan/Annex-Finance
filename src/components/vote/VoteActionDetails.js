import Progress from "../UI/Progress";

const VoteActionDetails = ({ title, percent, size, onVote, disabled, loading }) => (
    <div
        className={`
        p-3 border border-solid border-lightGray w-full rounded-lg
        ${disabled || loading ? " cursor-not-allowed opacity-50" : "cursor-pointer"}
        
        `}
        onClick={() => {
            if(!disabled || loading) {
                onVote()
            }
        }}
    >
        <div className="flex justify-between">
            <div className={`text-white ${size === 'sm' ? 'text-base' : 'text-xl'}`}>{title}</div>
            <div className={`text-primary ${size === 'sm' ? 'text-base' : 'text-xl'}`}>{percent}%</div>
        </div>
        <Progress wrapperClassName="w-full mt-2" percent={percent} />
    </div>
);

export default VoteActionDetails;
