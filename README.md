# Signature_Verification_For_Nested_Structs_Using-EIP-712 
 
**Note:** The instructions given below are for Ubuntu 20.04 LTS (users only).

## Steps to run the project

1. Clone the repository.
2. Install the dependencies using the following command `npm i` and `npm install dotenv --save`.
3. Create a `.env` file in the project folder and add your `PRIVATEKEY`  in it with `0x` prefix. 
4. Run the signature creation scripts present in the script folder.
5. Copy the land contract present in the contracts folder and deploy it on rinkeby testnet in remix using your wallet address whose privatekey you used for    creating signature off-chain by running the signature creation scripts. 
6. Set mintedEnabled Value to `true` by calling the SetmintedEnabled() function.
7. Then call the `mintSingleLand()` function by passing the mintData **tuple** and the **signature** (values: v,r,s) you created off-chain.
8. **Result:** token gets minted now.

## Off-Chain

Node.js v16.13.2 or later

### Steps

1. Here, we are using **ethereumjs-util** and **ethereumjs-abi** for creating off-chain signature.Use the following commands to install **ethereumjs-util** and **ethereumjs-abi**: 
```
- npm install ethereumjs-util
- npm install ethereumjs-abi

```
2. Then we are creating **typedData** for all the structs present in our contract ,this **typeData** consists of types, primaryType , domain and message fields. 

3. **types** field present in **typeData**  consists of name and data-types of the variables, arrays or other structs present in each individual struct.

4. **primaryType** field present in **typeData** is the name of the struct whose **tuple** we are passing as a **mintData** into the `mintSingleLand()` function of the contract.

5. **domain** field present in **typeData** consists the values of the variables present in the **EIP712Domain** struct.

6. **message** field present in **typeData** consists the values of the variables and structs present in the **MintData** struct. 

7. For signing and creating the signature we convert our private-key into a **Buffer-type** using `ethUtil.toBuffer()` method present in **ethereumjs-util** library because the `ethUtil.escign()` method present in **ethereumjs-util** only takes **Buffer-type** parameters.

8. The `ethUtil.escign()` method present in **ethereumjs-util** takes **message-hash** and **privatekey** in Buffer-type and creates the signature (values: v,r,s) we require for passing into `mintSingleLand()`.

9. we are using `encodeData()` method present in the scripts for encoding our struct-type data before hashing it.

10. Once the data is encoded, we **hash** it by using `ethUtil.keccak256()` method.

11. Now, the `signHash()` method present in scripts creates the **message-hash** in a **Buffer-type** by concatenating the prefix `1901`, **struct-hash** of `EIP712Domain` struct and **struct-hash** of the `MintData` struct.

12. This Buffer-type **message-hash** along with Buffer-type **privatekey** is passed into the `ethUtil.escign()` and the required signature (values: v,r,s) is created off-chain.
 
## On-Chain


### Steps

1. In-order to perform the signature verification , we first deploy the smart-contract with the same  wallet address whose privatekey we used for       
   creating the signature off-chain.

2. When the contract is deployed we call the `setMintEnabled()` method present in it and change its value to **true**.

3. Then we call  `mintSingleLand()` method by passing mintData **tuple** and **signature** that we created off-chain.

4. The mintData **tuple** that we pass into `mintSingleLand()` method along with the signature (values: v,r,s) is first passed into `verifyOwnerSignature()` method  where it is encoded using `abi.encode()` , then hashed with `keccak256()` and then passed into `toTypedDataHash()` method present in `ECDSA` library of openzeppelin along with the `DOMAIN_SEPARATOR`.

5. The `toTypedDataHash()` method present in `ECDSA` library of openzeppelin returns the **message-hash** , this **message-hash**  is passed into `recover()` method present in 'ECDSA' library along with signature (values: v,r,s). The `recover()` method returns the signer address.

6. we now compare the signer address returned by `recover()` method with the owner of the contract using `owner()` method.If both the addresses are same then `verifyOwnerSignature()` will return a `true` value thus, `required` statement that is `require(verifyOwnerSignature(keccak256(abi.encode(_mintData)), _signature), "Invalid Signature");` present in the `mintSingleLand()` method passes and token is minted.Else, if the `verifyOwnerSignature()` return a `false` value then the required statment is reverted and hence does not let you mint the token,showing an error **Invalid Signature** in the pop-up and also in the console.

7. Here, for using EIP712 approach we have to add `EIP712Domain` struct,type-hashes of every structure present in the contract using keccak256(),data-hashes of every struct present in the contract by first encoding struct data using `abi.encode()` method and then hashing it using keccak256().

8. For `DOMAIN_SEPARATOR` we hash the `EIP712Domain` struct variable values in the contructor.




