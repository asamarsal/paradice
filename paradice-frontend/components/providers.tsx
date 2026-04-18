'use client';

import { PropsWithChildren, useEffect } from 'react';
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
    TESTNET,
} from '@initia/interwovenkit-react';
import interwovenKitStyles from '@initia/interwovenkit-react/styles.js';

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
    useEffect(() => {
        injectStyles(interwovenKitStyles);
    }, []);

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
                    {/* Use the built-in TESTNET config object — provides all registry URLs */}
                    <InterwovenKitProvider {...TESTNET}>
                        {children}
                    </InterwovenKitProvider>
                </RainbowKitProvider>
            </WagmiProvider>
        </QueryClientProvider>
    );
}
