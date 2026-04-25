'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { defineChain } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { connectorsForWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
    initiaPrivyWallet,
    injectStyles,
    InterwovenKitProvider,
    MAINNET,
    TESTNET,
} from '@initia/interwovenkit-react';
import interwovenKitStyles from '@initia/interwovenkit-react/styles.js';

export type AppNetwork = 'testnet' | 'mainnet';

type AppNetworkContextValue = {
    network: AppNetwork;
    setNetwork: (network: AppNetwork) => void;
};

const APP_NETWORK_STORAGE_KEY = 'paradice-app-network';

const AppNetworkContext = createContext<AppNetworkContextValue | null>(null);

export function useAppNetwork() {
    const context = useContext(AppNetworkContext);
    if (!context) {
        throw new Error('useAppNetwork must be used inside Providers');
    }
    return context;
}

// Initia testnet EVM chain definition (required by wagmi)
const initiaTestnet = defineChain({
    id: 7171480,
    name: 'Initia Testnet',
    nativeCurrency: { name: 'INIT', symbol: 'INIT', decimals: 6 },
    rpcUrls: {
        default: { http: ['https://rpc.initiation-2.initia.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Initia Explorer', url: 'https://scan.initia.xyz/initiation-2' },
    },
    testnet: true,
});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your_project_id_here';

const connectors = connectorsForWallets(
    [{ groupName: 'Recommended', wallets: [initiaPrivyWallet] }],
    { appName: 'Paradice - On-Chain Ludo', projectId }
);

const wagmiConfig = createConfig({
    connectors,
    chains: [initiaTestnet, mainnet],
    transports: {
        [initiaTestnet.id]: http('https://rpc.initiation-2.initia.xyz'),
        [mainnet.id]: http(),
    },
});

const queryClient = new QueryClient();

export default function Providers({ children }: PropsWithChildren) {
    const [network, setNetwork] = useState<AppNetwork>(() => {
        if (typeof window === 'undefined') {
            return 'testnet';
        }
        const savedNetwork = window.localStorage.getItem(APP_NETWORK_STORAGE_KEY);
        if (savedNetwork === 'testnet' || savedNetwork === 'mainnet') {
            return savedNetwork;
        }
        return 'testnet';
    });

    useEffect(() => {
        injectStyles(interwovenKitStyles);
    }, []);

    useEffect(() => {
        window.localStorage.setItem(APP_NETWORK_STORAGE_KEY, network);
    }, [network]);

    const interwovenConfig = useMemo(
        () => (network === 'mainnet' ? MAINNET : TESTNET),
        [network]
    );

    const customChain = useMemo(() => {
        const chainId = (process.env.NEXT_PUBLIC_APPCHAIN_ID ?? 'paradice-ludo-1').trim();
        const chainName = (process.env.NEXT_PUBLIC_APPCHAIN_NAME ?? 'Paradice Ludo Appchain').trim();
        const bech32Prefix = (process.env.NEXT_PUBLIC_APPCHAIN_BECH32_PREFIX ?? 'init').trim();
        const rpc = (process.env.NEXT_PUBLIC_APPCHAIN_RPC ?? 'http://localhost:26657').trim();
        const rest = (process.env.NEXT_PUBLIC_APPCHAIN_REST ?? 'http://localhost:1317').trim();
        const indexer = (process.env.NEXT_PUBLIC_APPCHAIN_INDEXER ?? 'http://localhost:8080').trim();
        const jsonRpc = (process.env.NEXT_PUBLIC_APPCHAIN_JSON_RPC ?? 'http://localhost:8545').trim();
        const nativeDenom = (process.env.NEXT_PUBLIC_APPCHAIN_NATIVE_DENOM ?? 'uinit').trim();
        const nativeSymbol = (process.env.NEXT_PUBLIC_APPCHAIN_NATIVE_SYMBOL ?? 'INIT').trim();
        const nativeDecimals = Number(process.env.NEXT_PUBLIC_APPCHAIN_NATIVE_DECIMALS ?? '6');
        const minitiaType = (process.env.NEXT_PUBLIC_APPCHAIN_MINITIA_TYPE ?? 'minimove').trim();

        return {
            chain_id: chainId,
            chain_name: chainName,
            network_type: 'testnet',
            bech32_prefix: bech32Prefix,
            apis: {
                rpc: [{ address: rpc }],
                rest: [{ address: rest }],
                indexer: [{ address: indexer }],
                'json-rpc': [{ address: jsonRpc }],
            },
            fees: {
                fee_tokens: [{
                    denom: nativeDenom,
                    fixed_min_gas_price: 0,
                    low_gas_price: 0,
                    average_gas_price: 0,
                    high_gas_price: 0,
                }],
            },
            staking: {
                staking_tokens: [{ denom: nativeDenom }],
            },
            native_assets: [{
                denom: nativeDenom,
                name: nativeSymbol,
                symbol: nativeSymbol,
                decimals: Number.isFinite(nativeDecimals) ? nativeDecimals : 6,
            }],
            metadata: {
                is_l1: false,
                minitia: { type: minitiaType },
            },
        };
    }, []);

    const networkContextValue = useMemo(
        () => ({ network, setNetwork }),
        [network]
    );

    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#F97316',
                        accentColorForeground: 'white',
                        borderRadius: 'large',
                        fontStack: 'system',
                    })}
                >
                    <AppNetworkContext.Provider value={networkContextValue}>
                        <InterwovenKitProvider
                            {...interwovenConfig}
                            defaultChainId={customChain.chain_id}
                            customChain={customChain}
                        >
                            {children}
                        </InterwovenKitProvider>
                    </AppNetworkContext.Provider>
                </RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    );
}
