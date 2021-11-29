import React, { useEffect, useState, useContext, useMemo } from 'react';
import styled from 'styled-components';
import 'react-circular-progressbar/dist/styles.css';
import { useWindowSize } from '../../hooks/useWindowSize';
import { restService } from 'utilities';

const Wrapper = styled.div`
  .show-icon {
    right: calc(50% - 56px);
    bottom: 15%;
    z-index: 9;
  }
`;

const Styles = styled.div`
  width: 100%;
  overflow: auto;
  table {
    width: 100%;
    background-color: #000;
    color: #fff;
    border-spacing: 0;
    border: 1px solid #2b2b2b;

    tr {
      border-bottom: 1px solid #2b2b2b;
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem 2rem 0.5rem 0;
      text-align: center;

      :last-child {
        border-right: 0;
      }
    }
  }

  table.border-thick {
    border: 5px solid #2b2b2b;
    tr.top-border-thick {
      border-top: 5px solid #2b2b2b;
    }
  }

  table.no-data,
  table.loading {
    font-size: 1.2rem;
    th {
      border-right: 1px solid #2b2b2b;
    }
    div.loader-container {
      min-width: 150px;
    }
  }

  @media (max-width: 372px) {
    table.no-data,
    table.loading {
      div.loader-container {
        min-width: auto;
      }
    }
  }
`;

function Table(props) {
    console.log('detailProps', props)
    const [detail, setDetail] = useState([])
    const [isTableHorizontal, setIsTableHorizontal] = useState(true);

    const { width } = useWindowSize() || {};
    useEffect(() => {
        if (width <= 1024) {
            setIsTableHorizontal(false);
        } else {
            setIsTableHorizontal(true);
        }
    }, [width]);


    useEffect(async () => {
        try {
            const response = await restService({
                third_party: true,
                api: `http://192.168.99.197:3070/api/v1/events?address=${props.match.params.address}`,
                method: 'GET',
                params: {}
            })
            setDetail(response.data.data)
        } catch (error) {
            console.log(error);
        }
    }, [])

    console.log('detaildetail', detail)

    return (
        <div className="relative w-full">
            <div className="bg-fadeBlack w-full p-6 mt-16">
                <Styles>
                    <div
                        className="auction-btn-wrapper flex justify-start items-center 
      mb-5 border-b border-solid border-primary"
                    >
                        <h2 className="text-white ml-5 text-4xl font-normal">Contract List</h2>
                    </div>

                    <table
                        className={`text-left ${!isTableHorizontal && 'border-thick'} ${detail.length === 0 && 'no-data'
                            }`}
                    >
                        <>
                            <thead>
                                <tr>
                                    <th>Address</th>
                                    <th>Event Name</th>
                                    <th>
                                        Block Hash
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {detail.length > 0 && detail.map(item => (
                                    <tr key={item.address}>
                                        <td>{item.address}</td>
                                        <th>{item.eventName}</th>
                                        <th>{item.blockHash}</th>
                                    </tr>
                                ))}
                            </tbody>
                        </>

                    </table>
                </Styles>
            </div>
        </div>
        // <Wrapper>
        //     <div className="col-span-12 p-6 flex items-center">
        //         <h2 className="text-white mb-2 text-4xl font-normal">Auction Details</h2>
        //         <div className="text-gray text-xl ml-2">
        //             a
        //         </div>
        //     </div>
        //     <div
        //         className="grid grid-cols-12 xl:grid-cols-10
        // text-white bg-black mt-8  py-8 border border-lightGray rounded-md flex flex-row  justify-between relative"
        //     >
        //         <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col border-r border-lightGray ">
        //             a
        //             <div className="flex items-center text-white text-lg md:text-md ">
        //                 Current Price{' '}
        //                 <div className="tooltip relative">
        //                     <span className="label">Current Auctioned Token Price</span>
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col ">
        //             <h2 className="flex items-center text-white mb-1 xl:text-xl md:text-lg font-bold text-blue">
        //                 a
        //             </h2>
        //             <div className="flex items-center text-white text-lg md:text-md ">
        //                 Bidding With{' '}
        //                 <div className="tooltip relative">
        //                     <span className="label">Bidding Token</span>
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="hidden xl:block col-span-6 xl:col-span-2 lg:col-span-4 md:col-span-6 my-5 px-8 flex flex-col "></div>
        //         <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col border-r border-lightGray">
        //             <h2 className="flex items-center text-white mb-1 xl:text-xl md:text-lg font-bold text-primary">
        //                 fdsas
        //             </h2>
        //             <div className="flex items-center text-white text-lg md:text-md ">
        //                 Total Auctioned{' '}
        //                 <div className="tooltip relative">
        //                     <span className="label">Total Auctioned Token</span>
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="col-span-6 xl:col-span-2 lg:col-span-3 md:col-span-6 my-5 px-8 flex flex-col ">
        //             <h2 className="text-white mb-1 xl:text-xl md:text-lg font-bold text-primary">
        //                 a
        //             </h2>
        //             <div className="flex items-center text-white text-lg md:text-md ">
        //                 {' '}
        //                 Min Bid Price{' '}
        //                 <div className="tooltip relative">
        //                     <span className="label">Minimum Bid Price</span>
        //                 </div>
        //             </div>
        //         </div>
        //         <div className="col-span-12 text-center">
        //             <div className="relative xl:absolute timer flex flex-col justify-between items-center">
        //                 a
        //             </div>
        //         </div>
        //     </div>


        //     <div className="grid grid-cols-1 md:grid-cols-8 gap-y-4 md:gap-y-0 md:gap-x-4 text-white mt-15">
        //         <div className="col-span-4 bg-fadeBlack rounded-2xl flex flex-col justify-between">
        //             <div className="text-white flex flex-row items-stretch justify-between items-center  p-6 border-b border-lightGray">
        //                 <div className="flex flex-col items-start justify-start ">
        //                     <div className="text-white text-2xl ">a</div>
        //                     <div className="text-base font-normal">Auction id#1</div>
        //                 </div>
        //                 <div className="flex flex-col items-center ">
        //                     <div className="">
        //                         a
        //                     </div>
        //                     <div className="text-sm">
        //                         a
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
        //                 <div className="flex flex-col mb-8">
        //                     <div className="text-md font-medium mb-0">Contract</div>
        //                     <div className="text-xl font-medium">
        //                         a
        //                     </div>
        //                 </div>

        //                 <div className="flex flex-col mb-8">
        //                     <div className="text-md font-medium mb-0">Token</div>
        //                     <div className="text-xl font-medium">
        //                         a
        //                     </div>
        //                 </div>
        //                 <div className="flex flex-col mb-8">
        //                     <div className="text-md font-medium mb-0">Website</div>
        //                     <div className="text-xl font-medium">
        //                         a
        //                     </div>
        //                 </div>
        //                 <div className="flex flex-col  mb-7">
        //                     <div className="text-lg font-medium mb-3">About</div>
        //                     <div className="flex flex-wrap justify-between space-x-2 ">
        //                         {/* <MediaIcon name="Telegram" src="telegram" url={state.detail.telegramLink} />
        //                         <MediaIcon name="Github" src="discord" url={state.detail.discordLink} />
        //                         <MediaIcon name="Medium" src="medium" url={state.detail.mediumLink} />
        //                         <MediaIcon name="Twitter" src="telegram" url={state.detail.twitterLink} /> */}
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="text-white flex flex-col items-stretch justify-between items-center p-6 border-b border-lightGray">
        //                 <div className="flex flex-col mb-7">
        //                     <div className="text-lg font-medium mb-2">Description</div>
        //                     <div className="text-lg font-normal">a</div>
        //                 </div>
        //             </div>
        //             <div className="text-white flex flex-row items-stretch justify-between items-center p-6 ">
        //                 <div className="items-start ">
        //                     <div className="text-primary text-sm font-normal">f auction</div>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </Wrapper>
    );
}

function App(props) {
    return (
        <Styles>
            <Table {...props} />
        </Styles>
    );
}

export default App;