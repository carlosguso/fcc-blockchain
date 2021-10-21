import { BigNumber } from "@ethersproject/bignumber";
import hre, { ethers } from "hardhat";

async function main() {
  console.log("Creating FundMe Smart Contract...");
  const provider = ethers.getDefaultProvider("http://localhost:8545");
  const { chainId } = await provider.getNetwork();
  // console.log("Provider: ", provider);
  console.log("ChainId: ", chainId);
  console.log(ethers.providers.getNetwork(31337));

  const FundMe = await ethers.getContractFactory("FundMe");
  const fundMe = await FundMe.deploy();

  const fundMeReceipt = await fundMe.deployed();
  console.log("FundMe Receipt: ", fundMeReceipt);
  // console.log("Waiting for 5 blobk confirmations: ET 75 secs...");
  // await fundMeReceipt.deployTransaction.wait(5);
  const [owner] = await hre.ethers.getSigners();
  console.log(
    "Contract block confirmatiosn: ",
    fundMe.deployTransaction.confirmations
  );

  console.log("fundMe deployed to:", fundMe.address);
  console.log("fundMe signer:", await fundMe.signer.getAddress());
  console.log("First address of the network: ", owner.address);
  console.log(
    "First address of the network balance: ",
    await (await owner.getBalance()).toBigInt()
  );
  console.log("contract owner: ", await fundMe.owner());
  console.log(
    "Current Price value: ",
    ((await fundMe.getPrice()) as BigNumber).toString()
  );

  /* await hre.run("verify:verify", {
    address: fundMe.address,
    constructorArguments: [
      50,
      "a string argument",
      {
        x: 10,
        y: 5,
      },
      "0xabcdef",
    ],
  }); */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
