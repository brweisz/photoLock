export const ultraVerifierAbi = [
  { type: 'error', inputs: [], name: 'INVALID_VERIFICATION_KEY' },
  { type: 'error', inputs: [], name: 'MOD_EXP_FAILURE' },
  { type: 'error', inputs: [], name: 'OPENING_COMMITMENT_FAILED' },
  { type: 'error', inputs: [], name: 'PAIRING_FAILED' },
  { type: 'error', inputs: [], name: 'PAIRING_PREAMBLE_FAILED' },
  { type: 'error', inputs: [], name: 'POINT_NOT_ON_CURVE' },
  {
    type: 'error',
    inputs: [
      { name: 'expected', internalType: 'uint256', type: 'uint256' },
      { name: 'actual', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'PUBLIC_INPUT_COUNT_INVALID',
  },
  { type: 'error', inputs: [], name: 'PUBLIC_INPUT_GE_P' },
  { type: 'error', inputs: [], name: 'PUBLIC_INPUT_INVALID_BN128_G1_POINT' },
  {
    type: 'function',
    inputs: [],
    name: 'getVerificationKeyHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '_proof', internalType: 'bytes', type: 'bytes' },
      { name: '_publicInputs', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'verify',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const