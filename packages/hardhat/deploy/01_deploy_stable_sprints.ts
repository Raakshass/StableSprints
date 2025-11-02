import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // This line gets the deployment details of our MockUSDC contract.
  const mockUSDC = await get("MockUSDC");

  // This script deploys StableSprints and passes the MockUSDC contract's address
  // to its constructor.
  await deploy("StableSprints", {
    from: deployer,
    args: [mockUSDC.address],
    log: true,
  });
};

export default func;
func.tags = ["StableSprints"];
// This makes sure MockUSDC is deployed before this script runs.
func.dependencies = ["MockUSDC"];
