/*const fs = require("fs");
const solc = require("solc");
const Web3 = require("web3"); */
import fs from "fs";
import * as solc from "solc";
import Web3 from "web3";

const solVersion = "v0.6.9+commit.3e3065ac";
const fileName = "SimpleStorage.sol";

const readContract = (path: string) =>
  new Promise((resolve, reject) =>
    fs.readFile(path, "utf8", (err, data) =>
      err ? reject(err) : resolve(data)
    )
  );

const saveCompilation = (
  path: string,
  content: string | NodeJS.ArrayBufferView,
  versioned: boolean
) =>
  new Promise((resolve, reject) => {
    let finalPath = path;
    if (versioned) {
      const splitted = path.split(".json");
      finalPath = `${splitted[0]}-${splitted[1]}`;
    }
    fs.writeFile(finalPath, content, (err) => {
      if (err) {
        reject([false, err]);
        return;
      }
      //file written successfully
      resolve([true, null]);
    });
  });

const deploy = async () => {
  try {
    // Load contract file
    const contractFile = await readContract(`./${fileName}`);
    // console.log(contractFile);

    // Load compiler version remotely.
    /* const snapshot: Record<string, any> = await new Promise((resolve, reject) =>
      solc.loadRemoteVersion(solVersion, (err: Error, res: typeof solc) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`Version ${solVersion} loaded.`);
        resolve(res);
      })
    ); */

    // Load compiler version locaclly.
    const snapshot: Record<string, any> = solc.setupMethods(
      require("./soljson-0.6.9.js")
    );
    // Build input compilation obj.
    const input = {
      language: "Solidity",
      sources: {
        "SimpleStorage.sol": {
          content: contractFile,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    };
    // Get compiled output.
    const output = JSON.parse(snapshot.compile(JSON.stringify(input)));
    // console.log("Output :\n\n\n", output);

    // Save output in JSON format.
    // await saveCompilation(`./compiles/contract.json`, JSON.stringify(output));

    // Extract SimpleStorage contract bytecode.
    const bytecode =
      output["contracts"][fileName]["SimpleStorage"]["evm"]["bytecode"][
        "object"
      ];
    // Get SimpleStorage contract ABI.
    const abi = output["contracts"][fileName]["SimpleStorage"]["abi"];

    // Network endpoint
    const web3 = new Web3("http://localhost:8545");
    // Chain ID
    // const chainId = 5777;
    // WARNING: This next to values should not be hardcoded, specially priv key. Use env variables.
    // Address to deploy from.
    const myAddress = "0x1C5B53F6712bd86b9934124dF51D30c5E4692075";
    // Address private key. Its hardcoded beacuase its a localchain. Dont do this with test/main net addresses.
    const myPrivateKey =
      "51cf950073e94dd38a092de75ab4fc32b4876fe8bb51139269539c2b8a598c03";

    // Get last block number.
    // const latestBlockNumber = await web3.eth.getBlock();
    // console.log(latestBlockNumber);

    // Create contract obj
    // const simpleContract = new web3.eth.Contract(abi, myAddress);
    const simpleContract = new web3.eth.Contract(abi);
    console.log(simpleContract);

    // Get latest transaction number
    // const nonce = await web3.eth.getTransactionCount(myAddress);
    // console.log(nonce);

    // Create a tx obj.
    const transaction = simpleContract.deploy({
      data: bytecode,
    });
    console.log(transaction);

    // Create the transaction signed with my address and priv key.
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
        from: myAddress,
        data: transaction.encodeABI(),
        gas: "6021975",
      },
      myPrivateKey
    );
    console.log(createTransaction);

    // Send the transaction to the network
    const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction as string
    );
    console.log(createReceipt);

    // Get contract address.
    console.log("Contract deployed at address", createReceipt.contractAddress);

    const liveContract = new web3.eth.Contract(
      abi,
      createReceipt.contractAddress
    );

    const retrieveTxGas = await liveContract.methods.retrieve().estimateGas({
      from: myAddress,
    });
    console.log("Est gas: ", retrieveTxGas);

    const retrieveTx = await liveContract.methods.retrieve().call({
      from: myAddress,
      gas: retrieveTxGas,
    });
    console.log(retrieveTx);

    const storeTxGas = await liveContract.methods.store(15).estimateGas({
      from: myAddress,
    });
    console.log("Est gas: ", storeTxGas);

    const storeTx = await liveContract.methods.store(15).send({
      from: myAddress,
      gas: storeTxGas,
    });
    console.log(storeTx);

    const retrieveTx2 = await liveContract.methods.retrieve().call({
      from: myAddress,
    });
    console.log(retrieveTx2);
  } catch (error) {
    console.error(error);
  } finally {
    return;
  }
};

deploy();
