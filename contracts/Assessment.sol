// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract myBank {
    address payable public accountHolder;
    uint256 public accountBalance;
    uint256 public minimumBalance;

    event FundsDeposited(uint256 amount);
    event FundsWithdrawn(uint256 amount);
    event FundsMultiplied(uint256 factor);
    event MinimumBalanceSet(uint256 newMinimumBalance);
    event InterestAdded(uint256 interestAmount);
    event AccountReset();

    constructor(uint256 initialBalance, uint256 initialMinimumBalance) payable {
        accountHolder = payable(msg.sender);
        accountBalance = initialBalance;
        minimumBalance = initialMinimumBalance;
    }

    function getAccountBalance() public view returns (uint256) {
        return accountBalance;
    }

    function deposit(uint256 amount) public payable {
        require(msg.sender == accountHolder, "Not authorized");
        accountBalance += amount;
        emit FundsDeposited(amount);
    }

    function withdraw(uint256 amount) public {
        require(msg.sender == accountHolder, "Not authorized");
        require(accountBalance - amount >= minimumBalance, "Withdrawal would go below minimum balance");
        accountBalance -= amount;
        payable(accountHolder).transfer(amount);
        emit FundsWithdrawn(amount);
    }

    function multiplyBalance(uint256 factor) public {
        require(msg.sender == accountHolder, "Not authorized");
        accountBalance *= factor;
        emit FundsMultiplied(factor);
    }

    function setMinimumBalance(uint256 newMinimumBalance) public {
        require(msg.sender == accountHolder, "Not authorized");
        minimumBalance = newMinimumBalance;
        emit MinimumBalanceSet(newMinimumBalance);
    }

    function addInterest(uint256 interestAmount) public {
        require(msg.sender == accountHolder, "Not authorized");
        accountBalance += interestAmount;
        emit InterestAdded(interestAmount);
    }

    function resetAccount() public {
        require(msg.sender == accountHolder, "Not authorized");
        accountBalance = 0;
        emit AccountReset();
    }
}
