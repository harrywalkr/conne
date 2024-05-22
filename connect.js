import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { useDispatch, useSelector } from "react-redux";
import { updateAccountData, disconnect } from "../features/blockchain";
import { ethers, utils } from "ethers";
import { Modal } from "react-bootstrap";
import Web3Modal from "web3modal";
import UserDrawer from './UserDrawer';


import networks from "../utils/networksMap.json";
import { ownerAddress } from "../utils/contracts-config";

import "./Connect.css"; // Import your custom CSS file for styling

const eth = window.ethereum;
let web3Modal = new Web3Modal();

function Connect() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.blockchain.value);

    const [injectedProvider, setInjectedProvider] = useState();
    const [show, setShow] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);

   
    async function fetchAccountData() {
        if (typeof window.ethereum !== 'undefined') {
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)

            setInjectedProvider(provider);

            const signer = provider.getSigner()
            const chainId = await provider.getNetwork()
            const account = await signer.getAddress()
            const balance = await signer.getBalance()

            dispatch(updateAccountData(
                {
                    account: account,
                    balance: utils.formatUnits(balance),
                    network: networks[String(chainId.chainId)]
                }
            ))
            console.log({
                account: account,
                balance: utils.formatUnits(balance),
                network: networks[String(chainId.chainId)]
            })
        }
        else {
            console.log("Please install metamask")
            window.alert("Please Install Metamask")
        }
    }

    async function Disconnect() {
        web3Modal.clearCachedProvider();
        if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
            await injectedProvider.provider.disconnect();
            setInjectedProvider(null)
        }
        dispatch(disconnect())
        setShow(false)
    }

    useEffect(() => {
        if (eth) {
            eth.on('chainChanged', (chainId) => {
                fetchAccountData()
            })
            eth.on('accountsChanged', (accounts) => {
                fetchAccountData()
            })
        }
    }, [])

    const isConnected = data.account !== "";






const handleToggleDrawer = () => {
    setShowDrawer(!showDrawer);
};

const handleDisconnect = () => {
    Disconnect(); // Call the Disconnect function when clicked
    setShowDrawer(false); // Close the drawer after disconnecting
};

return (
    
    <div className="connect-wrapper">
    {isConnected ? (
        <>
            <div className="connect-container" onMouseEnter={() => setShowDrawer(true)} onMouseLeave={() => setShowDrawer(false)}>
                <button className="btn btn-secondary m-2 rounded connect-button">
                    {data.account && `${data.account.slice(0, 6)}...${data.account.slice(data.account.length - 6, data.account.length)}`}
                </button>
                {showDrawer && (
                    <div className="user-drawer">
                        <p className="account-info">Balance: {data.balance && parseFloat(data.balance).toFixed(4)} ETH</p>
                    
                        <button className="btn btn-danger disconnect-button" onClick={handleDisconnect}>Disconnect</button>
                    </div>
                )}
            </div>
        </>
    ) : (
        <button className="btn btn-secondary m-2 rounded connect-button" onClick={fetchAccountData}>
            Connect Wallet
        </button>
    )}
</div>



);
}


export default Connect;