import React, { useState, useEffect } from 'react';
import { createClient } from 'genlayer-js';
import { testnetAsimov } from 'genlayer-js/chains';
import { TransactionStatus } from "genlayer-js/types";
import './App.css';

const CONTRACT_ADDRESS = '0x0841D5b35775B4210B05587025547c32f0074c9A';

function App() {
  const [argument, setArgument] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);

  const client = createClient({ chain: testnetAsimov });

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } else {
      alert("Please install the GenLayer Wallet!");
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const data = await client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: 'get_leaderboard',
        args: [],
      });
      setLeaderboard(JSON.parse(data));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const submitText = async () => {
    if (!account) return connectWallet();
    if (!argument) return alert("The Oracle requires words!");
    setLoading(true);
    try {
      const hash = await client.writeContract({
        account: account, 
        address: CONTRACT_ADDRESS,
        functionName: 'submit_argument',
        args: [argument],
      });
      await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED });
      alert("The Oracle has received your wisdom.");
      setArgument('');
      fetchLeaderboard();
    } catch (err) {
      console.error("Submission failed:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">GenLayer Oracle</div>
        <button onClick={connectWallet} className="connect-btn">
          {account ? `${account.substring(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
        </button>
      </nav>

      <main className="container">
        <section className="hero">
          <h1>The Oracle's Verdict</h1>
          <p className="subtitle">Persuade the AI. Earn XP. Rule the Leaderboard.</p>
        </section>

        <section className="instructions">
          <h3>How to Play</h3>
          <ol>
            <li><strong>Connect:</strong> Link your GenLayer wallet via the button above.</li>
            <li><strong>Argue:</strong> Read the prompt and write the most creative argument you can.</li>
            <li><strong>Submit:</strong> Send your entry to the blockchain (requires Testnet GEN).</li>
            <li><strong>Verdict:</strong> Once the round is resolved, GenLayer's <strong>AI Consensus</strong> judges all entries. The most creative wins XP!</li>
          </ol>
        </section>

        <section className="game-area">
          <div className="card">
            <span className="badge">Current Prompt</span>
            <h2>"Why should rubber ducks be the next global currency?"</h2>
            <textarea 
              value={argument} 
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Type your brilliant argument here..."
            />
            <button onClick={submitText} disabled={loading} className="main-btn">
              {loading ? <span className="loader"></span> : "Submit Entry"}
            </button>
          </div>

          <div className="leaderboard-card">
            <h3>Leaderboard</h3>
            <div className="leaderboard-header">
              <span>Player</span>
              <span>XP</span>
            </div>
            {leaderboard.length > 0 ? leaderboard.map((player, i) => (
              <div key={i} className="row">
                <span>{player.player.substring(0, 12)}...</span>
                <span className="xp">{player.score}</span>
              </div>
            )) : <p>Waiting for the first winner...</p>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;