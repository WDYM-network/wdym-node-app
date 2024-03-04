import { Link } from 'react-router-dom';
import wdym  from '../../assets/images/new/flat.svg';
import close  from '../../assets/images/new/close.svg';

const Keys = () => {
  return (
    <>
    <div className="lg:py-[60px]">
      <div className="container">
          <div className="pt-[64px] pb-4 md:flex items-center">
            <div className="mr-auto mb-2 md:mb-0">
              <div className="md:flex items-center">
                <h1 className="md:text-[32px] md:leading-[40px] font-medium mr-4 mb-4">My Wallet</h1>
                <div className="flex items-center">
                  <p className="font-bold text-[12px] leading-[16px] tracking-[0.5px] px-4 py-1.5 rounded-full bg-[#1A1B21] mr-4 mb-4">CITY active</p>
                  <p className="font-bold text-[12px] leading-[16px] tracking-[0.5px] px-4 py-1.5 rounded-full bg-[#1A1B21] mr-4 mb-4">No ETH</p>
                  <p className="font-bold text-[12px] leading-[16px] tracking-[0.5px] px-4 py-1.5 rounded-full bg-[#1A1B21] mr-4 mb-4">No keys assigned</p>
                </div>
              </div>
              <div className="flex items-center">
                <p className="text-[14px] text-[#DEE1F9] text-ellipsis overflow-hidden whitespace-nowrap">0x6f88574F4a408ad62f713d46f548BcfDAcEeF90F</p>
                <i className="wdymnode-duplicate ml-2 text-primary hover:text-white cursor-pointer"></i>
              </div>
            </div>
            <button className="btn-outline border-[#90909A] flex items-center">
              <i className="wdymnode-refetch mr-2 text-[16px]"></i>
            Refresh
            </button>
          </div>
      </div>
      <div className="border-t border-b border-border mb-10">
        <div className="container md:flex items-center">
            <div className="flex-1 py-4 lg:pr-10 pr-4">
              <div className="flex items-center mb-3.5">
                <h3 className="text-[24px] font-medium leading-[32px] mr-7">My Wallet Balance</h3>
                <p className="flex items-center cursor-pointer text-[14px] text-primary hover:text-white">
                  <i className="wdymnode-refetch mr-2 text-[16px]"></i>
                  Refresh
                </p>
              </div>
              <div className='flex items-center'>
                <img className='mr-4' src={wdym} alt="" />
                <p className='font-medium text-[36px] text-primary'>0 wdym</p>
              </div>
            </div>
            <div className="flex-1 py-4 lg:pl-10">
              <div className="sm:flex items-center">
                <h3 className="text-[24px] leading-[32px] font-medium mr-2 mb-4 sm:mb-0">Assigned Keys</h3>
                <div className='flex items-center'>
                  <p className="font-bold text-[12px] leading-[16px] tracking-[0.5px] px-4 py-1.5 rounded-full bg-[#1A1B21] mr-4">No keys</p>
                  <p className="flex items-center cursor-pointer text-[14px] text-primary hover:text-white">
                    <i className="wdymnode-refetch mr-2 text-[16px]"></i>
                    Refresh
                  </p>
                </div>
              </div>
            </div>
        </div>
      </div>
      <div className='container'>
          <div className='sm:max-w-[650px] sm:mx-auto lg:p-[64px] p-5 text-center'>
            <img className='mx-auto mb-10' src={close} alt="" />
            <h2 className='text-[32px] lg:text-[45px] lg:leading-[52px] font-medium mb-4'>Wallet not connected</h2>
            <p className='text-colorOpacity pb-[48px]'>Connect wallets to assign keys to the City</p>
            <button
              className="flex justify-center items-center mx-auto mb-10"
            >
              <i className='wdymnode-wallet1 mr-2'></i>
              Connect Wallet
            </button>
            <p className='font-semibold text-colorOpacity'>Don't own any keys? <Link className="text-primary" to="/">Purchase keys</Link></p>
          </div>
      </div>
    </div>
    </>
  );
};
export default Keys;
