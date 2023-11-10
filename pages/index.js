import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [ownerAddress, setOwnerAddress] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected:", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      console.log("Connected account:", accounts[0]);
      handleAccount(accounts);

      // Once the wallet is set, get a reference to the deployed contract
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);

    // Get owner address
    atmContract.owner().then((owner) => setOwnerAddress(owner));
  };

  const getBalance = async () => {
    try {
      if (atm) {
        const userBalance = await atm.getBalance();
        setBalance(userBalance.toNumber());
      }
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const deposit = async (amount) => {
    try {
      if (atm) {
        const tx = await atm.deposit(amount, { gasLimit: 300000 });
        await tx.wait();
        console.log(`Deposit of ${amount} ETH successful!`);
        getBalance();
        updateTransactionHistory("Deposit", amount);
      }
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  const withdraw = async (amount) => {
    try {
      if (atm) {
        const tx = await atm.withdraw(amount, { gasLimit: 300000 });
        await tx.wait();
        console.log(`Withdrawal of ${amount} ETH successful!`);
        getBalance();
        updateTransactionHistory("Withdraw", amount);
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
    }
  };

  const checkBalance = async () => {
    try {
      if (atm) {
        const currentBalance = await atm.getBalance();
        alert(`Current Balance: ${currentBalance.toNumber()} ETH`);
      }
    } catch (error) {
      console.error("Error checking balance:", error);
    }
  };

  const multiplyBalance = async () => {
    try {
      if (atm) {
        const factor = prompt("Enter multiplication factor:");
        const tx = await atm.multiplyBalance(factor, { gasLimit: 300000 });
        await tx.wait();
        console.log("Multiplication successful!");
        getBalance();
        updateTransactionHistory("Multiply Balance", factor);
      }
    } catch (error) {
      console.error("Multiplication error:", error);
    }
  };

  const updateTransactionHistory = (type, amount) => {
    const newTransaction = {
      type,
      amount,
      timestamp: new Date().toLocaleString(),
    };
    setTransactionHistory([...transactionHistory, newTransaction]);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your MetaMask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Contract Owner: {ownerAddress}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={() => deposit(prompt("Enter deposit amount:"))}>
          Deposit
        </button>
        <button onClick={() => withdraw(prompt("Enter withdrawal amount:"))}>
          Withdraw
        </button>
        <button onClick={checkBalance}>Check Balance</button>
        <button onClick={multiplyBalance}>Multiply Balance</button>

        <h2>Transaction History</h2>
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              {transaction.type} {transaction.amount} ETH -{" "}
              {transaction.timestamp}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to My Bank</h1>
        <h2>Account Owner: Mahesh</h2>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #4caf50; /* Green background color */
          color: white; /* White text color */
          padding: 20px;
        }

        button {
          margin: 5px;
        }
      `}</style>
    </main>
  );
}
