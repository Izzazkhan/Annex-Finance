import search from '../../assets/icons/search.svg';

const Searchbar = ({
    value,
    onChange
}) => {
    return (
        <div
            className="relative flex flex-col"
            style={{ width: '100%', maxWidth: "510px" }}
        >
            <input
                className="border border-solid border-gray bg-transparent text-18
                           mt-1 focus:outline-none font-bold px-3 text-white w-full"
                style={{ height: 60, borderRadius: 50 }}
                value={value}
                onChange={onChange}
                placeholder="Search here"
            />
            <img src={search} alt="" className="w-5 absolute" style={{ top: 26, right: 28 }} />
        </div>
    )
}

Searchbar.defaultProps = {
    value: "",
    onChange: () => {}
}

export default Searchbar;
