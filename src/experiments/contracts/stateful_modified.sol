pragma solidity >=0.4.22 <0.6.0;

contract StatefulContract {
    // the contract's owner, set in the constructor
    address _owner;

    // the message we're storing
    string message;

    constructor(string memory message_) public {
        // set the owner of the contract for `kill()`
        _owner = msg.sender;
        message = message_;
    }

    function set_message(string memory message_) public {
        // only allow the owner to update the message
        if (msg.sender != _owner) return;
        message = message_;
    }

    // return a string
    function get_message() public view returns (string memory) {
        return message;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    // recover the funds of the contract
    function kill() public { if (msg.sender == _owner) selfdestruct(msg.sender); }
}