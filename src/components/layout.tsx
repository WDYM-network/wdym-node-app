import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';
// import logoToken from '../../assets/images/logo-token.png';
// import logout from '../../assets/images/icon/logout.svg';
// import use from '../../assets/images/icon/use.svg';
// import gif from '../../assets/images/icon/gif.svg';
// import home from '../../assets/images/icon/key.svg';
// import argent from '../../assets/images/wallets/argent.svg';
// import bitkeep from '../../assets/images/wallets/bitkeep.svg';
// import coinbase from '../../assets/images/wallets/coinbase.svg';
// import imwallet from '../../assets/images/wallets/imwallet.svg';
// import onto from '../../assets/images/wallets/onto.svg';
// import steakwallet from '../../assets/images/wallets/steakwallet.svg';
// import trust from '../../assets/images/wallets/trust.svg';
// import metamaskIcon from '../../assets/images/wallets/metamask.svg';
// import walletconnectIcon from '../../assets/images/wallets/walletconnect.svg';
// import x from '../../assets/images/x.svg';
// import discord from '../../assets/images/discord.svg';
// import tele from '../../assets/images/tele.svg';
// import close from '../../assets/images/icon/close.svg';
import { MetaMaskSDK, SDKProvider } from '@metamask/sdk';
import QRCode from 'qrcode';
// import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import ee from './ee';
import {
  API_URL,
  APP_VERSION,
  CHAIN,
  WALLET_CONNECT_PROJECT_ID,
  WEB_URL,
} from '../renderer/config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

let lastMessageTimeout: any = null;

declare var window: any;

const socialLinks = [
  {
    title: 'Gitbook',
    url: 'https://wdym.gitbook.io/document/introduce/wdym',
    imageUrl: 'wdymnode-file',
  },
  {
    title: 'Discord',
    url: 'https://discord.com/invite/f3cH349VS7',
    imageUrl: 'wdymnode-discord',
  },
  {
    title: 'X',
    url: 'https://twitter.com/wdym_wtf',
    imageUrl: 'wdymnode-x',
  },
];

const Layout = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  // const [profile, setProfile] = useState<boolean>(false);
  const [metamask, setMetamask] = useState<any>(null);
  const [walletConnect, setWalletConnect] = useState<any>(null);

  const [message, setMessage] = useState<any>({
    text: '',
    type: '', //error,warning,success,info
    timeout: 1000,
  });

  const showMessage = (text: any, type: any = 'info', timeout: any = 5000) => {
    if (lastMessageTimeout) {
      clearTimeout(lastMessageTimeout);
    }
    setMessage({
      text,
      type,
      timeout,
    });
    lastMessageTimeout = setTimeout(() => {
      setMessage({
        text: '',
      });
      clearTimeout(lastMessageTimeout);
    }, timeout);
  };

  const pageMessageChanged = (data: any) => {
    if (typeof data === 'string') {
      showMessage(data, 'info', 5000);
      return;
    }
    showMessage(data?.text, data?.type, data?.timeout);
  };

  useEffect(() => {
    setMessage('');
    ee.on('page-message', pageMessageChanged);
    return () => {
      ee.remove('page-message', pageMessageChanged);
    };
  }, []);

  useEffect(() => {
    setMessage('');
    ee.on('show-wallet-connect', showLoginWallet);
    return () => {
      ee.remove('show-wallet-connect', showLoginWallet);
    };
  }, [walletConnect]);

  useEffect(() => {
    sessionStorage.setItem('wallet', wallet);
  }, [wallet]);

  const initWalletConnect = async (): Promise<any> => {
    const provider = await EthereumProvider.init({
      projectId: WALLET_CONNECT_PROJECT_ID, // REQUIRED your projectId
      chains: [CHAIN.chainId], // REQUIRED chain ids
      showQrModal: true, // REQUIRED set to "true" to use @walletconnect/modal,
      metadata: {
        name: 'WDYM Client - Get WDYM City node',
        description: 'WDYM Client - Get WDYM City node',
        url: window.location.host || WEB_URL,
        icons: [],
      },
      rpcMap: {
        [CHAIN.chainId]: CHAIN.rpcUrls[0],
      },
    });
    // chain changed
    provider.on('chainChanged', () => {});
    // accounts changed
    provider.on('accountsChanged', () => {});
    // session established
    provider.on('connect', () => {});
    // session event - chainChanged/accountsChanged/custom events
    provider.on('session_event', () => {});
    // connection uri
    provider.on('display_uri', () => {});
    // session disconnect
    provider.on('disconnect', () => {});
    setWalletConnect(provider);
    // await provider.enable();
    window.walletConnect = provider;
    return provider;
  };

  const initMetamaskSdk = async () => {
    if (metamask) {
      return;
    }
    const sdk = new MetaMaskSDK({
      dappMetadata: {
        name: 'WDYM Client - Get WDYM City node',
        url: window.location.host || WEB_URL,
      },
      modals: {
        install: ({ link }) => {
          console.log('install', link);
          QRCode.toCanvas(
            document.getElementById('qr-code'),
            link,
            (error: any) => {
              if (error) console.error(error);
            },
          );
          return {};
        },
        otp: () => {
          return {
            updateOTPValue: (otpValue) => {
              console.log('otpValue -> ', otpValue);
              if (otpValue) {
                showMessage(`Metamask OTP: ${otpValue}`, 'info', 60 * 1000);
              }
            },
          };
        },
      },
    });
    setMetamask(sdk);
    await sdk.init();
    let ethereum = sdk?.getProvider();
    ethereum.on('chainChanged', (chain: any) => {
      console.log(`chainChanged ${chain}`);
    });

    ethereum.on('accountsChanged', (accounts: any) => {
      console.log(`accountsChanged -> `, accounts);
      if (!accounts || accounts.length <= 0) {
        appLogout();
      } else {
        setWallet(accounts[0]);
        ee.dispatch('wallet-changed', accounts[0]);
      }
    });

    ethereum.on('connect', () => {
      console.log('connect');
    });
    console.log('Initialized');
    window.metamask = sdk;
  };

  useEffect(() => {
    (async () => {
      initMetamaskSdk();

      let _walletConnect = await initWalletConnect();
      if (sessionStorage.getItem('wallet')) {
        try {
          await _walletConnect.enable();
          const accounts = await _walletConnect.request({
            method: 'eth_requestAccounts',
          });
          console.log(
            'walletConnectClickHandler -> eth_requestAccounts -> accounts -> ',
            accounts,
          );
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            sessionStorage.setItem('wallet', accounts[0]);
            sessionStorage.setItem('wallet_type', 'walletconnect');
            ee.dispatch('wallet-changed', accounts[0]);
          }
        } catch (e: any) {}
      }
    })();
  }, [1]);

  const showLoginWallet = async () => {
    // setLoginWallet(!loginWallet);
    walletConnectClickHandler();
  };

  // const showProfile = () => {
  //   setProfile(!profile);
  // };

  const walletConnectClickHandler = async () => {
    try {
      await walletConnect.enable();
      const accounts = await walletConnect.request({
        method: 'eth_requestAccounts',
      });
      console.log(
        'walletConnectClickHandler -> eth_requestAccounts -> accounts -> ',
        accounts,
      );
      if (accounts.length > 0) {
        setWallet(accounts[0]);
        sessionStorage.setItem('wallet', accounts[0]);
        sessionStorage.setItem('wallet_type', 'walletconnect');
        ee.dispatch('wallet-changed', accounts[0]);
      } else {
        ee.dispatch('page-message', 'No wallet connected');
        appLogout();
      }
    } catch (e: any) {
      ee.dispatch('page-message', `ERROR: ${JSON.stringify(e)}`);
      console.log(e);
      appLogout();
    }
  };

  // const metamaskClickHandler = async () => {
  //   try {
  //     showMessage(
  //       'Please open your Metamask to scan QR code or enter OTP to connect.',
  //       'info',
  //       60 * 1000,
  //     );
  //     let ethereum = metamask?.getProvider();
  //     let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  //     console.error('eth_requestAccounts -> accounts -> ', accounts);
  //     if (accounts.length > 0) {
  //       setWallet(accounts[0]);
  //       // showLoginWallet();
  //       sessionStorage.setItem('wallet_type', 'metamask');
  //       ee.dispatch('wallet-changed', accounts[0]);
  //     } else {
  //       ee.dispatch('page-message', 'No wallet connected');
  //       appLogout();
  //     }
  //   } catch (e: any) {
  //     ee.dispatch('page-message', JSON.stringify(e));
  //     console.log(e);
  //     appLogout();
  //   } finally {
  //     showMessage('', 'info', 0);
  //   }
  // };

  const logoutClickHandler = async () => {
    if (metamask) {
      metamask.terminate();
    }
    if (walletConnect) {
      walletConnect.disconnect();
    }
    appLogout();
  };

  const appLogout = () => {
    setWallet(null);
    // setProfile(false);
    sessionStorage.removeItem('wallet');
    sessionStorage.removeItem('wallet_type');
    indexedDB.deleteDatabase('WALLET_CONNECT_V2_INDEXED_DB');
    indexedDB.deleteDatabase('WALLET_CONNECT_INDEXED_DB');
    navigate('/');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        let _wallet = wallet || sessionStorage.getItem('wallet');
        if (_wallet) {
          axios.post(`${API_URL}/nodes/validate`, {
            walletAddress: _wallet,
          });
        }
      } catch (e) {
        console.log(e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [1]);

  useEffect(() => {
    try {
      axios
        .get(`${API_URL}/stakers/check/update/${APP_VERSION}`)
        .then((res: any) => {
          if (res.data?.update && res.data?.message) {
            showMessage(res.data?.message, 'info', 60 * 1000);
          }
        });
    } catch (e) {
      console.log(e);
    }
  }, [1]);

  return (
    <>
      <div className="main p-0 relative bg-bg min-h-screen">
        <header className="header z-20 py-3 bg-header lg:fixed top-0 z-[1] w-full">
          <div className="flex items-center container">
            <Link className="mr-auto" to={`/`}>
              <img className="w-[130px]" src={logo} alt="" />
            </Link>
            <div className="flex items-center">
              {!wallet && (
                <button
                  onClick={walletConnectClickHandler}
                  className="flex justify-center items-center"
                >
                  <i className="wdymnode-wallet1 mr-2"></i>
                  Connect Wallet
                </button>
              )}
              {wallet && (
                <div className="relative">
                  {/* <div
                    onClick={showProfile}
                    className="flex justify-center items-center lg:px-6 lg:py-2.5 p-4 rounded-lg border border-border cursor-pointer text-[16px]"
                  >
                    <img
                      className="w-8 h-8 rounded-full mr-3"
                      src={logoToken}
                      alt=""
                    />
                    {wallet.substring(0, 4)}...
                    {wallet.substring(wallet.length - 4, wallet.length)}
                  </div> */}
                  <div className="flex items-center text-[14px]">
                    <Link
                      to={'/'}
                      className="cursor-pointer flex items-center py-4 hover:text-primary group"
                    >
                      <i className="wdymnode-home mr-2 text-[20px] text-white group-hover:text-primary"></i>
                      <span className="hidden sm:inline-block">
                        wdym Client
                      </span>
                    </Link>
                    <Link
                      to={'/dashboard'}
                      className="cursor-pointer flex items-center py-4 lg:pl-[48px] pl-4 hover:text-primary group"
                    >
                      <i className="wdymnode-grid mr-2 text-[20px] text-white group-hover:text-primary"></i>
                      <span className="hidden sm:inline-block">Dashboard</span>
                    </Link>
                    <Link
                      to={'/my-wallet'}
                      className="cursor-pointer flex items-center py-4 lg:pl-[48px] pl-4 hover:text-primary group"
                    >
                      <i className="wdymnode-wallet1 mr-2 text-[20px] text-white group-hover:text-primary"></i>
                      <span className="hidden sm:inline-block">My Wallet</span>
                    </Link>

                    <button
                      onClick={logoutClickHandler}
                      className="py-1.5 px-4 text-[14px] font-medium bg-[#1A1B21] border-[#1A1B21] text-primary  flex items-center ml-5"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
              {/* {loginWallet && (
                <div className="flex items-center justify-center fixed z-30 h-full w-full top-0 left-0">
                  <div className="mx-[15px] bg-login-popup rounded-xl p-4 lg:p-[64px] sm:p-[30px_20px] border border-border relative md:w-[772px] w-full z-[1] flex flex-col justify-center">
                    <img
                      onClick={showLoginWallet}
                      className="w-6 absolute right-5 top-5 cursor-pointer"
                      src={close}
                      alt=""
                    />
                    <h3 className="mb-8 inline-flex text-gradient">
                      Connect your wallet
                    </h3>
                    <div className="flex flex-wrap md:-mx-4 -mx-2">
                      <div className="flex-[0_0_50%] md:px-4 px-2 md:mb-8 mb-4">
                        <div
                          className={
                            'cursor-pointer p-3 rounded-lg border border-border flex items-center mb-3'
                          }
                          onClick={metamaskClickHandler}
                        >
                          <img
                            className="w-6 mr-3"
                            src={metamaskIcon}
                            alt=""
                          />
                          <p className="font-fontHeading font-semibold text-[14px]">
                            MetaMask
                          </p>
                        </div>
                        <div className="items-center">
                          <canvas className="mx-auto" id="qr-code"></canvas>
                        </div>
                      </div>
                      <div className="flex-[0_0_50%] md:px-4 px-2 md:mb-8 mb-4">
                        <div
                          className={
                            'cursor-pointer p-3 rounded-lg border border-border flex items-center'
                          }
                          onClick={walletConnectClickHandler}
                        >
                          <img
                            className="w-6 mr-3"
                            src={walletconnectIcon}
                            alt=""
                          />
                          <p className="font-fontHeading font-semibold text-[14px]">
                            WalletConnect
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={showLoginWallet}
                    className="top-0 left-0 bg-[rgba(236,234,234,0.8)] absolute h-full w-full content-[''] cursor-pointer"
                  ></div>
                </div>
              )} */}
            </div>
          </div>
          {/* <button onClick={sendEthClickHandler}>Click</button> */}
        </header>
        <Outlet />
        <footer className="lg:py-8 py-4 lg:fixed bottom-0 z-[1] w-full">
          <div className="flex items-center justify-center">
            {socialLinks.map((item: any, index: any) => {
              return (
                <a key={index} className="px-2" href={item.url} target="_blank">
                  <i
                    className={`${item.imageUrl} w-10 h-10 lg:mx-4 mx-2 flex items-center justify-center`}
                  ></i>
                </a>
              );
            })}
          </div>
        </footer>
      </div>
      {message?.text && (
        <div className="fixed bottom-[15px] left-[15px] z-[1000] p-[8px_5px_5px_5px] text-white bg-black text-[85%] px-[12px] rounded-[5px]">
          <span className={message.type === 'error' ? 'error' : ''}>
            &nbsp;
            {message.text}
          </span>
        </div>
      )}
    </>
  );
};

export default Layout;
