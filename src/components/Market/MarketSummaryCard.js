const MarketSummaryCard = ({ title, children }) => {
    return (

        <div
            className="bg-black rounded-2xl py-4 px-6
                        border border-solid border-primary text-white"
        >
            <div className="text-lg">{title}</div>
            <div className="text-xl 2xl:text-24">{children}</div>
        </div>

    )
}

MarketSummaryCard.defaultProps = {
    title: '',
    children: ''
}

export default MarketSummaryCard
