// import React, { Fragment, useEffect, useState } from 'react';
// import MiniLogo from '../../../components/UI/MiniLogo';
// import { Link } from 'react-router-dom';
// import BarChart from '../../../components/common/BarChart';
// import LineChart from '../../../components/common/LineChart';
// import { useHistory } from 'react-router-dom';

// function AuctionItem(props) {
//   console.log('props', props);
//   const [orderArr, setOrderArr] = useState([]);

//   //   useEffect(() => {
//   //     const priceMapped = props.orders.map((item) => {
//   //       return {
//   //         ...item,
//   //         priceValue: Number(item.price.split(' ')[0]),
//   //       };
//   //     });
//   //     const mappedOrderData = priceMapped
//   //       .sort((a, b) => a.priceValue - b.priceValue)
//   //       .map((item) => {
//   //         const buyAmount = item.buyAmount.split(' ')[0];
//   //         const price = Number(item.price.split(' ')[0]).toFixed(2);
//   //         return {
//   //           ...item,
//   //           auctionDivBuyAmount: buyAmount,
//   //           price: price,
//   //           minFundingThresholdNotReached: props.minFundingThresholdNotReached,
//   //         };
//   //       });

//   //     let isSuccessfullArr = [];
//   //     props.data
//   //       .sort((a, b) => a.price - b.price)
//   //       .map((item) => {
//   //         isSuccessfullArr.push({ isSuccessfull: item.isSuccessfull });
//   //       });

//   //     mappedOrderData.map((item, i) => {
//   //       item.isSuccessfull = isSuccessfullArr[i].isSuccessfull;
//   //       item.auctionEndDate = props.auctionEndDate;
//   //     });
//   //     setOrderArr(mappedOrderData);
//   //   }, []);

//   const redirectToUrl = (url) => {
//     props.history.push({
//       pathname: url,
//       // state: 'dutch',
//       state: { auctionType: 'dutch', data: props },
//     });
//   };
//   return (
//     <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-black rounded-2xl p-6 flex flex-col mb-4">
//       <Link
//         className="flex flex-col h-full justify-between"
//         to={{
//           pathname: `detail/${props.id}`,
//           state: { auctionType: 'dutch', data: props },
//         }}
//       >
//         <div className="text-white flex flex-row items-stretch justify-between items-center mb-5">
//           <div className="flex flex-col items-start justify-start ">
//             <div className="text-white text-2xl ">{props.title}</div>
//             <div className="text-base font-normal">Auction id#{props.id}</div>
//           </div>
//           <div className="flex flex-col items-end relative">
//             <span className={`${props.statusClass}-icon absolute right-0 top-0`}></span>
//             <MiniLogo size="sm" />
//             <div className="text-sm mt-2">{props.status}</div>
//           </div>
//         </div>
//         <div className="graph">
//           <Fragment>
//             <div className="flex items-end relative ">
//               <LineChart width="310px" height="211px" data={props.data} />
//             </div>
//             <div className="text-white flex flex-row items-center justify-between items-center mt-8 h-10">
//               <div className="items-center ">
//                 <div className="flex items-center text-primary text-xs font-bold">
//                   Auction Start
//                 </div>
//               </div>
//               <div className="items-center ">
//                 <div className="flex items-center text-primary text-xs font-bold">Auction End</div>
//               </div>
//             </div>
//           </Fragment>
//         </div>

//         <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
//           <div className="items-start " onClick={() => redirectToUrl('/auction/detail')}>
//             <div className="text-primary text-sm font-normal">{props.type} auction</div>
//           </div>
//           <div className="items-center " onClick={() => redirectToUrl('/auction/detail')}>
//             <div className="flex items-center text-primary text-sm font-bold">
//               Enter
//               <img
//                 className="ml-2"
//                 src={require('../../../assets/images/enter-icon.png').default}
//                 alt=""
//               />
//             </div>
//           </div>
//         </div>
//       </Link>
//     </div>
//   );
// }

// export default AuctionItem;
