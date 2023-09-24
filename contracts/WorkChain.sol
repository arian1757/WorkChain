// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;


import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract WorkChain is ReentrancyGuard {
    // Define an event that is emitted when a project is created
    event CreatedProject(uint indexed ID, string  message);
    // Define an event that is emitted when a project deadline is set
    event DeadLineNotice (uint  deadline);
  

    
    // Define an enum type that represents the acceptance status of a project
    enum IsAccepted {
        No,
        Yes,
        Dissatisfied,
        Reviewing

    }
    // Define a struct type that represents a project
    struct Project {
        uint256 projectID; // The unique identifier of the project
        address employer;
        address employee;
        string projectDescription; // The description of the project
        uint256 budget; 
        uint256 projectDuration; // The time that the project should be done in seconds
        uint256 deadLine; // The deadline of the project in unix timestamp
        uint256 endTime; 
        bool isActive;
        bool isCompleted;
        IsAccepted isAccepted; // The acceptance status of the project
    }


    Project[] public projects;
    mapping(address =>uint[]) public employerProjects; // A mapping that stores the project IDs for each employer address
    mapping(address =>uint[]) public employeeProjects;
    mapping(address =>uint256) public credits; // A mapping that stores the available credits for employers
    mapping(address =>uint256) public lockedCredits; // A mapping that stores the locked credits for employers
    mapping(address =>uint256) private employeeCredits;
    mapping(address =>uint256) public employeeLockedCredits;
    mapping (address => bool) private ownerStatus; // A mapping that stores the owners status 
    uint256 public treasury ; // A variable that stores the income of the contract
    address public owner1;
    address public owner2;
    bool public status = true; // A variable that stores the working status of the contract
    






    modifier checkBalance (uint256 _budget) { // A modifier that checks if an address has enough credits to create a project with a given budget
        credits[msg.sender] += msg.value;
        if (msg.value < _budget){
            require (credits[msg.sender]>= _budget, 'Please Increase your credit');
            _;
        }
        _;
    }

    modifier checkEmployee (uint256 _projectID){ // A modifier that checks if an address is the employee of a given project ID
        require(projects[_projectID - 1].employee == msg.sender);
        _;
    }
    modifier checkEmployer (uint256 _projectID){
        require(projects[_projectID - 1].employer == msg.sender);
        _;
    }
    modifier onlyOwner() {
        require (msg.sender == owner1 || msg.sender == owner2);
        _;
    }
    modifier working () { // A modifier that checks if the contract is working or not
        require (status);
        _;
    }

    constructor(address _owner1, address _owner2) {
        owner1 = _owner1;
        owner2 = _owner2;
        ownerStatus[owner1] = false; // Set the owner status of owner1 to false in the mapping
        ownerStatus[owner2] = false;

    }



    function createProject(string memory _projectDescription, uint256 _budget, uint256 _projectDuration ) 
    public payable checkBalance(_budget) working { // A public payable function that allows an employer to create a project with a given description, 
    //budget, and duration, and requires that they have enough credits and that the contract is working
        require (_projectDuration >0, 'Duration must be more than 0');
        credits[msg.sender] -= _budget;
        lockedCredits[msg.sender] += _budget;

        uint256 projectID = projects.length + 1;
        uint256 projectTime = _projectDuration * 1 days; // Calculate the project time in seconds as the project duration in days multiplied by one day in seconds
        Project memory NewProject = Project(projectID, msg.sender,address(0), _projectDescription,
        _budget, projectTime, 0, 0, true, false, IsAccepted.No);
        projects.push(NewProject);
        employerProjects[msg.sender].push(projectID);
        emit CreatedProject(projectID, 'Project is Active now');

    }

    function acceptProject (uint256 _projectID ) public payable working{ // A public payable function that allows a freelancer to accept a project with a given ID,
    // and requires that the contract is working
    // // Require that the project with the given ID is active, otherwise revert with an error message
        require(projects[_projectID - 1].isActive,'Invalid project ID or the project is not active');
        employeeCredits[msg.sender] += msg.value;
        uint256 guarantee = (projects[_projectID - 1].budget * 20) /100; // Calculate the guarantee amount as 20% of the project budget
        if (msg.value < guarantee){
            require (employeeCredits[msg.sender]>= guarantee, 'Please Increase your credit');
        }
        employeeCredits[msg.sender] -= guarantee;
        employeeLockedCredits[msg.sender] += guarantee;
        projects[_projectID - 1].deadLine = projects[_projectID - 1].projectDuration + block.timestamp;
        projects[_projectID - 1].employee = msg.sender;
        projects[_projectID - 1].isActive = false; // Set the active flag of the project to false
        employeeProjects[msg.sender].push(_projectID);
        

        emit DeadLineNotice(projects[_projectID - 1].deadLine);

    }
    function completedProject (uint256 _projectID) public checkEmployee(_projectID) { // A public function that allows an employee to mark a project as completed
        projects[_projectID - 1].isCompleted = true;
        projects[_projectID - 1].endTime = block.timestamp;
        
    }

    function confirmedProject (uint256 _projectID) public checkEmployer(_projectID){ // A public function that allows an employer to confirm a project as accepted
        require(projects[_projectID - 1].isCompleted == true,' the project is not completed wait more');
        projects[_projectID - 1].isAccepted = IsAccepted.Yes;
        

    }

    function releasePayment(uint256 _projectID) public checkEmployee(_projectID){
        require(projects[_projectID - 1].isAccepted == IsAccepted.Yes,' you should wait more');
        uint256 budget = projects[_projectID - 1].budget;
        // If the end time of the project is less than or equal to its deadline, There is no punishment
        if (projects[_projectID - 1].endTime <= projects[_projectID - 1].deadLine){
            lockedCredits[projects[_projectID - 1].employer] -= budget;
            employeeLockedCredits[projects[_projectID - 1].employee] -= (budget * 20)/100;
            employeeCredits[projects[_projectID - 1].employee] += ((budget * 20) + (budget * 95)) /100;
            treasury +=(budget * 5)/100;
        // Else if the end time of the project exceeds its deadline by less than or equal to 20% of its duration
        // There is  liitle punishment = 15% budget, 10% budget will be rewarded to the employer
        } else if (projects[_projectID - 1].endTime - projects[_projectID - 1].deadLine <= projects[_projectID - 1].projectDuration * 20/100){
            lockedCredits[projects[_projectID - 1].employer] -= budget;
            credits[projects[_projectID - 1].employer] += (budget * 10)/100;
            employeeLockedCredits[projects[_projectID - 1].employee] -= (budget * 20)/100;
            employeeCredits[projects[_projectID - 1].employee] += ((budget * 20) + (budget * 80)) /100;
            treasury += (budget * 10)/100;

        } else { // Else if the end time of the project exceeds its deadline by more than 20% of its duration
        // there is a huge punishment for the freelancer = 50%, 30% budget will be rewarded to the employer
            lockedCredits[projects[_projectID - 1].employer] -= budget;
            credits[projects[_projectID - 1].employer] += (budget * 30)/100;
            employeeCredits[projects[_projectID - 1].employee] += (budget * 70)/100;
            employeeLockedCredits[projects[_projectID - 1].employee] -= (budget * 20)/100;
            treasury += (budget * 20)/100;

        }
    }
    function notConfirmed (uint256 _projectID) public checkEmployee(_projectID){ // A public function that allows an employee to mark a project as accepted 
    // if it is not confirmed by the employer after one day
        require(projects[_projectID - 1].isAccepted != IsAccepted.Dissatisfied, 'your client is not satisfied');
        require(block.timestamp >= projects[_projectID - 1].endTime +1 days );
        projects[_projectID - 1].isAccepted = IsAccepted.Yes;

    }

    function dissatisfied (uint256 _projectID) public checkEmployer(_projectID){ // A public function that allows an employer to mark a project as dissatisfied
        require(projects[_projectID - 1].isCompleted == true, 'your peoject is not done');
        projects[_projectID - 1].isAccepted = IsAccepted.Dissatisfied;

    }

    function withdraw(uint256 _Amount, string memory _position) public nonReentrant { // A public function that allows an employer/employee to withdraw a certain amount of credits from their balance, 
    // and requires that they are not reentrant
        bytes32 positionHash = keccak256(bytes(_position)); // Calculate the hash of the position string passed as a parameter
        if (positionHash == keccak256("Employer")) {// If the position hash is equal to the hash of "Employer"
            require(credits[msg.sender]>= _Amount);
            credits[msg.sender] -= _Amount;
            (bool success, ) = msg.sender.call{value: _Amount}("");
            require(success);


        } else if (positionHash == keccak256("Employee")) {
            require(employeeCredits[msg.sender]>= _Amount);
            employeeCredits[msg.sender] -= _Amount;
            (bool success, ) = msg.sender.call{value: _Amount}("");
            require(success);
        } 


    }
    function review(uint256 _projectID) public {// A public function that allows an address to request a review for a project
    // workchain should analyze the project and resolve conflicts between employer and employee
        require(projects[_projectID - 1].employer == msg.sender || projects[_projectID - 1].employee == msg.sender,'wrong project ID');
        require(projects[_projectID - 1].isCompleted == true, 'your peoject is not done');
        projects[_projectID - 1].isAccepted = IsAccepted.Reviewing;

    }

    function finalDecision (uint256 _projectID, uint256 Proportion ) public onlyOwner{ // A public function that allows one of the owners of the contract to make a final decision on a project under review
    // requires that they pass a proportion parameter which is the share of employer 
    // 30% of budget is the cost of reviewing
        require(Proportion<=70);
        require(projects[_projectID - 1].isAccepted == IsAccepted.Reviewing);
        projects[_projectID - 1].isAccepted = IsAccepted.Yes;
        uint256 budget = projects[_projectID - 1].budget;
        lockedCredits[projects[_projectID - 1].employer] -= budget;
        credits[projects[_projectID - 1].employer] += (budget * Proportion)/100;
        employeeLockedCredits[projects[_projectID - 1].employee] -= (budget * 20)/100;
        employeeCredits[projects[_projectID - 1].employee] += ((budget * 20) + (budget * (100 - Proportion - 30))) /100;
        treasury += (budget * 30)/100;
    }

    function cancelProject (uint256 _projectID) public checkEmployer(_projectID){ // A public function that allows an employer to cancel a project with a given ID
    // The project must not have been  assigned to an employee
        require(projects[_projectID - 1].isActive == true); 
        projects[_projectID - 1].isActive = false;
        uint256 budget = projects[_projectID - 1].budget;
        lockedCredits[projects[_projectID - 1].employer] -= budget;
        credits[projects[_projectID - 1].employer] += budget;

    }



    function confirm() public onlyOwner { // A public function that allows one of the owners of the contract to confirm their status
        
        ownerStatus[msg.sender] = true;
    }

    function setPause (bool _paused) public onlyOwner { // A public function that allows one of the owners of the contract to pause the contract
    // the two owners should accept to pause the contract
        require (ownerStatus[owner1]  && ownerStatus[owner2] ,'confirmation is not completed');
        status = _paused;
        ownerStatus[owner1] = false;
        ownerStatus[owner2] = false;

    }

    function withdrawTreasury () public payable onlyOwner() nonReentrant{ // Send the treasury balance in wei to owner1 address
        require(ownerStatus[owner2] == true || msg.sender == owner2);
        
        (bool success,) = owner1.call{value:treasury}('');
        require(success,"Failed to send Ether");
        treasury = 0;
        
    }



    function getProject(uint256 _projectID) view public returns(uint256 projectID,
        address employer,address employee,string memory projectDescription,
        uint256 budget, uint256 projectDuration,uint256 deadLine,
        uint256 endTime,bool isActive,bool isCompleted,IsAccepted isAccepted) { // A view public function that returns various information about a project with a given ID
        projectID =  projects[_projectID - 1].projectID;
        employer =  projects[_projectID - 1].employer;
        employee =  projects[_projectID - 1].employee;
        projectDescription =  projects[_projectID - 1].projectDescription;
        budget =  projects[_projectID - 1].budget;
        projectDuration = projects[_projectID - 1].projectDuration;
        deadLine= projects[_projectID - 1].deadLine;
        endTime= projects[_projectID - 1].endTime;
        isActive =  projects[_projectID - 1].isActive;
        isCompleted = projects[_projectID - 1].isCompleted;
        isAccepted = projects[_projectID - 1].isAccepted;


    }

    function getEmployeeProjects(address _address) view public returns(uint[] memory){ // A view public function that returns an array of project IDs for a given employer address
        return (employeeProjects[_address]);
    }

    function  getEmployerProjects(address _address) view public returns(uint[] memory){
        return (employerProjects[_address]);


    }
    function  getEmployerCreadits(address _address) view public returns(uint,uint){ // A view public function that returns the available and locked credits for a given employee address
        return (credits[_address],lockedCredits[_address]);

    }
    function  getEmployeeCreadits(address _address) view public returns(uint,uint){
        return (employeeCredits[_address],employeeLockedCredits[_address]);

    }
    function  getStatus() view public returns(bool){ // A view public function that returns the working status of the contract
        return (status);

    }
    function  getTreasury() view public returns(uint256){ // A view public function that returns the treasury balance of the contract
        return (treasury);

    }



}



