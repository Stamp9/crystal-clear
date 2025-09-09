// Popular Ethereum contracts for quick access
export const popularContracts = [
  // {
  //     name: "Uniswap V3 Router",
  //     address: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  // },
  // { name: "Ether.fi Liquidity Pool", address: "0x308861A430be4cce5502d0A12724771Fc6DaF216" },
  { name: "Aave Pool", address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" },
  {
    name: "👏 Aave ACLAdmin",
    address: "0x5300A1a15135EA4dc7aD5a167152C01EFc9b192A",
  },
  {
    name: "Seaport 1.6",
    address: "0x0000000000000068F116a894984e2DB1123eB395",
  },
  // { name: "Uniswap V3 Router", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564" },
  {
    name: "👏 Uniswap PoolManager",
    address: "0x000000000004444c5dc75cB358380D2e3dE08A90",
  },
  {
    name: "Ethereal Vault",
    address: "0x90D2af7d622ca3141efA4d8f1F24d86E5974Cc8F",
  },
  { name: "⚠️ Something dangrous", address: "loooooooooooooong" },
];

// Define the FilterOption interface
export interface FilterOption {
  label: string;
  value: string;
}

// Export the filter options array
export const filterOptions: FilterOption[] = [
  {
    label: "Uniswap: PoolManager",
    value: "0x000000000004444c5dc75cB358380D2e3dE08A90",
  },
  {
    label: "MetaMask: Swap Router",
    value: "0x881D40237659C251811CEC9c364ef91dC08D300C",
  },
  {
    label: "LI.FI: LiFi Diamond",
    value: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
  },
  {
    label: "Uniswap: Permit2",
    value: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  },
  { label: "e.g. something looooo00oong", value: "something else B" },
];
