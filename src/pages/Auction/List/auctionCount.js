export function auctionCount(query, dataSource, setCount, setLoading, setError) {
    try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            "query": query
        });

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        let subGraph
        subGraph = dataSource

        fetch(subGraph, requestOptions)
            .then(response => response.text())
            .then(result => {
                setCount(JSON.parse(result).data.auctions.length)
            })
            .catch(error => {
                console.log(error);
                // setLoading(false)
                setError('Error while Loading. Please try again later.')
            });
    } catch (error) {
        console.log(error);
        // setLoading(false)
        setError('Error while Loading. Please try again later.')
    }
}