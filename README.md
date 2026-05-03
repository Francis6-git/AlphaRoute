### AlphaRoute

**The Execution Intelligence Terminal**  
_MEV-Protected Trading • Automated Yield Management • Execution Analytics_

---

## Executive Summary

AlphaRoute is a professional-grade trading terminal built on Solana that solves the **"Idle Capital Problem"** by integrating DFlow's MEV-protected routing with Kamino's liquidity vaults, we've created a 'Dry Powder' workflow where users can rebalance and trade in a single click.

Most traders are forced to choose between:

- Earning yield in DeFi
- Keeping capital idle for quick trading opportunities

AlphaRoute eliminates this trade-off by unifying:

- DFlow’s MEV-protected routing
- Kamino’s yield infrastructure
- QuickNode’s high-performance data layer

Every trade executed on AlphaRoute:

- Is routed through DFlow for institutional-grade pricing
- Is assigned an **Alpha Score** — a proprietary metric that measures execution quality based on slippage saved versus standard AMMs

---

## Core Partnerships & Integration

### DFlow — The Execution Engine

AlphaRoute uses DFlow as its primary liquidity and routing layer.

- **MEV-Resistant Execution:**  
  Orders are routed through off-chain order-flow auctions, preventing front-running and sandwich attacks

- **Optimized Routing:**  
  Access to deep liquidity across Solana (Spot + Prediction Markets) for superior trade execution

- **Transparency:**  
  Every trade signature maps to DFlow’s optimized route, proving the "Alpha" delivered

---

### Kamino Finance — The "Dry Powder" Strategy

- **Capital Efficiency:**  
  Idle USDC and SOL are deployed into Kamino lending and LP vaults directly from the terminal

- **One-Click Liquidity Access:**  
  Users can _"Pull Dry Powder"_ — instantly withdrawing capital from Kamino to fund trades

---

### QuickNode — The Data Backbone

- **Real-Time Intelligence:**  
  High-performance RPC nodes power live price feeds and transaction simulations

- **Reliable Execution:**  
  Optimized endpoints enable fast transaction broadcasting and confirmation tracking

---

## Key Features

### 1. Alpha Score Dashboard

A post-trade analytics suite that evaluates execution quality.

- Compares DFlow execution vs theoretical AMM pricing
- Generates a **0–100 score**
- Displays **"Slippage Saved"** in dollar terms

---

### 2. Intelligent Price Alerts (Auto-Trade)

Go beyond notifications with conditional automation.

**Example:**

> "If SOL drops below $140, withdraw 500 USDC from Kamino and buy SOL via DFlow."

This enables a fully automated loop of:

- Yield generation
- Market opportunity execution

---

### 3. Portfolio Rail

A persistent overview of total capital across:

- Wallet balances
- Active Kamino positions

Provides a real-time, **bird’s-eye view** of user funds.

### Project Structure

The codebase is modular, following:

- **Atomic Design** for the UI
- **Service-Oriented Architecture** for backend integrations

root/
├── public/ # Static assets & Manifest
├── src/
│ ├── components/
│ │ ├── auth/ # Login & Signup interfaces
│ │ ├── landing/ # Hero, Features, Execution Proof (Landing Page)
│ │ ├── layout/ # Sidebar, TopBar, PortfolioRail
│ │ └── panels/ # The 5 Core Terminal Tabs (Trade, Yield, etc.)
│ ├── hooks/ # Solana balance and price polling logic
│ ├── lib/ # Auth & Theme Context Providers
│ ├── pages/ # Main App and Landing Page entry points
│ ├── services/ # API wrappers for DFlow, Kamino, and Supabase
│ ├── config.js # Network and Token constants
│ ├── App.jsx # Main Routing & Dashboard logic
│ └── main.jsx # Entry point & Wallet Provider setup
└── .env # Secrets & RPC Endpoints (VITE\_ prefixed)

## Technical Stack

- **Frontend:** React + Vite, Tailwind CSS (Custom "Alpha" Dark Theme)
- **Blockchain:** @solana/web3.js, @solana/wallet-adapter
- **Infrastructure:** QuickNode (RPC), DFlow API (Routing), Kamino SDK (Yield)
- **Backend / Database:** Supabase (Trade persistence, user preferences, price alerts)
- **Visualization:** Recharts (Analytics), Lucide (Iconography)

### Getting Started

## Prerequisites

- Node.js v18+
- A Solana wallet (Solflare recommended for best experience)
- Environment variables configured in `.env`

## Installation

Clone the repository and navigate into the project directory:

````bash
git clone https://github.com/bumblecode/alpharoute.git
cd alpharoute

## Configure Environment

Create a `.env` file in the root of your project based on `.env.example`:

```env
VITE_QUICKNODE_RPC=your_rpc_url
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

## Launch Development Server

Start the local development server:

```bash
npm run dev

## Architecture & Functional Grouping
This table breaks down how the project layers interact and which specific partner technologies power each core function.

| Functional Group       | Components / Files                                      | Core Function                                                                 | Primary Partner        |
|-----------------------|--------------------------------------------------------|------------------------------------------------------------------------------|------------------------|
| Execution Engine      | TradePanel.jsx, services/dflow.js                      | Handles MEV-protected swaps, route optimization, and Alpha Score generation  | DFlow                  |
| Yield Strategy        | YieldPanel.jsx, services/kamino.js                     | Manages Kamino lending/vault positions and the "Dry Powder" withdrawal system| Kamino Finance         |
| Infrastructure        | main.jsx, hooks/useWalletBalances.js                   | High-speed blockchain data retrieval, slot tracking, and transaction broadcasting | QuickNode          |
| Intelligence Layer    | IntelligencePanel.jsx, HistoryPanel.jsx                | Visualizes execution quality (Alpha Score) and historical trade performance  | AlphaRoute Core        |
| Automation            | AlertsPanel.jsx, services/database.js                  | Conditional price triggers that can auto-execute swaps via the DFlow engine  | Supabase               |
| Identity & Access     | AuthModal.jsx, lib/auth-context.js                     | Dual-mode authentication: Web3 Wallet (Solflare) + Web2 Email (Supabase)     | Solflare / Supabase    |
````
