// const { expect } = require("chai");
// const { ethers } = require("hardhat");
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.deployed();

    expect(await simpleStorage.greet()).to.equal("Hello, world!");

    const setGreetingTx = await simpleStorage.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await simpleStorage.greet()).to.equal("Hola, mundo!");
  });
});
