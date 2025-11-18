import React from 'react';

const Earth: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[-1] pointer-events-none"
      aria-hidden="true"
      style={{
        backgroundImage:
          'url(https://drive.google.com/uc?export=view&id=1HdvsaLNGiidYCdCnVnpUG6jbVpBTCTeY)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '160vw auto', // 預設桌機很寬的效果
        backgroundPosition: 'center bottom',
        backgroundColor: 'transparent',
        transition: 'transform 0.5s ease, background-size 0.5s ease',
      }}
    >
      {/* 使用媒體查詢動態調整位置與大小 */}
      <style>
        {`
          @media (max-width: 768px) {
            div[aria-hidden="true"] {
              background-size: 200vw auto;
              transform: translateY(10vh);
            }
          }

          @media (min-width: 769px) and (max-width: 1200px) {
              div[aria-hidden="true"] {
                background-size: 180vw auto;
                transform: translateY(15vh);
              }
          }

          @media (min-width: 1201px) {
              div[aria-hidden="true"] {
                background-size: 160vw auto;
                transform: translateY(20vh);
              }
          }
        `}
      </style>
    </div>
  );
};

export default Earth;
