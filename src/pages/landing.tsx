import { useEffect, useState } from 'react';
import clientImg from '../../assets/images/new/client.png';
import { ethers } from 'ethers';
import {
  API_URL,
  CHAIN,
  CONTRACT_ADDRESS,
  WEB_URL,
  BASE_RPC_URL,
} from '../renderer/config';
import { abi } from '../components/abi';
import ee from '../components/ee';
import { Link } from 'react-router-dom';
import axios from 'axios';

declare var window: any;

const Login = () => {
  // const [purchased, setPurchased] = useState(false);
  // const [contractState, setContractState] = useState<any>(null);
  // const [numberOfNode, setNumberOfNode] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  // const [couponPercent, setCouponPercent] = useState<any>(0);
  const [wallet, setWallet] = useState<any>(null);

  // useEffect(() => {
  //   loadState();
  // }, []);

  const newWalletHandler = (newWallet: any) => {
    console.log('newWallet -> ', newWallet);
    setWallet(newWallet);
  };

  useEffect(() => {
    ee.on('wallet-changed', newWalletHandler);
    return () => {
      ee.remove('wallet-changed', newWalletHandler);
    };
  }, [wallet]);

  // const loadState = async () => {
  //   let contract = new ethers.Contract(
  //     CONTRACT_ADDRESS,
  //     abi,
  //     ethers.getDefaultProvider(BASE_RPC_URL),
  //   );
  //   let _state = await contract._state();
  //   setContractState(_state);
  // };

  // const applyCouponCodeClickHandler = async () => {
  //   if (!couponCode || couponCode == '') {
  //     ee.dispatch('page-message', 'Please enter discount code');
  //     setCouponPercent(0);
  //     return;
  //   }
  //   try {
  //     let contract = new ethers.Contract(
  //       CONTRACT_ADDRESS,
  //       abi,
  //       ethers.getDefaultProvider(BASE_RPC_URL),
  //     );
  //     let discount = await contract.discounts(`${couponCode?.toUpperCase()}`);
  //     if (Number(discount.percent) <= 0 || Number(discount.count) <= 0) {
  //       ee.dispatch('page-message', 'Invalid discount code');
  //       setCouponPercent(0);
  //       return;
  //     } else {
  //       ee.dispatch('page-message', 'Discount code applied');
  //       setCouponPercent(Number(discount.percent));
  //     }
  //   } catch (e) {
  //     ee.dispatch('page-message', 'Invalid coupon code');
  //     setCouponPercent(0);
  //   }
  // };

  // const loginClickHandler = async (e: any) => {
  //   try {
  //     ee.dispatch('show-wallet-connect', null);
  //   } catch (e) {}
  // };

  // const getChainId = async (provider: any) => {
  //   if (!provider) {
  //     let walletType = sessionStorage.getItem('wallet_type');
  //     console.log('walletType -> ', walletType);
  //     switch (walletType) {
  //       case 'metamask':
  //         provider = window.metamask?.getProvider();
  //         break;
  //       case 'walletconnect':
  //         provider = window.walletConnect;
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  //   let chainId = await provider?.request({ method: 'eth_chainId' });
  //   return chainId;
  // };

  // const buyClickHandler = async (e: any) => {
  //   try {
  //     if (!wallet) {
  //       ee.dispatch('page-message', 'Please connect your wallet first');
  //       return;
  //     }
  //     let provider = null;
  //     let walletType = sessionStorage.getItem('wallet_type');
  //     console.log('walletType -> ', walletType);
  //     switch (walletType) {
  //       case 'metamask':
  //         provider = window.metamask?.getProvider();
  //         break;
  //       case 'walletconnect':
  //         provider = window.walletConnect;
  //         break;
  //       default:
  //         break;
  //     }
  //     if (!provider) {
  //       ee.dispatch('page-message', 'Please connect your wallet first');
  //       return;
  //     }

  //     let chainId = await getChainId(provider);
  //     if (chainId != CHAIN.chainId) {
  //       ee.dispatch('page-message', {
  //         text: `Please switch your wallet to ${CHAIN.chainName}`,
  //         type: 'info',
  //         timeout: 10 * 1000,
  //       });
  //       return;
  //     }

  //     let contract = new ethers.Contract(
  //       ethers.getAddress(CONTRACT_ADDRESS),
  //       abi,
  //       ethers.getDefaultProvider(BASE_RPC_URL),
  //     );
  //     let value =
  //       Math.round(
  //         ((Number(
  //           contractState?._nodePrice?.toString()
  //             ? ethers.formatEther(contractState?._nodePrice)
  //             : 0.04,
  //         ) *
  //           numberOfNode *
  //           (100 - couponPercent)) /
  //           100) *
  //           1000000,
  //       ) / 1000000;

  //     try {
  //       if (value > 0) {
  //         let balance = await ethers
  //           .getDefaultProvider(BASE_RPC_URL)
  //           .getBalance(wallet);
  //         if (Number(ethers.formatEther(balance)) <= value) {
  //           ee.dispatch('page-message', {
  //             text: 'You do not have enough ether to complete this transaction.',
  //             type: 'info',
  //             timeout: 10 * 1000,
  //           });
  //           return;
  //         }
  //       }
  //     } catch (e) {}

  //     let txInfo = {
  //       from: ethers.getAddress(wallet),
  //       value: ethers.parseEther(value.toString()),
  //     };
  //     console.log('txInfo -> ', txInfo);
  //     let params: any = [
  //       +value == 0 ? 1 : numberOfNode,
  //       ethers.ZeroAddress,
  //       couponCode?.toUpperCase() || '',
  //     ];
  //     console.log('params -> ', params);

  //     await contract.buyNodeKey.estimateGas(...params, txInfo);

  //     let data = contract.interface.encodeFunctionData('buyNodeKey', params);

  //     console.log('data -> ', data);

  //     ee.dispatch('page-message', {
  //       text: 'Please approve request using your wallet.',
  //       timeout: 120 * 1000,
  //     });

  //     console.log('provider -> ', provider);
  //     let tx = await provider?.request({
  //       method: 'eth_sendTransaction',
  //       params: [
  //         {
  //           ...txInfo,
  //           to: CONTRACT_ADDRESS,
  //           value: ethers.toQuantity(
  //             ethers.parseEther(value.toString()).toString(),
  //           ),
  //           data,
  //         },
  //       ],
  //     });
  //     console.log('tx -> ', tx);
  //     if (tx) {
  //       ee.dispatch(
  //         'page-message',
  //         'Transaction sent successfully. Please wait for confirmation.',
  //       );
  //       setTimeout(() => {
  //         setPurchased(true);
  //       }, 3000);
  //       // try {
  //       //   axios.post(`${API_URL}/activities`, {
  //       //     walletAddress: wallet,
  //       //     action: 'PURCHASE',
  //       //     source: 'APP',
  //       //     txParams: {
  //       //       hash: tx,
  //       //     },
  //       //     changed: value,
  //       //   });
  //       // } catch (e) {}
  //     }
  //   } catch (e: any) {
  //     console.error(e);
  //     if (e.code == -32603 || e.data?.code == -32000) {
  //       ee.dispatch('page-message', {
  //         text: 'Sorry. You do not have enough ether to complete this transaction',
  //         type: 'info',
  //         timeout: 10 * 1000,
  //       });
  //     } else {
  //       ee.dispatch('page-message', {
  //         text: e.reason || e.data?.message || e.error?.message || e.message,
  //         type: 'info',
  //         timeout: 10 * 1000,
  //       });
  //     }
  //   }
  // };

  return (
    <>
      <div className="lg:py-0 py-10 bg-banner bg-top w-full h-full bg-no-repeat min-h-screen flex items-center relative">
        <div className="md:w-[600px] w-full mx-auto text-center relative">
          <img className="mx-auto mb-[48px]" src={clientImg} alt="" />
          <h1 className="mb-6">Get WDYM City node</h1>
          <p className="mb-[53px] text-colorOpacity lg:text-[20px]">
            Purchase a key to start earning esWDYM
          </p>
          <a
            className="btn inline-flex items-center justify-center"
            href={WEB_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            <i className="wdymnode-key mr-2"></i>
            Purchase key
          </a>
        </div>
        {/* {purchased && (
          <div className="p-6 lg:px-8 lg:py-[64px] lg:max-w-[895px] w-full mx-auto border border-border rounded-[12px] font-fontHeading md:text-[16px] text-center bg-gradient-login2">
            <h2 className="md:text-[48px] mb-8">Purchase Successfully</h2>
            <h3 className="flex items-center justify-center sm:text-[32px] sm:leading-[24px] leading-normal mb-8 pb-8 border-b border-border">
              <img className="mr-3" src="images/avatar.png" alt="" />
              OX - Node Key
            </h3>
            <p className="sm:text-[24px] mb-4">Your nodes are being created.</p>
            <p className="py-3 px-6 inline-block mb-4">
              <span
                onClick={() => {
                  setPurchased(false);
                }}
              >
                Buy more nodes
              </span>
              &nbsp;/&nbsp;
              <Link to="/my-wallet">Start my nodes</Link>
            </p>
            <div className="mb-8 pb-8 border-b border-border"></div>
            <p className="font-medium md:text-[16px]">
              GO TO OX-Node APP, CONNECT WALLET to running node to earn rewards.
            </p>
          </div>
        )} */}
      </div>
    </>
  );
};

export default Login;
