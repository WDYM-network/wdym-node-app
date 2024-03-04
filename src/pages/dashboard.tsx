import { useEffect, useState } from 'react';
import activeImg from '../../assets/images/new/active.svg';
import wdym from '../../assets/images/new/flat.svg';
import axios from 'axios';
import ee from '../components/ee';
import {
  API_URL,
  APP_VERSION,
  BASE_RPC_URL,
  CHAIN,
  CONTRACT_ADDRESS,
} from '../renderer/config';
import { ethers } from 'ethers';
import { abi } from '../components/abi';

declare var window: any;

const Dashboard = () => {
  const [wallet, setWallet] = useState<any>(sessionStorage.getItem('wallet'));
  const [total, setTotal] = useState(0);
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
  }, [wallet]);

  useEffect(() => {
    if (!wallet) {
      setTotal(0);
      setTotalReward(0);
      getStaker(null);
    } else {
      countNodes(wallet);
      getTotalReward(wallet);
      getStaker(wallet);
    }
    const id = setInterval(() => {
      if (wallet) {
        getTotalReward(wallet);
        getStaker(wallet);
      }
    }, 30000);
    return () => clearInterval(id);
  }, [wallet]);

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

  const getChainId = async (provider: any) => {
    if (!provider) {
      let walletType = sessionStorage.getItem('wallet_type');
      console.log('walletType -> ', walletType);
      switch (walletType) {
        case 'metamask':
          provider = window.metamask?.getProvider();
          break;
        case 'walletconnect':
          provider = window.walletConnect;
          break;
        default:
          break;
      }
    }
    let chainId = await provider?.request({ method: 'eth_chainId' });
    return chainId;
  };

  const claimClickHandler = async (e: any) => {
    try {
      // kiểm tra xem người dùng đã kết nối ví chưa
      if (!wallet) {
        ee.dispatch('page-message', 'Please connect your wallet first');
        return;
      }
      let provider = null;
      let walletType = sessionStorage.getItem('wallet_type');
      console.log('walletType -> ', walletType);
      switch (walletType) {
        case 'metamask':
          provider = window.metamask?.getProvider();
          break;
        case 'walletconnect':
          provider = window.walletConnect;
          break;
        default:
          break;
      }
      if (!provider) {
        ee.dispatch('page-message', 'Please connect your wallet first');
        return;
      }

      let chainId = await getChainId(provider);
      if (chainId != CHAIN.chainId) {
        ee.dispatch('page-message', {
          text: `Please switch your wallet to ${CHAIN.chainName}`,
          type: 'info',
          timeout: 10 * 1000,
        });
        return;
      }

      let res = await axios.post(`${API_URL}/nodes/claim`, {
        walletAddress: wallet,
        v: APP_VERSION,
      });
      if (res.status == 200) {
        let contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          abi,
          ethers.getDefaultProvider(BASE_RPC_URL),
        );
        let params: any = [
          res.data.tokenAmount,
          res.data.tokenNonce,
          res.data.tokenSignature,
        ];
        console.log('params -> ', params);
        await contract.claimReward.estimateGas(...params, {
          from: wallet,
        });

        let data = contract.interface.encodeFunctionData('claimReward', params);
        console.log('data -> ', data);

        ee.dispatch('page-message', {
          text: 'Please approve request using your wallet to claim reward.',
          timeout: 120 * 1000,
        });

        console.log('provider -> ', provider);
        let tx = await provider?.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: wallet,
              to: CONTRACT_ADDRESS,
              data,
            },
          ],
        });
        console.log('tx -> ', tx);
        if (tx) {
          ee.dispatch(
            'page-message',
            'Your transaction was submitted successfully.',
          );
          setTimeout(() => {
            getTotalReward(wallet);
          }, 3000);
        }
      }
    } catch (e: any) {
      console.error(e);
      if (e.code == -32603 || e.data?.code == -32000) {
        ee.dispatch('page-message', {
          text: 'Sorry. You do not have enough ether to complete this transaction',
          type: 'info',
          timeout: 10 * 1000,
        });
      } else {
        console.log(e);
        ee.dispatch('page-message', {
          text:
            e.response?.data?.message ||
            e.reason ||
            e.data?.message ||
            e.error?.message ||
            e.message,
          type: 'info',
          timeout: 10 * 1000,
        });
      }
    }
  };

  return (
    <>
      <div className="lg:py-[60px]">
        <div className="container">
          <div className="pt-[64px] pb-4 md:flex items-center">
            <p className="font-semibold text-white">City Node Status</p>
          </div>
        </div>
        <div className="border-t border-b border-border text-center py-6">
          <div className="container">
            <div className="relative flex items-center justify-center min-h-[300px]">
              <h2 className="text-[32px] lg:text-[45px] lg:leading-[52px] font-medium mb-4 flex items-center">
                <img className="mr-2" src={activeImg} alt="" />
                Your node is active
              </h2>
              {/* <p className="inline-flex items-center px-4 py-3 border border-border text-[#E9A800] absolute bottom-0 right-0 text-[12px]">
                <i className="wdymnode-error mr-2"></i>
                Last challenge 28m ago
              </p> */}
            </div>
          </div>
        </div>
        <div className="border-b border-border">
          <div className="container">
            <div className="md:flex items-center">
              <div className="flex-1 border-r border-l border-border border-b md:border-b-0">
                <p className="text-[22px] font-medium leading-[28px] py-3.5 text-white border-b border-border xl:px-10 px-4">
                  Rewards
                </p>
                <div className="py-6 xl:px-10 px-4">
                  <p className="text-[14px] mb-0.5">esWDYM balance</p>
                  <div className="flex items-center text-[32px] font-medium text-white">
                    <img className="mr-2 w-6" src={wdym} alt="" />
                    {Math.round(
                      1000 * (Number(staker?.rewardAmount || 0) + Number(totalReward || 0)),
                    ) / 1000}
                  </div>
                </div>
              </div>
              <div className="flex-1 border-r border-border border-b md:border-b-0 border-l md:border-l-0">
                <div className="flex items-center border-b border-border xl:px-10 px-4">
                  <p className="text-[22px] font-medium leading-[28px] py-3.5 text-white mr-auto text-ellipsis overflow-hidden whitespace-nowrap">
                    Unclaimed Rewards
                  </p>
                  <button
                    onClick={claimClickHandler}
                    className="py-1.5 px-4 text-[14px] font-medium bg-[#1A1B21] border-[#1A1B21] text-primary"
                  >
                    Claim
                  </button>
                </div>
                <div className="py-6 xl:pl-10 px-4">
                  <p className="text-[14px] mb-0.5">esWDYM balance</p>
                  <div className="flex items-center text-[32px] font-medium text-white">
                    <img className="mr-2 w-6" src={wdym} alt="" />
                    {Math.round(totalReward * 1000) / 1000}
                  </div>
                </div>
              </div>
              <div className="flex-1 border-r border-border border-l md:border-l-0">
                <div className="flex items-center border-b border-border xl:px-10 px-4">
                  <p className="text-[22px] font-medium leading-[28px] py-3.5 text-white mr-auto">
                    Keys
                  </p>
                  <button className="py-1.5 px-4 text-[14px] font-medium bg-[#1A1B21] border-[#1A1B21] text-primary">
                    Buy keys
                  </button>
                </div>
                <div className="py-6 xl:pl-10 px-4">
                  <div className="flex items-center text-[32px] font-medium text-white">
                    <i className="wdymnode-key mr-2 text-[24px]"></i>
                    <div>
                      {total}
                      <p className="text-[14px] text-colorOpacity">
                        In 1 wallets
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
