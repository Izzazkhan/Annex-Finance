import React, { Fragment, useEffect } from 'react';
import MiniLogo from '../../../components/UI/MiniLogo';
import { Link } from 'react-router-dom';
import BarChart from '../../../components/common/BarChart';
import LineChart from '../../../components/common/LineChart';
import { useHistory } from 'react-router-dom';

function AuctionItem(props) {
  const history = useHistory();
  const redirectToUrl = (url) => {
    history.push(url);
  };
  return (
    <div className="col-span-12 lg:col-span-4 md:col-span-6 bg-black rounded-2xl p-6 flex flex-col mb-4">
      <Link className="flex flex-col h-full justify-between" to={`detail/${props.id}`}>
        <div className="text-white flex flex-row items-stretch justify-between items-center mb-8">
          <div className="flex flex-col items-start justify-start ">
            <div className="text-white text-2xl ">{props.title}</div>
            <div className="text-base font-normal">Auction id#{props.id}</div>
          </div>
          <div className="flex flex-col items-end relative">
            <span className={`${props.statusClass}-icon absolute right-0 top-0`}></span>
            <MiniLogo size="sm" />
            <div className="text-sm mt-2">{props.status}</div>
          </div>
        </div>
        <div className="graph">
          {props.chartType === 'block' ? (
            <Fragment>
              <div className="chart flex items-end relative pl-10">
                <div className="graph-left-label flex flex-col items-center text-white text-sm justify-center font-normal">
                  <span className="border first"></span>
                  <span className="label my-2 font-normal">
                    No. of share <b>50</b>
                  </span>
                  <span className=" border last"></span>
                </div>
                <span className="label info success text-sm font-normal"><span></span>Successfull</span>
                <span className="label info unsuccess text-sm font-normal"><span></span>UnSuccessfull</span>
                <BarChart width="310px" height="211px" style={{marginTop : '-25px'}} data={props.data} />
              </div>
              <div className="w-full graph-bottom-label flex items-center text-white text-sm mt-8 justify-center font-normal h-10">
                <span className="border first "></span>
                <span className="label mx-2 font-normal">
                  Bid per share, sorted from lowest to highest
                </span>
                <span className=" border last "></span>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="flex items-end relative ">
                <LineChart width="310px" height="211px" data={props.data} />
              </div>
              <div className="text-white flex flex-row items-center justify-between items-center mt-8 h-10">
                <div className="items-center ">
                  <div className="flex items-center text-primary text-xs font-bold">
                    Auction Start
                  </div>
                </div>
                <div className="items-center ">
                  <div className="flex items-center text-primary text-xs font-bold">
                    Auction End
                  </div>
                </div>
              </div>
            </Fragment>
          )}
        </div>

        <div className="text-white flex flex-row items-stretch justify-between items-center mt-8">
          <div className="items-start " onClick={() => redirectToUrl('/auction/detail')}>
            <div className="text-primary text-sm font-normal">{props.type} auction</div>
          </div>
          <div className="items-center " onClick={() => redirectToUrl('/auction/detail')}>
            <div className="flex items-center text-primary text-sm font-bold">
              Enter
              <img
                className="ml-2"
                src={require('../../../assets/images/enter-icon.png').default}
                alt=""
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default AuctionItem;
