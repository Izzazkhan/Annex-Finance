import { useWeb3React as useWeb3ReactCore } from '@web3-react/core';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { injected } from '../connectors';
import { NetworkContextName } from '../constants';

export function useActiveWeb3React() {
  const context = useWeb3ReactCore();
  const contextNetwork = useWeb3ReactCore(NetworkContextName);
  const activeContext = context.active ? context : contextNetwork;
  if (!activeContext.chainId) {
    activeContext.chainId = process.env.REACT_APP_DEFAULT_CHAIN_ID
  }
  return activeContext;
}

export function useEagerConnect() {
  const { activate, active, account } = useWeb3ReactCore();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized && localStorage.getItem('connect') === 'connected') {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    });
  }, [activate]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore();
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        window.location.reload();
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error);
        });
      };

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error);
          });
        }
      };

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
    return undefined;
  }, [active, error, suppress, activate]);
}

export function useDetectChainChange(callback) {
  const { active, error, activate } = useWeb3ReactCore();
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum && ethereum.on && !active && !error) {
      ethereum.on('networkChanged', (networkId) => { callback(networkId) });

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('networkChanged', (networkId) => { callback(networkId) });
        }
      };
    }
    return undefined;
  }, [active, error, activate])
}