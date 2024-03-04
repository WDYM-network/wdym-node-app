import { useEffect, useState } from 'react';

import axios from 'axios';

import wdym from '../../assets/images/new/flat.svg';
import activeImg from '../../assets/images/new/active.svg';

import { API_URL, WEB_URL } from '../renderer/config';
import ee from '../components/ee';

declare var window: any;

const Mywallet = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(sessionStorage.getItem('wallet'));
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalReward, setTotalReward] = useState(0);
  const [staker, setStaker] = useState<any>(null);

  const newWalletHandler = (newWallet: any) => {
    setWallet(newWallet);
  };

  useEffect(() => {
    ee.on('wallet-changed', newWalletHandler);
    return () => {
      ee.remove('wallet-changed', newWalletHandler);
    };
  }, [wallet, nodes, page]);

  useEffect(() => {
    if (page != 1) {
      setPage(1);
    }
    if (!wallet) {
      setTotal(0);
      setNodes([...[]]);
      setTotalReward(0);
      setStaker(null);
    } else {
      getNodes(wallet, page);
      countNodes(wallet);
      getTotalReward(wallet);
      setStaker(wallet);
    }
    const id = setInterval(() => {
      if (wallet) {
        getTotalReward(wallet);
        setStaker(wallet);
      }
    }, 30000);
    return () => clearInterval(id);
  }, [wallet]);

  useEffect(() => {
    if (wallet) {
      getNodes(wallet, page);
    }
  }, [page]);

  const getNodes = async (_walletAddress: any, _page: any) => {
    try {
      let res = await axios.get(`${API_URL}/nodes`, {
        params: {
          page: _page,
          limit,
          walletAddress: _walletAddress,
          sort: '_id,-1',
        },
      });
      if (+res.status == 200) {
        setNodes([...(res.data.nodes || [])]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const countNodes = async (_walletAddress: any) => {
    try {
      let res = await axios.get(`${API_URL}/nodes/count`, {
        params: {
          walletAddress: _walletAddress,
        },
      });
      console.log(res);
      if (+res.status == 200) {
        setTotal(res.data.count || 0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getTotalReward = async (_wallet: any) => {
    try {
      let res = await axios.get(`${API_URL}/nodes/${_wallet}/token`);
      console.log(res);
      if (+res.status == 200) {
        setTotalReward(res.data.totalReward || 0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const refreshClickHandler = async (e: any) => {
    e.preventDefault();
    if (wallet) {
      getNodes(wallet, page);
      countNodes(wallet);
      getTotalReward(wallet);
      getStaker(wallet);
    }
  };

  const getStaker = async (_wallet: any) => {
    try {
      let res = await axios.get(`${API_URL}/stakers/${_wallet}`);
      console.log(res);
      if (+res.status == 200) {
        setStaker(res.data?.staker);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="lg:py-[60px]">
        <div className="container">
          <div className="pt-[64px] pb-4 lg:flex items-start">
            <div className="mr-auto mb-2 lg:mb-0">
              <div className="md:flex items-center">
                <h1 className="md:text-[32px] md:leading-[40px] font-medium mr-4 mb-4">
                  My Wallet
                </h1>
                <div className="flex items-center">
                  <p className="font-bold text-[12px] leading-[16px] tracking-[0.5px] px-4 py-1.5 rounded-full bg-[#1A1B21] mr-4 mb-4">
                    CITY active
                  </p>
                  <p className="font-bold text-[12px] leading-[16px] tracking-[0.5px] px-4 py-1.5 rounded-full bg-[#1A1B21] mr-4 mb-4">
                    {total} key in 1 wallet
                  </p>
                </div>
                <div className="flex items-center">
                  {/* <p className="flex items-center cursor-pointer text-[14px] text-primary hover:text-white mb-4 mr-4">
                    <i className="wdymnode-refetch mr-2 text-[16px]"></i>
                    Refresh
                  </p> */}
                  <a href={WEB_URL} target="_blank" rel="noreferrer noopener">
                    <button className="btn-outline border-[#90909A] flex items-center py-2 text-primary mb-4">
                      <i className="wdymnode-key mr-2 text-[16px]"></i>
                      Purchase keys
                    </button>
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <p className="text-[14px] text-[#DEE1F9] text-ellipsis overflow-hidden whitespace-nowrap">
                  {wallet}
                </p>
                <i
                  onClick={() => {
                    // copy to clipboard
                    navigator.clipboard.writeText(wallet);
                    ee.dispatch('page-message', {
                      text: 'Copied to clipboard',
                      type: 'info',
                      timeout: 5 * 1000,
                    });
                  }}
                  className="wdymnode-duplicate ml-2 text-primary hover:text-white cursor-pointer"
                ></i>
              </div>
            </div>
            <button
              onClick={refreshClickHandler}
              className="py-1.5 px-4 text-[14px] font-medium bg-[#1A1B21] border-[#1A1B21] text-primary  flex items-center"
            >
              <i className="wdymnode-refetch mr-2 text-[16px]"></i>
              Refresh
            </button>
          </div>
        </div>
        <div className="border-t border-b border-border">
          <div className="container">
            <div className="py-4">
              <div className="flex items-center mb-3.5">
                <h3 className="text-[24px] font-medium leading-[32px] mr-7">
                  esWDYM balance
                </h3>
                {/* <p className="flex items-center cursor-pointer text-[14px] text-primary hover:text-white">
                  <i className="wdymnode-refetch mr-2 text-[16px]"></i>
                  Refresh
                </p> */}
              </div>
              <div className="flex items-center">
                <img className="mr-4" src={wdym} alt="" />
                <p className="font-medium text-[36px] text-primary">
                  {' '}
                  {Math.round(
                    1000 *
                      (Number(staker?.rewardAmount || 0) +
                        Number(totalReward || 0)),
                  ) / 1000}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-border">
          <div className="container">
            <div className="overflow-x-auto">
              <table className="w-full border-l border-r border-border">
                <thead>
                  <tr>
                    <th>KEY ID</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes?.map((node, index) => {
                    return (
                      <tr key={index}>
                        <td className="text-primary">{node.nodeId}</td>
                        <td>
                          <p className="flex items-center">
                            <img className="mr-2 w-3" src={activeImg} alt="" />
                            Claiming rewards when available
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Mywallet;
