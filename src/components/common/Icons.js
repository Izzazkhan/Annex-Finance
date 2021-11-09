/* eslint-disable */
import React from 'react';

export const DashboardIcon = ({ fill }) => (
  <div>
    {fill === '#FF9800' ? (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.2 18V11.6471H10.8V18H15.3V9.52941H18L9 0L0 9.52941H2.7V18H7.2Z"
          fill="url(#paint0_linear)"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="16.5"
            y1="9.5"
            x2="2.41396"
            y2="7.08525"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#C97629" />
            <stop offset="1" stopColor="#FF9801" />
          </linearGradient>
        </defs>
      </svg>
    ) : (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7.2 18V11.6471H10.8V18H15.3V9.52941H18L9 0L0 9.52941H2.7V18H7.2Z" fill="white" />
      </svg>
    )}
  </div>
);



export const VoteIcon = ({ fill }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.75 0H2.25C1.0125 0 0 1.0125 0 2.25V15.75C0 16.9875 1.0125 18 2.25 18H15.75C16.9875 18 18 16.9875 18 15.75V2.25C18 1.0125 16.9875 0 15.75 0ZM15.75 15.75H2.25V2.25H15.75V15.75Z"
      fill={fill || 'white'}
    />
  </svg>
);
export const AnnexIcon = ({ fill }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0.679688 17.6903L7.04412 5.22035L8.17802 7.35639L4.77725 14.0784L11.6361 12.0977L7.58432 4.20735L9.72619 0L16.4685 13.0255L0.679688 17.6903Z"
      fill={fill || 'white'}
    />
    <path d="M0 19.9987L16.6832 13.5625L20 19.9987H0Z" fill={fill || 'white'} />
  </svg>
);
export const MarketIcon = ({ fill }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.7917 17.9545H1.875V0.227273C1.875 0.102273 1.78125 0 1.66667 0H0.208333C0.09375 0 0 0.102273 0 0.227273V19.7727C0 19.8977 0.09375 20 0.208333 20H19.7917C19.9062 20 20 19.8977 20 19.7727V18.1818C20 18.0568 19.9062 17.9545 19.7917 17.9545ZM3.75 16.1364H17.7083C17.8229 16.1364 17.9167 16.0341 17.9167 15.9091V3.52273C17.9167 3.31818 17.6901 3.21875 17.5599 3.3608L12.0833 9.33523L8.81771 5.8125C8.77855 5.7702 8.72568 5.74648 8.67057 5.74648C8.61547 5.74648 8.56259 5.7702 8.52344 5.8125L3.60156 11.1989C3.58245 11.2198 3.56731 11.2446 3.55703 11.2719C3.54675 11.2992 3.54153 11.3284 3.54167 11.358V15.9091C3.54167 16.0341 3.63542 16.1364 3.75 16.1364Z"
      fill={fill || 'white'}
    />
  </svg>
);
export const VaultIcon = ({ fill }) => (
  <svg width="20" height="16" viewBox="0 0 20 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.9974 15.1954L18.9771 8.901C18.9619 8.80201 18.8756 8.73095 18.7766 8.73095H12.137C12.038 8.73095 11.9518 8.80201 11.9365 8.901L10.9162 15.1954C10.9137 15.2056 10.9137 15.2182 10.9137 15.2284C10.9137 15.3401 11.0051 15.4314 11.1167 15.4314H19.7969C19.8071 15.4314 19.8198 15.4314 19.8299 15.4289C19.939 15.4111 20.0152 15.3071 19.9974 15.1954ZM8.06344 8.901C8.04821 8.80201 7.96191 8.73095 7.86293 8.73095H1.22335C1.12436 8.73095 1.03807 8.80201 1.02284 8.901L0.00253803 15.1954C-3.87656e-08 15.2056 0 15.2182 0 15.2284C0 15.3401 0.0913704 15.4314 0.203045 15.4314H8.88323C8.89338 15.4314 8.90607 15.4314 8.91623 15.4289C9.0279 15.4111 9.10151 15.3071 9.08374 15.1954L8.06344 8.901ZM5.68527 6.7005H14.3655C14.3756 6.7005 14.3883 6.7005 14.3984 6.69796C14.5101 6.68019 14.5837 6.57613 14.566 6.46446L13.5457 0.17005C13.5304 0.0710658 13.4441 0 13.3452 0H6.70557C6.60659 0 6.52029 0.0710658 6.50506 0.17005L5.48476 6.46446C5.48222 6.47461 5.48222 6.4873 5.48222 6.49745C5.48222 6.60912 5.57359 6.7005 5.68527 6.7005Z"
      fill={fill || 'white'}
    />
  </svg>
);
export const TradeIcon = ({ fill }) => (
  <svg width="20" height="15" viewBox="0 0 20 15" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.6513 0.153023L19.4413 2.94302C19.487 2.98944 19.523 3.04447 19.5472 3.10491C19.5715 3.16535 19.5835 3.23 19.5825 3.29511C19.5816 3.36023 19.5678 3.42451 19.5418 3.48423C19.5158 3.54395 19.4783 3.59793 19.4313 3.64302L16.6413 6.43302C16.5714 6.50154 16.4829 6.54805 16.3869 6.56677C16.2908 6.58549 16.1914 6.5756 16.1009 6.53834C16.0104 6.50107 15.9328 6.43807 15.8778 6.35713C15.8227 6.27619 15.7927 6.18089 15.7913 6.08302V4.29302H1.79129C1.52607 4.29302 1.27172 4.18767 1.08418 4.00013C0.896648 3.81259 0.791291 3.55824 0.791291 3.29302C0.791291 3.02781 0.896648 2.77345 1.08418 2.58592C1.27172 2.39838 1.52607 2.29302 1.79129 2.29302H15.7913V0.503023C15.7907 0.403091 15.82 0.305271 15.8756 0.222184C15.9311 0.139097 16.0102 0.0745546 16.1028 0.0368843C16.1954 -0.000785965 16.2971 -0.00985552 16.3949 0.0108457C16.4926 0.0315468 16.5819 0.0810691 16.6513 0.153023ZM2.93129 14.433L0.141291 11.643C0.0956188 11.5966 0.0596163 11.5416 0.035371 11.4811C0.0111256 11.4207 -0.000880006 11.356 5.02002e-05 11.2909C0.000980406 11.2258 0.0148278 11.1615 0.0407897 11.1018C0.0667517 11.0421 0.104311 10.9881 0.151291 10.943L2.94129 8.15302C3.01118 8.0845 3.09964 8.038 3.1957 8.01928C3.29177 8.00056 3.39121 8.01044 3.48172 8.04771C3.57222 8.08497 3.64979 8.14798 3.70482 8.22891C3.75985 8.30985 3.78992 8.40516 3.79129 8.50302V10.293H17.7913C18.0565 10.293 18.3109 10.3984 18.4984 10.5859C18.6859 10.7735 18.7913 11.0278 18.7913 11.293C18.7913 11.5582 18.6859 11.8126 18.4984 12.0001C18.3109 12.1877 18.0565 12.293 17.7913 12.293H3.79129V14.083C3.7919 14.183 3.76254 14.2808 3.70701 14.3639C3.65149 14.4469 3.57234 14.5115 3.47978 14.5492C3.38722 14.5868 3.28549 14.5959 3.18773 14.5752C3.08996 14.5545 3.00064 14.505 2.93129 14.433Z"
      fill={fill || 'white'}
    />
  </svg>
);
export const FarmsIcon = ({ fill }) => (
  <svg width="22" height="19" viewBox="0 0 22 19" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 18.5019C4.0111 18.5019 3.0444 18.2087 2.22215 17.6592C1.39991 17.1098 0.759043 16.3289 0.380605 15.4153C0.00216642 14.5017 -0.0968503 13.4963 0.0960759 12.5264C0.289002 11.5565 0.765206 10.6656 1.46447 9.96636C2.16373 9.2671 3.05465 8.7909 4.02455 8.59797C4.99446 8.40504 5.99979 8.50406 6.91342 8.8825C7.82705 9.26094 8.60794 9.9018 9.15735 10.724C9.70676 11.5463 10 12.513 10 13.5019C9.99841 14.8275 9.47112 16.0983 8.53378 17.0357C7.59644 17.973 6.3256 18.5003 5 18.5019ZM5 10.5019C4.40666 10.5019 3.82664 10.6778 3.33329 11.0075C2.83994 11.3371 2.45543 11.8057 2.22836 12.3538C2.0013 12.902 1.94189 13.5052 2.05765 14.0872C2.1734 14.6691 2.45912 15.2037 2.87868 15.6232C3.29824 16.0428 3.83279 16.3285 4.41473 16.4443C4.99667 16.56 5.59987 16.5006 6.14805 16.2735C6.69623 16.0465 7.16477 15.662 7.49441 15.1686C7.82406 14.6753 8 14.0952 8 13.5019C8 12.7062 7.68393 11.9432 7.12132 11.3806C6.55871 10.818 5.79565 10.5019 5 10.5019ZM18.5 18.4719C17.8078 18.4719 17.1311 18.2666 16.5555 17.882C15.9799 17.4975 15.5313 16.9508 15.2664 16.3113C15.0015 15.6717 14.9322 14.968 15.0673 14.2891C15.2023 13.6101 15.5356 12.9865 16.0251 12.497C16.5146 12.0075 17.1383 11.6742 17.8172 11.5391C18.4961 11.4041 19.1999 11.4734 19.8394 11.7383C20.4789 12.0032 21.0256 12.4518 21.4101 13.0274C21.7947 13.603 22 14.2797 22 14.9719C22 15.9002 21.6313 16.7904 20.9749 17.4468C20.3185 18.1031 19.4283 18.4719 18.5 18.4719ZM18.5 13.4719C18.2033 13.4719 17.9133 13.5599 17.6666 13.7247C17.42 13.8895 17.2277 14.1238 17.1142 14.3979C17.0007 14.672 16.9709 14.9736 17.0288 15.2645C17.0867 15.5555 17.2296 15.8228 17.4393 16.0326C17.6491 16.2423 17.9164 16.3852 18.2074 16.4431C18.4983 16.501 18.7999 16.4712 19.074 16.3577C19.3481 16.2442 19.5824 16.0519 19.7472 15.8053C19.912 15.5586 20 15.2686 20 14.9719C20 14.5741 19.842 14.1925 19.5607 13.9112C19.2794 13.6299 18.8978 13.4719 18.5 13.4719ZM14.05 14.4719H10.91C10.965 14.1413 10.9951 13.807 11 13.4719C10.9976 11.9943 10.4491 10.5696 9.46 9.4719H10C10.5304 9.4719 11.0391 9.26118 11.4142 8.88611C11.7893 8.51104 12 8.00233 12 7.4719V5.5619L10.75 4.3129L9.78 5.2819C9.71078 5.3535 9.628 5.41059 9.53648 5.44986C9.44495 5.48912 9.34653 5.50976 9.24695 5.51058C9.14736 5.5114 9.04861 5.49237 8.95646 5.45462C8.8643 5.41687 8.78059 5.36114 8.71021 5.29068C8.63982 5.22023 8.58417 5.13647 8.5465 5.04428C8.50883 4.95209 8.4899 4.85332 8.49082 4.75374C8.49173 4.65415 8.51246 4.55575 8.55181 4.46426C8.59116 4.37278 8.64834 4.29005 8.72 4.2209L11.72 1.2209C11.7892 1.1493 11.872 1.0922 11.9635 1.05294C12.055 1.01367 12.1535 0.993031 12.2531 0.992213C12.3526 0.991395 12.4514 1.01042 12.5435 1.04817C12.6357 1.08593 12.7194 1.14166 12.7898 1.21211C12.8602 1.28256 12.9158 1.36632 12.9535 1.45851C12.9912 1.5507 13.0101 1.64947 13.0092 1.74906C13.0083 1.84864 12.9875 1.94704 12.9482 2.03853C12.9088 2.13001 12.8517 2.21274 12.78 2.2819L11.811 3.2509L13.031 4.4709H19C19.5304 4.4709 20.0391 4.68161 20.4142 5.05668C20.7893 5.43176 21 5.94046 21 6.4709V11.2309C20.3597 10.801 19.6193 10.5437 18.8504 10.4839C18.0815 10.4242 17.3102 10.5639 16.6112 10.8897C15.9122 11.2155 15.3092 11.7162 14.8604 12.3434C14.4117 12.9707 14.1326 13.7031 14.05 14.4699V14.4719ZM8 7.4719H3C2.73479 7.4719 2.48043 7.36654 2.2929 7.179C2.10536 6.99147 2 6.73711 2 6.4719C2 6.20668 2.10536 5.95233 2.2929 5.76479C2.48043 5.57725 2.73479 5.4719 3 5.4719H6C6.53044 5.4719 7.03914 5.68261 7.41422 6.05768C7.78929 6.43276 8 6.94146 8 7.4719Z"
      fill={fill || 'white'}
    />
  </svg>
);
export const PoolsIcon = ({ fill }) => (
  <svg width="16" height="19" viewBox="0 0 16 19" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.00078 9.30078H5.20078C4.20078 9.30078 3.30078 10.2008 3.30078 11.2008V13.1008C3.30078 14.2008 4.10078 15.0008 5.20078 15.0008H8.00078C9.00078 15.0008 9.90078 14.1008 9.90078 13.1008V11.2008C9.90078 10.1008 9.10078 9.30078 8.00078 9.30078Z"
      fill={fill || 'white'}
    />
    <path
      d="M14.3992 3.60078C13.4992 2.00078 11.5992 1.40078 10.0992 2.20078C10.0992 1.10078 9.29922 0.300781 8.19922 0.300781H5.39922C4.39922 0.300781 3.49922 1.20078 3.49922 2.20078V4.60078C3.49922 5.00078 3.19922 5.40078 2.89922 5.60078C1.29922 6.40078 0.199219 8.10078 0.199219 10.0008V14.9008C0.199219 17.1008 1.89922 18.8008 3.99922 18.8008H9.69922C11.7992 18.8008 13.4992 17.1008 13.4992 14.9008V10.0008C13.4992 9.40078 13.3992 8.90078 13.1992 8.40078H13.2992C14.7992 7.40078 15.3992 5.30078 14.3992 3.60078ZM5.39922 2.20078H8.19922V4.40078H5.39922V2.20078ZM11.4992 14.9008C11.4992 16.0008 10.6992 16.8008 9.59922 16.8008H3.99922C2.99922 16.8008 2.09922 15.9008 2.09922 14.9008V10.0008C2.09922 8.80078 2.69922 7.80078 3.69922 7.40078C4.29922 7.10078 4.79922 6.60078 5.19922 5.90078H8.59922C8.89922 6.60078 9.49922 7.10078 10.0992 7.40078C11.0992 7.90078 11.6992 8.90078 11.6992 10.0008V14.9008H11.4992ZM12.2992 6.60078C11.7992 6.20078 11.2992 5.80078 10.7992 5.60078C10.3992 5.40078 10.1992 5.00078 10.1992 4.60078V4.50078L10.8992 4.00078C11.5992 3.60078 12.4992 3.90078 12.7992 4.60078C13.1992 5.30078 12.9992 6.20078 12.2992 6.60078Z"
      fill={fill || 'white'}
    />
  </svg>
);

export const Auction = ({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24" fill={fill}>
    <path
      d="M14.7886 18.2353C14.7886 17.6019 14.4012 17.0572 13.8509 16.8259C13.9624 16.6139 14.0256 16.3726 14.0256 16.1169C14.0256 15.2744 13.3401 14.5889 12.4975 14.5889H10.4654V11.9935C13.0885 11.3137 15.0313 8.92639 15.0313 6.09374C15.0313 2.73365 12.2977 0 8.93753 0C8.09791 0 7.28397 0.168093 6.51832 0.49964C6.28076 0.602483 6.17158 0.878483 6.27443 1.11604C6.37727 1.35361 6.65341 1.46287 6.89083 1.35993C7.53817 1.07962 8.22681 0.937498 8.93753 0.937498C11.7807 0.937498 14.0938 3.25059 14.0938 6.09374C14.0938 8.93689 11.7807 11.25 8.93753 11.25C6.09438 11.25 3.78124 8.93689 3.78124 6.09374C3.78124 5.38279 3.92342 4.69415 4.20382 4.0468C4.30671 3.80924 4.19759 3.53324 3.96003 3.43035C3.7226 3.32746 3.44646 3.43659 3.34362 3.6742C3.01193 4.4398 2.84375 5.25388 2.84375 6.09374C2.84375 8.92639 4.78652 11.3137 7.40955 11.9935V14.1118H7.33183C5.95929 14.1118 4.65574 14.6818 3.72157 15.6832H1.4375C1.31314 15.6832 1.19389 15.7326 1.10595 15.8206C1.01806 15.9085 0.968656 16.0278 0.96875 16.1522L0.972031 21.9601C0.972172 22.2189 1.18198 22.4286 1.44078 22.4286H3.72401C4.66067 23.43 5.96332 24 7.33183 24L12.1365 24C12.979 24 13.6645 23.3145 13.6645 22.472C13.6645 22.2104 13.5984 21.964 13.4821 21.7485C14.0146 21.5095 14.3865 20.9742 14.3865 20.3536C14.3865 20.0361 14.2891 19.7409 14.1227 19.4963C14.5245 19.2208 14.7886 18.7583 14.7886 18.2353ZM8.93753 12.1875C9.1367 12.1875 9.33362 12.1775 9.52797 12.1588V14.5889H8.34709V14.5805V12.1588C8.54139 12.1776 8.73831 12.1875 8.93753 12.1875Z"
      fill={fill || 'white'}
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="8.00001"
        y1="0"
        x2="8.00001"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#CD7B04" />
        <stop offset="1" stopColor="#FB9603" />
      </linearGradient>
    </defs>
  </svg>
);

export const LiquidateIcon = ({ fill }) => {
  if (!fill) {
    fill = "white"
  }
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.74693 11.5703C1.92023 11.5703 0.444824 13.0457 0.444824 14.8724C0.444824 16.6991 1.92023 18.1745 3.74693 18.1745C5.57363 18.1745 7.04904 16.6991 7.04904 14.8724C7.04904 13.0457 5.57363 11.5703 3.74693 11.5703ZM4.98815 15.3876C4.98815 15.7858 4.66028 16.1136 4.26215 16.1136H4.12164V16.746H3.51274V16.1136H2.69307V15.5282H4.23874C4.33241 15.5282 4.37925 15.4579 4.37925 15.3876V15.3174C4.37925 15.2237 4.30899 15.1769 4.23874 15.1769H3.25513C2.857 15.1769 2.52913 14.849 2.52913 14.4509V14.3806C2.52913 13.9825 2.857 13.6546 3.25513 13.6546H3.51274V13.0223H4.09822V13.6546H4.8008V14.2401H3.25513C3.16145 14.2401 3.11461 14.3104 3.11461 14.3806V14.4509C3.11461 14.5446 3.18487 14.5914 3.25513 14.5914H4.23874C4.63686 14.5914 4.96473 14.9193 4.96473 15.3174L4.98815 15.3876Z" fill={fill} />
      <path d="M15.808 13.3945C13.9813 13.3945 12.5059 14.8699 12.5059 16.6966C12.5059 18.5233 13.9813 19.9988 15.808 19.9988C17.6347 19.9988 19.1101 18.5233 19.1101 16.6966C19.1101 14.8699 17.6347 13.3945 15.808 13.3945ZM17.0492 17.2119C17.0492 17.61 16.7213 17.9379 16.3232 17.9379H16.1593V18.5702H15.5738V17.9379H14.7541V17.3524H16.2998C16.3934 17.3524 16.4403 17.2821 16.4403 17.2119V17.1416C16.4403 17.0479 16.37 17.0011 16.2998 17.0011H15.3162C14.918 17.0011 14.5902 16.6732 14.5902 16.2751V16.2048C14.5902 15.8067 14.918 15.4788 15.3162 15.4788H15.5738V14.8465H16.1593V15.4788H16.8618V16.0643H15.3162C15.2225 16.0643 15.1756 16.1346 15.1756 16.2048V16.2751C15.1756 16.3688 15.2459 16.4156 15.3162 16.4156H16.2998C16.6979 16.4156 17.0258 16.7435 17.0258 17.1416L17.0492 17.2119Z" fill={fill} />
      <path d="M19.719 9.69616C19.5785 9.57907 19.3911 9.36829 19.0398 9.36829C18.6885 9.36829 18.4778 9.55565 18.3607 9.69616C18.2436 9.81326 18.1967 9.83668 18.0796 9.83668C17.9625 9.83668 17.9157 9.78984 17.7986 9.69616C17.6581 9.57907 17.4707 9.36829 17.1194 9.36829C16.7681 9.36829 16.5574 9.55565 16.4403 9.69616C16.3232 9.81326 16.2763 9.83668 16.1593 9.83668C16.0422 9.83668 15.9953 9.78984 15.8782 9.69616C15.7845 9.55565 15.5972 9.36829 15.2225 9.36829C14.8712 9.36829 14.6604 9.55565 14.5433 9.69616C14.4965 9.743 14.4731 9.76642 14.4496 9.78984C14.3794 7.56502 12.5761 5.78516 10.3279 5.78516C8.1733 5.78516 6.39344 7.44792 6.22951 9.55565C6.08899 9.43855 5.94848 9.36829 5.71429 9.36829C5.363 9.36829 5.15222 9.55565 5.03513 9.69616C4.91803 9.78984 4.87119 9.83668 4.7541 9.83668C4.637 9.83668 4.59016 9.78984 4.47307 9.69616C4.33255 9.57907 4.1452 9.36829 3.79391 9.36829C3.44262 9.36829 3.23185 9.55565 3.11475 9.69616C2.99766 9.81326 2.95082 9.83668 2.83372 9.83668C2.71663 9.83668 2.66979 9.78984 2.55269 9.69616C2.45902 9.55565 2.27166 9.36829 1.89696 9.36829C1.52225 9.36829 1.33489 9.55565 1.2178 9.69616C1.1007 9.78984 1.05386 9.83668 0.960187 9.83668C0.843091 9.83668 0.796253 9.78984 0.679157 9.69616C0.562061 9.55565 0.351288 9.36829 0 9.36829V9.95377C0.117096 9.95377 0.163934 10.0006 0.28103 10.0943C0.421546 10.2114 0.608899 10.4222 0.960187 10.4222C1.31148 10.4222 1.52225 10.2348 1.63934 10.0943C1.75644 9.97719 1.80328 9.95377 1.92037 9.95377C2.03747 9.95377 2.08431 10.0006 2.20141 10.0943C2.3185 10.2114 2.52927 10.4222 2.88056 10.4222C3.23185 10.4222 3.44262 10.2348 3.55972 10.0943C3.67682 9.97719 3.72365 9.95377 3.84075 9.95377C3.95785 9.95377 4.00468 10.0006 4.12178 10.0943C4.23888 10.2114 4.44965 10.4222 4.80094 10.4222C5.15222 10.4222 5.363 10.2348 5.48009 10.0943C5.59719 9.97719 5.64403 9.95377 5.76112 9.95377C5.87822 9.95377 5.92506 10.0006 6.04215 10.0943C6.11241 10.1645 6.18267 10.2348 6.27635 10.2816C6.48712 12.366 8.24356 14.0053 10.3747 14.0053C12.4824 14.0053 14.2155 12.4362 14.4731 10.3987C14.7541 10.3519 14.8946 10.2114 15.0117 10.0943C15.1288 9.97719 15.1756 9.95377 15.2927 9.95377C15.4098 9.95377 15.4567 10.0006 15.5738 10.0943C15.7143 10.2114 15.9016 10.4222 16.2529 10.4222C16.6042 10.4222 16.815 10.2348 16.9321 10.0943C17.0492 9.97719 17.096 9.95377 17.2131 9.95377C17.3302 9.95377 17.377 10.0006 17.4941 10.0943C17.6347 10.2114 17.822 10.4222 18.1733 10.4222C18.5246 10.4222 18.7354 10.2348 18.8525 10.0943C18.9696 9.97719 19.0164 9.95377 19.1335 9.95377C19.2506 9.95377 19.2974 10.0006 19.4145 10.0943C19.555 10.2114 19.7424 10.4222 20.0937 10.4222V9.83668C19.8829 9.83668 19.8361 9.78984 19.719 9.69616ZM11.8267 10.5627C11.8267 11.0311 11.452 11.4292 10.9602 11.4292H10.7026V12.3191H10.1171V11.4292H8.99297V10.8437H10.9602C11.1007 10.8437 11.2412 10.7266 11.2412 10.5627V10.469C11.2412 10.3285 11.1241 10.188 10.9602 10.188H9.69555C9.22717 10.188 8.82904 9.81326 8.82904 9.32146V9.22778C8.82904 8.7594 9.20375 8.36127 9.69555 8.36127H10.1171V7.49476H10.7026V8.38469H11.6862V8.97017H9.71897C9.57845 8.97017 9.43794 9.08726 9.43794 9.2512V9.34488C9.43794 9.48539 9.55504 9.6259 9.71897 9.6259H10.9836C11.452 9.6259 11.8501 10.0006 11.8501 10.4924V10.5627H11.8267Z" fill={fill} />
      <path d="M1.52249 5.12845H4.3328V8.61791H4.91828V4.54297H0.937012V8.57107H1.52249V5.12845Z" fill={fill} />
      <path d="M6.32327 3.27689H9.13358V5.43145H9.71906V2.69141H5.73779V8.00757H6.32327V3.27689Z" fill={fill} />
      <path d="M11.1241 1.75736H13.9344V7.07351H14.5198V1.17188H10.5386V5.43417H11.1241V1.75736Z" fill={fill} />
      <path d="M15.9248 0.58548H18.7351V8.94614H19.3206V0H15.3394V8.94614H15.9248V0.58548Z" fill={fill} />
    </svg>
  )
}