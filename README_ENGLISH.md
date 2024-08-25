# PhotoLock

**Team Members**: Bruno Weisz, Lorenzo Ruiz Diaz, Caro Lang, and Chino Cribioli

# Warning
If you are going to run the project, do so with images that are as small as possible.

## TL;DR

PhotoLock is a tool to generate and verify proofs of authenticity for edited images. It allows someone, using Zero-Knowledge Proofs, to demonstrate and/or verify that a photo comes from where it claims to come from.

### Use Case

Imagine a newspaper has a special camera with an integrated private key (to which we have no access) that it uses to digitally sign each photo it takes along with certain metadata such as date, time, geographic location, etc. In this way, given the device's public key and the signature of a certain Photo-Metadata pair, we could verify if the photo we are seeing was indeed taken at the time and place the newspaper claims.

Now, what happens if we decide to apply some transformation to this photo, such as cropping it or applying a filter? In that case, the signature would no longer be valid for the resulting photo, losing credibility.

To solve this problem, we created a tool that, when cropping a photo, generates a cryptographic proof that the result is a product of a valid public transformation on a correctly signed image.

In this way, the newspaper could crop the photos as needed and attach proof that the image was not falsified or maliciously manipulated.

## Protocol Description
Let's start with a special camera that has an integrated private key. When the camera takes a photo, it generates 3 things:
* The original photo (P)
* A hash of the original photo (H(P))
* The signature of the original photo's hash (F(H(P)))

The process to publish this photo and for someone to verify it would be as follows:
1) A newspaper publishes P, H(P), and F(H(P))
2) The camera used by that newspaper has a public key (PubK) known by everyone
3) The user hashes P and verifies that H(P) matches the hash they generated
4) The user verifies F(H(P)) using PubK and checks that it matches H(P)

Now suppose this photo needs to be cropped for some reason. The new photo is P'. Neither the hash of P' will match H(P), nor will the signature make any sense when verified. The idea of the protocol is to use zkSnarks to prove that P' comes from P without needing to reveal P.

To do this, given P, P', and H(P), we will generate a circuit that on one hand will be parameterized with the dimensions of P and P' and the offset of P' relative to P, and on the other hand, it will receive as inputs P (private), H(P) (public), and P' (public). The circuit will prove the following 2 properties:
* P' is a crop of P
* The hash of P matches H(P) (this serves to relate H(P) to P without revealing P)
  The verifier of this circuit will be deployed on the blockchain and will be specific to P and the dimensions and location of the crop (it is a custom contract for a modification of a photo).

On the other hand, off-chain, the verification that F(H(P)) is a valid signature of H(P) under the PubK key will occur. This does not need to happen in a zk circuit since it is not necessary to reveal the original image to perform this check. The reason we sign the hash and not the photo itself is to be able to do this check off-chain.

By combining the on-chain and off-chain checks, we can convince ourselves that P' is a crop of P without needing to know P, and that P comes from a certified camera with a public key PubK.

## Stack

For the frontend, we use Vite + React.
All the circuit parts are done in Noir, taking advantage of its integration to generate smart contracts in Solidity.
The circuits are generated and tested in the browser, so it is recommended not to use images larger than 1KB in size to avoid performance issues.

### Running the Project
1. Install dependencies:
    ```bash
    nvm use 20.10.0
    ```
    ```bash
    bun i # "npm i" or "yarn"
    ```

2. Run the app. In separate terminals, run:

If you want to run in a local devnet (this step is not necessary if running on Amoy):
```bash
bunx hardhat node
```
You also need to change the configuration in `hardhat.config.cjs` to point to 'localhost'.

Start the server:
```bash
node --watch app.js
```

Start the frontend:
```bash
bunx vite dev
```

The route where you can crop the photo is /publisher

### Deploying on Amoy
You need to provide a `.env` file with a `PRIVATE_KEY` field for the wallet you want to use for deployment.

### Deployed Contract Addresses during Development
* 0x10243272641976490aabBc3D2e025fa161272297
* 0xB3c7bFFAb7A0C39502053B23DaE571EB605A4bb4
