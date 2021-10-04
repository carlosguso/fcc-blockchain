import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleStorage", function () {
  let simpleStorage: Contract;

  beforeEach(async () => {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.deployed();
  });

  it("Should deploy the smart contract correctly", async () => {
    expect(((await simpleStorage.retrieve()) as BigNumber).toNumber()).to.equal(
      0
    );
  });

  it("Should store a value and retrieve it correctly", async () => {
    const valueToStore = 5;
    const storingTx = await simpleStorage.store(valueToStore);
    // console.log(storingTx);
    // console.log("type: ", Object.keys(storingTx));
    await storingTx.wait();
    const storedValue: BigNumber = await simpleStorage.retrieve();
    expect(storedValue.toNumber()).to.equal(valueToStore);
  });

  it("Should link a person with a favorite number", async () => {
    // const [owner, personToStore] = await ethers.getSigners();
    const name = "Carlos";
    const valueToStore = 5;
    const tx = await simpleStorage.addPerson(name, valueToStore);
    await tx.wait();
    const person = await simpleStorage.people(0);
    // console.log(typeof person);
    expect(person.name as string).to.equal(name);
    expect((person.favoriteNumber as BigNumber).toNumber()).to.equal(
      valueToStore
    );
  });

  it("Should return the new greeting once it's changed", async function () {
    /* const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.deployed();

    expect(((await simpleStorage.retrieve()) as BigNumber).toNumber()).to.equal(
      0
    );

    const setGreetingTx = await simpleStorage.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await simpleStorage.greet()).to.equal("Hola, mundo!"); */
  });
});
