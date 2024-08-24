// @ts-nocheck

import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Component from './components/index.js';
import ReaderPage from './components/reader_page.jsx';
import PublisherPage from './components/publisher_page.tsx';
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { defineChain, createClient } from 'viem';
import { injected } from 'wagmi/connectors';
import { networkConfig } from "./artifacts/deployment.json";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient();

const { id, name, nativeCurrency, rpcUrls } = networkConfig;
const chain = defineChain({
  id,
  name,
  nativeCurrency,
  rpcUrls
});

const config = createConfig({
  connectors: [
    injected()
  ],
  chains: [chain],
  client({ chain}) {
    return createClient({ chain, transport: http() });
  }
});

const InitWasm = ({ children }) => {
  const [init, setInit] = React.useState(false);
  useEffect(() => {
    (async () => {
      await Promise.all([
        initACVM(new URL('@noir-lang/acvm_js/web/acvm_js_bg.wasm', import.meta.url).toString()),
        initNoirC(
          new URL('@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm', import.meta.url).toString(),
        ),
      ]);
      setInit(true);
    })();
  });

  return <div>{init && children}</div>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{mounted && children}</QueryClientProvider>
    </WagmiProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Providers>
    <InitWasm>
      <Router>
        <Routes>
          <Route path="/" element={<Component />} />
          <Route path="/readers" element={<ReaderPage />} />
          <Route path="/publisher" element={<PublisherPage />} />
        </Routes>
      </Router>
      <ToastContainer />
    </InitWasm>
  </Providers>,
);
