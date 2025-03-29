import React, { useState } from 'react';
import { Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  MINT_SIZE, 
  TOKEN_PROGRAM_ID, 
  createInitializeMintInstruction, 
  getMinimumBalanceForRentExemptMint 
} from "@solana/spl-token";

export function TokenLaunchpad() {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [tokenData, setTokenData] = useState({
        name: '',
        symbol: '',
        decimals: '9',
        initialSupply: ''
    });
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTokenData(prev => ({ ...prev, [name]: value }));
    };

    async function createToken() {
        if (!publicKey) {
            setStatus('🔗 Please connect your wallet first');
            return;
        }

        try {
            setStatus('⚙️ Creating token...');
            setIsLoading(true);
            
            const mintKeypair = Keypair.generate();
            const lamports = await getMinimumBalanceForRentExemptMint(connection);
            const decimals = Number(tokenData.decimals);

            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: MINT_SIZE,
                    lamports,
                    programId: TOKEN_PROGRAM_ID,
                }),
                createInitializeMintInstruction(
                    mintKeypair.publicKey,
                    decimals,
                    publicKey,
                    publicKey,
                    TOKEN_PROGRAM_ID
                )
            );

            transaction.feePayer = publicKey;
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.sign(mintKeypair);

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'confirmed');

            setStatus(`✅ Token created successfully!\n\n🔐 Mint address:\n${mintKeypair.publicKey.toBase58()}`);
            
        } catch (error) {
            console.error("Error creating token:", error);
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    // Style objects for consistency
    const containerStyle = {
        maxWidth: '500px',
        width: '100%', // Ensure it takes full width up to maxWidth
        padding: '3rem',
        background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(153, 69, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto' // This ensures horizontal centering
      };

    const inputContainerStyle = {
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        padding: '0.75rem' // Increased from 0.5rem
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem 1.25rem', // Increased from 0.75rem 1rem
        background: 'transparent',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        color: '#fff',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '1rem', // Increased from 0.75rem
        fontWeight: '600',
        color: '#fff',
        fontSize: '1rem' // Increased from 0.95rem
    };

    return (
        <div style={containerStyle}>
            {/* Glow effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(153, 69, 255, 0.1) 0%, transparent 70%)',
                animation: 'rotate 20s linear infinite',
                zIndex: 0
            }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
                <h1 style={{
                    fontSize: '2rem',
                    marginBottom: '2.5rem', // Increased from 2rem
                    textAlign: 'center',
                    color: '#fff',
                    fontWeight: '700',
                    background: 'linear-gradient(90deg, #9945FF, #14F195)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 15px rgba(153, 69, 255, 0.3)'
                }}>
                    Solana Token Launchpad
                </h1>
                
                <div style={{ 
                    display: 'grid',
                    gap: '2rem', // Increased from 1.5rem
                    marginBottom: '2.5rem' // Increased from 2rem
                }}>
                    <div>
                        <label style={labelStyle}>Token Name</label>
                        <div style={inputContainerStyle}>
                            <input 
                                style={inputStyle}
                                type='text' 
                                name='name'
                                value={tokenData.name}
                                onChange={handleInputChange}
                                placeholder="My Awesome Token"
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Token Symbol</label>
                            <div style={inputContainerStyle}>
                                <input 
                                    style={inputStyle}
                                    type='text' 
                                    name='symbol'
                                    value={tokenData.symbol}
                                    onChange={handleInputChange}
                                    placeholder="MAT"
                                    maxLength="5"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label style={labelStyle}>Decimals</label>
                            <div style={inputContainerStyle}>
                                <input 
                                    style={inputStyle}
                                    type='number' 
                                    name='decimals'
                                    value={tokenData.decimals}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="18"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label style={labelStyle}>Initial Supply</label>
                        <div style={inputContainerStyle}>
                            <input 
                                style={inputStyle}
                                type='number' 
                                name='initialSupply'
                                value={tokenData.initialSupply}
                                onChange={handleInputChange}
                                placeholder="1000000"
                            />
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={createToken} 
                    style={{
                        width: '100%',
                        padding: '1.25rem', // Increased from 1rem
                        background: 'linear-gradient(90deg, #9945FF, #14F195)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem', // Slightly larger
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginTop: '1.5rem', // Increased from 1rem
                        position: 'relative',
                        overflow: 'hidden',
                        zIndex: 1,
                        boxShadow: '0 4px 15px rgba(153, 69, 255, 0.4)'
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span style={{
                            display: 'inline-block',
                            width: '24px', // Slightly larger
                            height: '24px',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '50%',
                            borderTopColor: 'white',
                            animation: 'spin 1s ease-in-out infinite'
                        }}></span>
                    ) : (
                        <>
                            🚀 Create Token
                            <span style={{
                                position: 'absolute',
                                background: 'rgba(255, 255, 255, 0.2)',
                                width: '100%',
                                height: '100%',
                                left: 0,
                                top: '-100%',
                                transition: 'all 0.3s ease'
                            }}></span>
                        </>
                    )}
                </button>
                
                {status && (
                    <div style={{
                        marginTop: '2rem', // Increased from 1.5rem
                        padding: '1.5rem', // Increased from 1.25rem
                        borderRadius: '12px',
                        fontSize: '1rem', // Slightly larger
                        lineHeight: '1.6',
                        background: status.includes('❌') ? 'rgba(255, 59, 48, 0.1)' : 'rgba(20, 241, 149, 0.1)',
                        color: status.includes('❌') ? '#FF3B30' : '#14F195',
                        borderLeft: `4px solid ${status.includes('❌') ? '#FF3B30' : '#14F195'}`,
                        whiteSpace: 'pre-line'
                    }}>
                        {status}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                button:hover span:last-child {
                    top: 0;
                }
                button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                div[style*="background: rgba(255, 255, 255, 0.05)"]:hover {
                    border-color: rgba(153, 69, 255, 0.3);
                }
                input:focus {
                    background: rgba(255, 255, 255, 0.1) !important;
                }
                input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
}