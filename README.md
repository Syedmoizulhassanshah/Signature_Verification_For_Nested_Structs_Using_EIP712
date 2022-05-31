# Signature_Verification_For_Nested_Structs_Using_EIP712

1. Run the signature creation scripts for structs present in the script folder (**replace the private key with your wallet's privateKey**).
2. Copy the land contract present in the contracts folder and deploy it on remix using your wallet address whose privatekey you used for creating signature 
   off-chain. 
3. SetmintedEnabled Value to "True".
4. Then call the mintSingleLand() Function by passing the mintdata **tuple** and the **signature** (values v,r,s) you created off-chain.
5. **Result:** Token is minted now.
