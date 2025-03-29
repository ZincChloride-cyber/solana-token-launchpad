import React from 'react';
import './App.css';
import { TokenLaunchpad } from './components/TokenLaunchpad';

// Wallet adapter imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { 
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton
} from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'; // Specific import for Backpack
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

// Polyfill Buffer
import { Buffer } from 'buffer';
window.Buffer = Buffer;


function App() {
  // Use devnet by default
  const endpoint = clusterApiUrl('devnet');
  
  // Supported wallets
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter()
  ];

  return (
    <div style={{ width: "100vw" }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '20px',
              backgroundColor: '#f0f0f0'
            }}>
              <WalletMultiButton style={{ marginRight: '10px' }} />
              <WalletDisconnectButton />
            </div>
            <div style={{ padding: '90px' }}>
              <TokenLaunchpad />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;