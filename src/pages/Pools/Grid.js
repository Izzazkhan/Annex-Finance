import React, { Fragment } from 'react';
import styled from 'styled-components';
import AnnexLogo from '../../assets/images/coins/ann.png';


function Grid() {
    return (
        <div className="bg-fadeBlack p-6 mt-10 grid grid-cols-1 gap-y-3 md:gap-y-0 md:grid-cols-12 md:gap-x-3 ">
            <div className="col-span-4 flex items-center">
                <div className="bgPrimaryGradient py-2 px-4 rounded-3xl flex items-center ">
                    <div className="flex flex-col">
                        <div>Auto ANN</div>
                        <div>Automatic restaking</div>
                    </div>
                    <div className="bg-blue rounded-full relative w-9 h-9 ">
                        <img src={AnnexLogo} alt="" className="" />
                    </div>
                </div>
            </div>
            {/* <div className="text-white">grid</div> */}
        </div>
    );
}

export default Grid;
