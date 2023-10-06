const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Desplegar contratos con la cuenta:", deployer.address);
  console.log("Balance de cuenta:", (await deployer.getBalance()).toString());

  const NFT = await hre.ethers.getContractFactory("NFT");
  const BlockCar = await hre.ethers.getContractFactory("BlockCar");
  const blockcar = await BlockCar.deploy(1);
  const nft = await NFT.deploy();

  saveFrontendFiles(blockcar, "BlockCar");
  saveFrontendFiles(nft, "NFT");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = hre.artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});