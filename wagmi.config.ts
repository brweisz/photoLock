import { defineConfig } from '@wagmi/cli'
import { react, hardhat } from '@wagmi/cli/plugins';
import deployment from './artifacts/deployment_with_address.json';

export default defineConfig({ 
    out: 'artifacts/generated.ts',
    plugins: [
        react(),
        hardhat({
            project: '.',
            artifacts: './artifacts/hardhat',
            deployments: {
                "UltraVerifier": {
                    [deployment.networkConfig.id]: deployment.address as `0x${string}`
                }
            }
        })
    ]
})
