# noir-dapp-custom-template
1. Install dependencies:
```bash
nvm use 20.10.0
```
```bash
bun i # "npm i" or "yarn"
```

2. Running the app. In different terminals execute the following commands:

run a separate Ethereum node from the dev environment:
```bash
bunx hardhat node
```

run the server environment:
```bash
node --watch app.js
```

run the frontend environment:
```bash
vite dev
```

### Testing

You can run the [example test file](./test/index.test.ts) with

```bash
bun test
```

This test shows the basic usage of Noir in a TypeScript Node.js environment.

> [!NOTE] The test is a script, not an executable (we're running `bun test` or `yarn test` instead
> of `bunx` or `npx`). This is because the test runs its own network and executables.

### Deploying on other networks

The default scripting targets a local environment. For convenience, we added some configurations for
deployment on various other networks. You can see the existing list by running:

```bash
bunx hardhat vars setup
```

If you want to deploy on any of them, just pass in a private key, for example for the holesky
network:

```bash
bunx hardhat vars set holesky <your_testnet_private_key>
```

You can then run all the commands using that network by passing the `--network` flag. For example:

```bash
bunx hardhat dev --network holesky # deploys and runs a development server on holesky
bunx hardhat deploy --network holesky # deploys on holesky
bunx hardhat build --network holesky # builds the frontend with the holesky target
```

Feel free to add more networks, as long as they're supported by `wagmi`
([list here](https://wagmi.sh/react/api/chains#available-chains)). Just make sure you:

- Have funds in these accounts
- Add their configuration in the `networks` property in `hardhat.config.cjs`
- Use the name that wagmi expects (for example `ethereum` won't work, as `wagmi` calls it `mainnet`)

#### Attaching to an existing contract

You probably don't want to redeploy everytime you build your project. To attach the build to an
already deployed contract, pass the `--attach` flag:

```bash
bunx hardhat deploy --network mainnet # deploys on ethereum mainnet $$$$$!
bunx hardhat dev --network mainnet --attach 0x<yourethereumcontract> # you're now developing using an existing verifier contract
```
