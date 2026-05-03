const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.eitherway.ai";

export const DIALECT_PROXY = `${API_BASE_URL}/api/dialect`;
export const DFLOW_PROXY = `${API_BASE_URL}/api/dflow`;
export const SOLANA_RPC_PROXY = `${API_BASE_URL}/api/solana/rpc`;
export const QUICKNODE_SOLANA = `${API_BASE_URL}/api/quicknode/rpc/solana`;

// Token Mints (mainnet)
export const TOKENS = {
  SOL: {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    decimals: 9,
    name: "Solana",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  USDC: {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  USDT: {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    symbol: "USDT",
    decimals: 6,
    name: "Tether",
    icon: "https://coin-images.coingecko.com/coins/images/325/small/Tether.png",
  },
  JUP: {
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    symbol: "JUP",
    decimals: 6,
    name: "Jupiter",
    icon: "https://static.jup.ag/jup/icon.png",
  },
  JTO: {
    mint: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    symbol: "JTO",
    decimals: 9,
    name: "Jito",
    icon: "https://storage.googleapis.com/token-metadata/JitoSOL-256.png",
  },
  BONK: {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    decimals: 5,
    name: "Bonk",
    icon: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I",
  },
  WIF: {
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    symbol: "WIF",
    decimals: 6,
    name: "dogwifhat",
    icon: "https://coin-images.coingecko.com/coins/images/33566/small/dogwifhat.jpg",
  },
  RAY: {
    mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
    symbol: "RAY",
    decimals: 6,
    name: "Raydium",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
  },
  mSOL: {
    mint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    symbol: "mSOL",
    decimals: 9,
    name: "Marinade SOL",
    icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
  },
  JitoSOL: {
    mint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    symbol: "JitoSOL",
    decimals: 9,
    name: "Jito SOL",
    icon: "https://storage.googleapis.com/token-metadata/JitoSOL-256.png",
  },
};

export const TOKEN_LIST = Object.values(TOKENS);

// Kamino Markets
export const KAMINO_MAIN_MARKET =
  "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF";
export const KAMINO_RESERVES = {
  SOL: "d4A2prbA2whesmvHaL88BH6Ewn5N4bTSU2Ze8P6Bc4Q",
  USDC: "D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59",
};
export const KAMINO_MULTIPLY_PAIRS = {
  "JitoSOL/SOL": {
    collTokenMint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    debtTokenMint: "So11111111111111111111111111111111111111112",
  },
  "mSOL/SOL": {
    collTokenMint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    debtTokenMint: "So11111111111111111111111111111111111111112",
  },
};
export const SOL_USDC_VAULT = "5EfeGn1h7m6Rx9mGEmamDoxMtdhRmUh2N9fYRiDQqteS";

// Network
export const NETWORK = import.meta.env.VITE_NETWORK || "mainnet-beta";
export const EXPLORER_BASE = "https://solscan.io";
