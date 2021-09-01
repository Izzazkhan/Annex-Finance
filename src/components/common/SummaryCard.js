import React from 'react';
import greenArrow from '../../assets/icons/greenArrow.svg';
import redArrow from '../../assets/icons/redArrow.svg';

export default function SummaryCard({ title, name, icon, status, noData }) {
  let arrow;
  if (status === 'green') {
    arrow = <img src={greenArrow} alt="green arrow" />;
  } else {
    arrow = <img src={redArrow} alt="red arrow" />;
  }

  return (
    <div className="border border-solid border-primary rounded-lg w-full flex items-center py-3 md:py-4 lg:py-8">
      <div className="flex justify-between px-7 py-4 md:py-0 items-center w-full">
        <div className="">
          <div className="flex items-center space-x-2">
            {arrow}
            <div className="text-white text-sm">{name}</div>
          </div>
          <div className="text-white text-2xl font-bold">{noData ? '-' : title}</div>
        </div>
        <div>
          <img src={icon} alt={name} />
        </div>
      </div>
    </div>
  );
}
