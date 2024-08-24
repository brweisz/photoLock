import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import React, { useEffect } from 'react';
import deployment from '../artifacts/deployment.json';

export function useOnChainVerification() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const { chains, switchChain } = useSwitchChain();

  useEffect(() => {
    switchChain({ chainId: chains[0].id });
  }, []);

  let connectDisconnectButton = !isConnected ?
    (
      <div>
        <button type="button" className="button verify-button" key={connectors[0].uid} onClick={() => {
          connect({ connector: connectors[0], chainId: deployment.networkConfig.id });
        }}> Connect wallet
        </button>
      </div>
    ) : (
      <div>
        <button type="button" className="button verify-button" onClick={() => {
          disconnect();
        }}>Disconnect wallet
        </button>
      </div>
    );

  return {isConnected, address, connectDisconnectButton}
}
