const fs = require("fs");
const solc = require("solc");
const solVersion = "v0.6.9+commit.3e3065ac";
const fileName = "SimpleStorage.sol";

const readContract = (path) =>
  new Promise((resolve, reject) =>
    fs.readFile(path, "utf8", (err, data) =>
      err ? reject(err) : resolve(data)
    )
  );

const saveCompilation = (path, content, versioned) =>
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
    const contractFile = await readContract(`./${fileName}`);
    // console.log(contractFile);
    const snapshot = await new Promise((resolve, reject) =>
      solc.loadRemoteVersion(solVersion, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        console.log(`Version ${solVersion} loaded.`);
        resolve(res);
      })
    );
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
    const output = JSON.parse(snapshot.compile(JSON.stringify(input)));
    // console.log("Output :\n\n\n", output);
    // await saveCompilation(`./compiles/contract.json`, JSON.stringify(output));
    const bytecode =
      output["contracts"][fileName]["SimpleStorage"]["evm"]["bytecode"][
        "object"
      ];
    const abi = output["contracts"][fileName]["SimpleStorage"]["abi"];
  } catch (error) {
    console.error("error!");
  } finally {
    return;
  }
};

deploy();
