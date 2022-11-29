import { time, loadFixture, } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";

describe("Verifier", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    const Verifier = await ethers.getContractFactory("Verifier", owner);
    const verifier = await Verifier.deploy();

    await verifier.deployed();

    const Token = await ethers.getContractFactory("Token", owner);
    const token = await Token.deploy("Test Token", "TT");

    await token.deployed();

    return { owner, user1, user2, verifier, token };
  }

  it("Should verfify tx sender with verifier with implemented EIP155", async function () {
    const { owner, user1, user2, verifier, token } = await loadFixture(deployFixture);

    await token.connect(owner).mint(user1.address, BigNumber.from(ethers.utils.parseEther('1000000')));
    const tx = await token.connect(user1).transfer(user2.address, BigNumber.from(ethers.utils.parseEther('100000')));
    const receipt = await tx.wait();
    
    if(tx.gasPrice !== undefined && tx.gasLimit !== undefined && tx.value !== undefined && tx.to !== undefined && tx.v !== undefined && tx.r !== undefined && tx.s !== undefined) {
      const result = await verifier.connect(owner).verify(
        tx.gasPrice, 
        tx.gasLimit, 
        ethers.utils.hexlify(tx.value), 
        tx.nonce, 
        tx.data, 
        tx.to, 
        tx.from,
        tx.v,
        tx.r, 
        tx.s
      );

      expect(result[0]).to.be.eq(tx.from);
      expect(result[1]).to.be.true;
    } else {
      throw new Error('tx data is undefined');
    }

  });
  //   const { owner, user1, user2, verifier, token } = await loadFixture(deployFixture);

  //   const user4 = ethers.Wallet.createRandom();

  //   const transfer = {
  //     from: user1.address,
  //     to: user4.address,
  //     value: ethers.utils.parseEther("1"),
  //     nonce: await ethers.provider.getTransactionCount(user1.address, "latest"),
  //     gasLimit: ethers.utils.hexlify(21000), // 100000
  //     gasPrice: await ethers.provider.getGasPrice()
  //   }

  //   await user1.sendTransaction(transfer);

  //   await token.connect(owner).mint(user4.address, BigNumber.from(ethers.utils.parseEther('1000000')));
  //   const tx = await token.connect(user4.connect(ethers.provider)).transfer(user1.address, BigNumber.from(ethers.utils.parseEther('100000')), { gasPrice: BigNumber.from(527582589)});
  //   const receipt = await tx.wait();
  // });
});
