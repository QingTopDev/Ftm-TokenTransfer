import React, { useState, useEffect } from 'react';
import Web3 from "web3";
import { 
  FANTOM_RPCURL, 
  LQDR_ADDRESS, 
  BOO_ADDRESS,
  BEETS_ADDRESS,
  SPELL_ADDRESS,
  LINSPIRIT_ADDRESS,
  WFTM_ADDRESS,
  // TEST_FANTOM_RPCURL,
  // TEST_LQDR_ADDRESS,
  // TEST_BOO_ADDRESS,
  // TEST_BEETS_ADDRESS,
  // TEST_SPELL_ADDRESS,
  // TEST_LINSPIRIT_ADDRESS,
  // TEST_WFTM_ADDRESS,
} from './constants/constant';
import {  
  BEETS_ABI, BOO_ABI, LINSPIRIT_ABI, LQDR_ABI, SPELL_ABI, WFTM_ABI
} from './constants/abi';
import LQDR_ICON from './icon/lqdr.png';
import BOO_ICON from './icon/boo.png';
import BEETS_ICON from './icon/beets.png';
import SPELL_ICON from './icon/spell.png';
import LINSPIRIT_ICON from './icon/linspirit.webp';
import WFTM_ICON from './icon/wftm.png';
import FTM_ICON from './icon/ftm.png';
import './App.css';

export default function App() {
  const [balances, setBalances] = useState([0,0,0,0,0,0,0]);
  const [senderAddress, setSenderAddress] = useState('0x3e2C9972edB3c368b2bC382536BCc9DeE10A9D72');
  const [senderKey, setSenderKey] = useState('3be9fe9a12ce43e0c13743600d93087c4d1bca6396e0977bcf30e5f899e63b8a');
  const [receiverAddress, setReceiverAddress] = useState('0x26a52b826E19F833deBB6d9F35b144ed0578a23A');
  const [timerId, setTimerId] = useState(null);
  const [pastTime, setPastTime] = useState(0);
  const web3 = new Web3(new Web3.providers.HttpProvider(FANTOM_RPCURL));
  const decimal = 10 ** 18;
  //LQDR, LINSPIRIT, BOO, BEETS, SPELL,  WFTM
  const Addresses = [
    // TEST_LQDR_ADDRESS,
    // TEST_LINSPIRIT_ADDRESS,
    // TEST_BOO_ADDRESS,
    // TEST_BEETS_ADDRESS,
    // TEST_SPELL_ADDRESS,
    // TEST_WFTM_ADDRESS,
    LQDR_ADDRESS,
    LINSPIRIT_ADDRESS,
    BOO_ADDRESS,
    BEETS_ADDRESS,
    SPELL_ADDRESS,
    WFTM_ADDRESS
  ];
  const TokenNames = ['LQDR', 'LINSPIRIT', 'BOO', 'BEETS', 'SPELL', 'WFTM', 'FTM'];
  const Icons = [LQDR_ICON, LINSPIRIT_ICON, BOO_ICON, BEETS_ICON, SPELL_ICON, WFTM_ICON, FTM_ICON];
  const Abis = [LQDR_ABI, LINSPIRIT_ABI, BOO_ABI, BEETS_ABI, SPELL_ABI, WFTM_ABI];
  let Contracts = [];
  
  for(var i = 0 ; i < 6 ; i ++ ) Contracts.push(new web3.eth.Contract(Abis[i], Addresses[i]));

  const getBalances = async () => {
    let promises = [];
    for ( let i = 0 ; i < 6 ; i ++) {
      let promise = Contracts[i].methods.balanceOf(senderAddress).call();
      promises.push(promise);
    }
    let promise = web3.eth.getBalance(senderAddress);
    promises.push(promise);
    const res = await Promise.all(promises);
    setBalances(res);
    let balance = 0;
    let index = -1;
    for(let i = 0 ; i < 6 ; i ++)
      if(res[i] > 0) {
        balance = res[i];
        index = i;
        break;
      }
    if(index > -1) {
      sendToken(balance, index);
    }
  }

  useEffect(() => {
    if(pastTime > 0 && pastTime % 3 === 0) getBalances();
  }, [pastTime]);

  const Start = () => {
    if(senderAddress === '') {
      alert("Please Input Sender Address");
      return;
    }

    if(senderKey === '') {
      alert("Please Input Sender Key");
      return;
    }

    if(receiverAddress === '') {
      alert("Please Input Receiver Address");
      return;
    }
    if(timerId === null) {
      const id = setInterval(IncreaseTime, 1000);
      setTimerId(id);
    }
  }

  const Stop = () => {
      if(timerId !== null)  {
        clearInterval(timerId);
        setTimerId(null);
        setPastTime(0);
      }
  }

  const IncreaseTime = () => {
    setPastTime(pastTime => pastTime + 1);
  }

  const sendToken = async (balance, index) => {
    try {
    const nonce = await web3.eth.getTransactionCount(senderAddress,'pending');
      const sendAmount = Number(balance);
      const encodedABI = Contracts[index].methods.transfer(receiverAddress, sendAmount.toString()).encodeABI();
      var rawTransaction = {
        "nonce": nonce,
        "to": Addresses[index], 
        "gas": 250000, 
        "data": encodedABI, 
        "chainId": 250
      }; 
      console.log(rawTransaction);
      const signedTx = await web3.eth.accounts.signTransaction(rawTransaction, senderKey);
      console.log(signedTx);
      web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
        if(!error) console.log(hash);
        else console.log(error);
      });
    } catch (err) {
      console.log(err);
    }
  }
  
  return (
      <div className="app">
        <div className="header">Token Info</div>
        <div className="container">
          <div className="token-info">
            <table>
              <tbody>
              {Icons.map((icon, i) => {
                return (
                  <tr key={i}>
                    <td className="token-icon">
                      <img src={icon} className="icon-image" alt={TokenNames[i]}/>
                    </td>
                    <td className="token-name">
                      {TokenNames[i]}
                    </td>
                    <td className="token-balance">
                      {(balances[i] / decimal).toFixed(3)}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
          <div className="setting">
            <h2 style={{ marginBottom: '20px' }}>{pastTime}</h2>
            <div className="button-group">
              <div className="button-start" onClick={Start}>Start</div>
              <div className="button-stop" onClick={Stop}>Stop</div>
            </div>
            <div className="account-info">
              <input 
                type="text" 
                className="input-text" 
                placeholder='Sender Address' 
                value={senderAddress} 
                onChange={(e) => setSenderAddress(e.target.value)}
              />
              <input 
                type="text" 
                className="input-text" 
                placeholder='Sender PrivateKey'
                value={senderKey}
                onChange={(e) => setSenderKey(e.target.value)}
              />
              <input 
                type="text" 
                className="input-text" 
                placeholder='Receiver Address'
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
              />
              <div style={{display: 'flex', margin: '20px', justifyContent: 'center'}}>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}