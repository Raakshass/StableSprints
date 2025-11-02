"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const SPRINT_TYPES = [
  { name: "Quick Sprint", duration: "1 min", yield: "1%", emoji: "⚡", type: 0 },
  { name: "Standard Sprint", duration: "5 mins", yield: "5%", emoji: "🏃", type: 1 },
  { name: "Long Sprint", duration: "10 mins", yield: "10%", emoji: "🚀", type: 2 },
];

const SprintCard = ({ sprintId }: { sprintId: bigint }) => {
  const { address } = useAccount();
  const [isRedeeming, setIsRedeeming] = useState(false);

  const { data: sprint, refetch: refetchSprint } = useScaffoldReadContract({
    contractName: "StableSprints",
    functionName: "sprints",
    args: [sprintId],
  });

  const { writeContractAsync: writeStableSprints } = useScaffoldWriteContract("StableSprints");

  if (!sprint || sprint[0].toLowerCase() !== address?.toLowerCase()) {
    return null;
  }

  const amount = sprint[1];
  const maturity = sprint[2];
  const redeemed = sprint[3];
  const sprintType = sprint[4];

  const isMature = new Date().getTime() > Number(maturity) * 1000;
  const redeemAmountFormatted = formatEther(amount);
  const tierInfo = SPRINT_TYPES[Number(sprintType)];

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true);
      notification.info("Redeeming Sprint... Please confirm in your wallet.");
      await writeStableSprints({
        functionName: "redeemSprint",
        args: [sprintId],
      });
      notification.success("Sprint redeemed successfully!");
      refetchSprint();
    } catch (e: any) {
      console.error("Error:", e);
      notification.error(e?.message || "Redemption failed.");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    try {
      setIsRedeeming(true);
      notification.info("Emergency withdrawing (50% yield penalty)... Confirm in wallet.");
      await writeStableSprints({
        functionName: "emergencyWithdraw" as any,
        args: [sprintId] as any,
      });
      notification.success("Emergency withdrawal successful!");
      refetchSprint();
    } catch (e: any) {
      console.error("Error:", e);
      notification.error(e?.message || "Emergency withdrawal failed.");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className={`card bg-base-100 shadow-md ${redeemed ? "opacity-50" : ""}`}>
      <div className="card-body">
        <h3 className="card-title">
          {tierInfo.emoji} {tierInfo.name} #{sprintId.toString()}
        </h3>
        <p>
          NFT ID: <strong>#{sprintId.toString()}</strong>
        </p>
        <p>
          Redeemable: <strong>{redeemAmountFormatted} mUSDC</strong>
        </p>
        <p>Maturity: {new Date(Number(maturity) * 1000).toLocaleString()}</p>
        <div className="card-actions justify-end gap-2 mt-4">
          {redeemed ? (
            <span className="badge badge-success">Redeemed (NFT Burned)</span>
          ) : isMature ? (
            <button className="btn btn-secondary btn-sm" onClick={handleRedeem} disabled={isRedeeming}>
              {isRedeeming ? "Redeeming..." : "Redeem"}
            </button>
          ) : (
            <button className="btn btn-warning btn-sm" onClick={handleEmergencyWithdraw} disabled={isRedeeming}>
              {isRedeeming ? "Withdrawing..." : "Withdraw Early (-50%)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StableSprintsPage: NextPage = () => {
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: stableSprintsContract } = useDeployedContractInfo("StableSprints");
  const { data: nextSprintId } = useScaffoldReadContract({
    contractName: "StableSprints",
    functionName: "nextSprintId",
  });
  const { data: musdcBalance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "MockUSDC",
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContractAsync: approveWrite } = useScaffoldWriteContract("MockUSDC");
  const { writeContractAsync: startSprintWrite } = useScaffoldWriteContract("StableSprints");

  const handleStartSprint = async (sprintType: number) => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      notification.error("Please enter a valid deposit amount.");
      return;
    }
    if (!musdcBalance || parseEther(depositAmount) > musdcBalance) {
      notification.error("Insufficient mUSDC balance.");
      return;
    }

    try {
      setIsProcessing(true);
      const amountInWei = parseEther(depositAmount);

      notification.info("1/2: Approving mUSDC...");
      await approveWrite({
        functionName: "approve",
        args: [stableSprintsContract?.address, amountInWei],
      });

      notification.info("2/2: Starting Sprint...");
      await startSprintWrite({
        functionName: "startSprint",
        args: [amountInWei, sprintType],
      });

      notification.success("Sprint started successfully!");
      setDepositAmount("");
      refetchBalance();
    } catch (e: any) {
      console.error("Error:", e);
      notification.error(e?.message || "Transaction failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center flex-grow pt-10">
      <div className="px-5 w-full lg:w-2/3">
        <h1 className="text-center mb-4">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">StableSprints</span>
        </h1>
        <div className="flex justify-center items-center space-x-2 mb-2">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={address} />
        </div>
        <div className="flex justify-center items-center space-x-2">
          <p className="my-2 font-medium">Your mUSDC Balance:</p>
          <span className="font-bold">{musdcBalance ? formatEther(musdcBalance) : "0"} mUSDC</span>
        </div>
      </div>

      <div className="flex-grow bg-base-300 w-full mt-8 px-8 py-12">
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Sprint Tier</h2>
        <div className="flex justify-center mb-6">
          <input
            type="number"
            placeholder="Amount (mUSDC)"
            className="input input-bordered w-64"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {SPRINT_TYPES.map(tier => (
            <div key={tier.type} className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-2">{tier.emoji}</div>
                <h3 className="card-title">{tier.name}</h3>
                <p className="text-sm">
                  Duration: <strong>{tier.duration}</strong>
                </p>
                <p className="text-sm">
                  Yield: <strong>{tier.yield}</strong>
                </p>
                <button
                  className="btn btn-primary btn-sm mt-4 w-full"
                  onClick={() => handleStartSprint(tier.type)}
                  disabled={isProcessing || !depositAmount}
                >
                  {isProcessing ? "Processing..." : "Start Sprint"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-center mb-4">Your Sprints (NFTs)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextSprintId === undefined && <p className="text-center col-span-full">Loading...</p>}
            {nextSprintId !== undefined &&
              Array.from({ length: Number(nextSprintId) }, (_, i) => BigInt(i)).map(id => (
                <SprintCard key={id.toString()} sprintId={id} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StableSprintsPage;
