import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./Navbar";
import Home from "./Home";
import Create from "./Create";
import MyListedItems from "./MyListedItems";
import MyPurchases from "./MyPurchases";
import BlockCarAbi from "../contractsData/BlockCar.json";
import BlockCarAddress from "../contractsData/BlockCar-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import { useState } from "react";
import { ethers } from "ethers";
import { Spinner } from 'react-bootstrap';

function App() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nft, setNFT] = useState({});
  const [blockcar, setBlockCar] = useState({});

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log(accounts);
    setAccount(accounts[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async function (accounts) {
      setAccount(accounts[0]);
      await web3Handler();
    });

    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    const blockcar = new ethers.Contract(BlockCarAddress.address,BlockCarAbi.abi, signer );
    setBlockCar(blockcar);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account}/>
        </>
        <div>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '80vh'
            }}>
              <Spinner animation='border' style={{ display: 'flex' }}/>
              <p className='mx-3 my-0'>Esperando la conexión con Metamask...</p>
            </div>
          ) : (
        <Routes>
          <Route path="/" element={<Home blockcar={blockcar} nft={nft}/>}/>
          <Route path="/create" element={<Create blockcar={blockcar} nft={nft}/>}/>
          <Route path="/my-listed-items" element={<MyListedItems blockcar={blockcar} nft={nft} account={account}/>}/>
          <Route path="/my-purchases" element={<MyPurchases blockcar={blockcar} nft={nft} account={account}/>}/>
        </Routes>
          )}
          </div>
      </div>
    </BrowserRouter>
  );
}
export default App;
