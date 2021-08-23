import React from 'react';
import logoMini from '../../assets/icons/logoMini.svg';

function MiniLogo({ size, src }) {
  return (
    <div className={`bg-blue rounded-full relative ${size === 'sm' ? 'w-9 h-9' : 'w-12 h-12'} `}>
      <img
        className={
          size === 'sm'
            ? 'w-9 h-9'
            : 'w-12 h-12'
        }
        src={src || logoMini}
        alt="logoMini"
      />
    </div>
  );
}

export default MiniLogo;
