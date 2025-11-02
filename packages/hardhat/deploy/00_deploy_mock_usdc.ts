import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // This script deploys the MockUSDC contract.
  await deploy("MockUSDC", {
    from: deployer,
    args: [], // No constructor arguments
    log: true,
  });
};

export default func;
func.tags = ["MockUSDC"];
