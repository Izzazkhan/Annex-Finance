import React from 'react';
import { useState } from 'react';
import greenArrow from '../../assets/icons/greenArrow.svg';
import redArrow from '../../assets/icons/redArrow.svg';

export default function SummaryActionCard({ title, name, icon, iconFocus, status, noData, action, tooltip }) {
  let arrow;
  if (status === 'green') {
    arrow = <img src={greenArrow} alt="green arrow" />;
  } else {
    arrow = <img src={redArrow} alt="red arrow" />;
  }

  const [iconUse, setIconUse] = useState(icon);

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
        <div className="">
          <div className="tooltip relative">
            <div className="tooltip-label">
              <a
                href="javascript:;"
                onClick={action}
              >
                <img
                  src={iconUse}
                  alt={name}
                  onMouseLeave={() => setIconUse(icon)}
                  onMouseEnter={() => setIconUse(iconFocus)}
                />
              </a>
            </div>
            <span className="label">{tooltip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
