import { ethers } from "./ethers-5.6.esm.min.js" 
import { abi, contractAddress } from "./constants.js"

  

const _connectButton = document.getElementById ("connectButton" )
const ConfirmOwners = document.getElementById ("Confirm" )
const SetPause = document.getElementById ("SetPause" )
const WithdrawTreasury = document.getElementById ("WithdrawTreasury" )
const GetStatus = document.getElementById ("GetStatus" )
const GetTreasury = document.getElementById ("GetTreasury" )
const getProject = document.getElementById ("getProject" )
const getUsersProjects = document.getElementById ("getUsersProjects" )
const getUsersCredits = document.getElementById ("getUsersCredits" )
const _CreateProject = document.getElementById("CreateProject" )
const AcceptProject = document.getElementById("AcceptProject" )
const CompletedProject = document.getElementById ( "CompletedProject" )
const ConfirmedProject = document.getElementById ( "ConfirmedProject" )
const RealeasePayment = document.getElementById ( "RealeasePayment" )
const DissatisfiedProject = document.getElementById ( "DissatisfiedProject" )
const NotConfirmedProject = document.getElementById ( "NotConfirmedProject" )
const WithdrawUsers = document.getElementById ( "WithdrawUsers" )
const ReviewProject = document.getElementById ( "ReviewProject" )
const FinalDecisionProject = document.getElementById ( "FinalDecisionProject" )
const CancelProject = document.getElementById ( "CancelProject" )

_connectButton.onclick = connect
ConfirmOwners.onclick = Confirm_Owmers
SetPause.onclick = Set_Pause
WithdrawTreasury.onclick = Withdraw_Treasury
GetStatus.onclick = Get_Status
GetTreasury.onclick = Get_Treasury
getProject.onclick = get_Project
getUsersProjects.onclick = get_Users_Projects
getUsersCredits.onclick = get_Users_Credits
_CreateProject.onclick = Create_project
AcceptProject.onclick = Accept_Project
CompletedProject.onclick = Done
ConfirmedProject.onclick = Confirm

RealeasePayment.onclick = Release_Payment
NotConfirmedProject.onclick = Not_Confirmed
DissatisfiedProject.onclick = Dissatisfied
WithdrawUsers.onclick = Withdraw_Users
ReviewProject.onclick = Review_Project
FinalDecisionProject.onclick = Final_Decision
CancelProject.onclick = Cancel_Project


async function connect () {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum. request ({ method: "eth_requestAccounts" })
        } catch (error) {
            console. log (error)
        }
        _connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({method: "eth_accounts" })
        console.log (accounts)
        } else {
            _connectButton. innerHTML = "Please install MetaMasK"
    }
    }
async function Create_project() {
    const budget = document.getElementById( "Budget" ).value
    const _budget = ethers.utils.parseEther(budget)
    const description = document.getElementById("ProjectDescription").value
    const duration = document.getElementById("ProjectDuration").value
    const credit = document.getElementById("IncreaseCredit").value
    console.log (`Creating Project with ${budget} description:${description} and days:${duration}`)
    if (typeof window.ethereum !== "undefined") {
        
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract (contractAddress, abi, signer)
        
        try {
            const transactionResponse = await contract.createProject(description,_budget,duration,{
            value: ethers.utils.parseEther(credit),
            })
        await listenForTransactionMine (transactionResponse, provider)
        contract.on('CreatedProject', function(ID,message, event) {
            console.log(event)
            
            if (Notification.permission === 'granted') {
              
              var notification = new Notification('Project ID:'+ID, {body: message});
            } else {
              
              Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                  
                  var notification = new Notification('Project ID:'+ID, {body: message});
                }
              });
            }
          });
        }   catch (error) {
            console.log (error)
            }

        
        } else {
            _connectButton.innerHTML = "Please install MetaMask"
        }
    }
    function listenForTransactionMine(transactionResponse, provider){
        console.log(`Mining ${transactionResponse.hash}`)
        return new Promise((resolve, reject)=> {
        try {
            provider.once(transactionResponse.hash, (TransactionReceipt) => {
                console.log(`Completed with ${TransactionReceipt.confirmations} confirmations`)
            })
            resolve()
        
        } catch (error) {
            reject(error)

        }
    })
}

async function Accept_Project(){
    console.log(`Accepting project `)
    const ID = document.getElementById( "_ProjectId" ).value
    const credit = document.getElementById("IncreaseCreditEmployee").value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.acceptProject(ID,{value: ethers.utils.parseEther(credit)})
            await listenForTransactionMine(transactionResponse, provider)
            contract.on('DeadLineNotice', function(deadline, event) {
                console.log(event)
                deadline = new Date(deadline *1000)
                
                if (Notification.permission === 'granted') {
                  
                  var notification = new Notification('your deadline is :'+deadline);
                } else {
                  
                  Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                      
                      var notification = new Notification('your deadline is :'+deadline);
                    }
                  });
                }
              });
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}

async function Done(){
    console.log(`Completing project `)
    const ID = document.getElementById( "CompletedProjectId" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.completedProject(ID)
            await listenForTransactionMine(transactionResponse, provider)
                if (Notification.permission === 'granted') {
                  
                  var notification = new Notification('wait for confirmation');
                } else {
                  
                  Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                      
                      var notification = new Notification('wait for confirmation');
                    }
                  });
                }
            
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}

async function Confirm(){
    console.log(`Confirming project `)
    const ID = document.getElementById( "ConfirmedProjectId" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.confirmedProject(ID)
            await listenForTransactionMine(transactionResponse, provider)
            if (Notification.permission === 'granted') {
                  
                var notification = new Notification('see you soon for the next project');
              } else {
                
                Notification.requestPermission().then(function(permission) {
                  if (permission === 'granted') {
                    
                    var notification = new Notification('see you soon for the next project');
                  }
                });
              }
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}

async function Release_Payment(){
    console.log(`Release Payment `)
    const ID = document.getElementById( "RealeasePaymentId" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            
            const transactionResponse = await contract.releasePayment(ID)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function Not_Confirmed(){
    console.log(`Comfirming Project`)
    const ID = document.getElementById( "NotConfirmedProjectId" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            
            const transactionResponse = await contract.notConfirmed(ID)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}

async function Dissatisfied(){
    console.log(`Dissatisfied Project`)
    const ID = document.getElementById( "DissatisfiedProjectId" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            
            const transactionResponse = await contract.dissatisfied(ID)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}

async function Withdraw_Users(){
    console.log(`Withdrawing `)
    const Eth_amount = document.getElementById( "Amountneeded" ).value
    const Withdraw_Value = ethers.utils.parseEther(Eth_amount)
    const Position = document.getElementById( "userTypeSelect" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            
            const transactionResponse = await contract.withdraw(Withdraw_Value,Position)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}

async function Review_Project(){
    console.log(`review project `)
    const ID = document.getElementById( "ReviewProjectId" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.review(ID)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function Final_Decision(){
    console.log(`Finaling project `)
    const ID = document.getElementById( "FinalDecisionProjectId" ).value
    const proportion = document.getElementById( "FinalDecisionProportion" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.finalDecision(ID,proportion)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function Cancel_Project(){
    console.log(`Cancel project `)
    const ID = document.getElementById( "CancelProjectId" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.cancelProject(ID)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function Confirm_Owmers(){
    console.log(`Confirming `)
    
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.confirm()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function Set_Pause(){
    console.log(`Pausing `)
    
    if (typeof window.ethereum !== "undefined") {
        const status = document.getElementById( "statusSelect" ).value
        const paused = (status !== "true")
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.setPause(paused)
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function Withdraw_Treasury(){
    console.log(`Withdrawing `)
    
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdrawTreasury()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function get_Project(){
    console.log(`getting details of project `)
    const ID = document.getElementById( "DetailsProjectId" ).value
    
    if (typeof window.ethereum !== "undefined") {
        
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            

            const transactionResponse =  contract.getProject(ID)
            transactionResponse.then(result => {
                
                document.getElementById("projectID").innerHTML = result.projectID
                document.getElementById("employer").innerHTML = result.employer
                document.getElementById("employee").innerHTML = result.employee
                document.getElementById("projectDescription").innerHTML = result.projectDescription
                document.getElementById("budget").innerHTML =   ethers.utils.formatEther(result.budget)
                document.getElementById("projectDuration").innerHTML = (result.projectDuration/86400).toFixed(2)
                if (result.deadLine ==0){
                    document.getElementById("deadLine").innerHTML = 0
                } else {
                    document.getElementById("deadLine").innerHTML = new Date(result.deadLine *1000)
                }
                if (result.endTime ==0){
                    document.getElementById("endTime").innerHTML = 0
                } else {
                    document.getElementById("endTime").innerHTML = new Date(result.endTime *1000)
                }
                
                document.getElementById("isActive").innerHTML = result.isActive
                document.getElementById("isCompleted").innerHTML = result.isCompleted
                if (result.isAccepted ==0){
                    document.getElementById("isAccepted").innerHTML = 'no'
                } else if (result.isAccepted==1){
                    document.getElementById("isAccepted").innerHTML ='yes'
                } else if (result.isAccepted==2){
                    document.getElementById("isAccepted").innerHTML ='dissatisfied'
                } else if (result.isAccepted==3){
                    document.getElementById("isAccepted").innerHTML = 'Reviewing'
                }
                
            })
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function get_Users_Projects(){
    console.log(`getting  projects `)
    const position = document.getElementById( "userPositionSelect" ).value
    const address = document.getElementById( "AddressProject" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            if (position =='Employer' ){

                const transactionResponse =  contract.getEmployerProjects(address)
                transactionResponse.then(result => {
                    var projectIDs = result.map(id => id.toNumber());
                    document.getElementById("projectIDs").innerHTML = projectIDs.join(", ")})
            } else {
                const transactionResponse =  contract.getEmployeeProjects(address)
                    transactionResponse.then(result => {
                        var projectIDs = result.map(id => id.toNumber())
                        document.getElementById("projectIDs").innerHTML = projectIDs.join(", ")});          
            }
            
            
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function get_Users_Credits(){
    console.log(`getting  Credits `)
    const position = document.getElementById( "userPositionSelect" ).value
    const address = document.getElementById( "AddressProject" ).value
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider (window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            if (position =='Employer' ){

                const transactionResponse =  contract.getEmployerCreadits(address)
                transactionResponse.then(result => {
                    var CreditsUsers = result.map(id => ethers.utils.formatEther(id));
                    
                    document.getElementById("Creditsavailable").innerHTML = CreditsUsers[0]
                    document.getElementById("LockedCredit").innerHTML = CreditsUsers[1]})
            } else {
                const transactionResponse =  contract.getEmployeeCreadits(address)
                    transactionResponse.then(result => {
                    var CreditsUsers = result.map(id => ethers.utils.formatEther(id));
                    
                    document.getElementById("Creditsavailable").innerHTML = CreditsUsers[0]
                    document.getElementById("LockedCredit").innerHTML = CreditsUsers[1]})     
            }
            
            
        } catch (error) {
            console.log(error)
        }

    } else {
        _connectButton.innerHTML = "Please install MetaMask"   
    }

}
async function Get_Status(){
    if (typeof window.ethereum !== "undefined") {
        
        try {
            const provider = new ethers.providers.Web3Provider (window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract (contractAddress, abi,signer)
            
            const staus = await contract.getStatus()
            console.log(staus)
            
        } catch (error) {
            console.log(error)
        }
    } else {
        GetStatus.innerHTML = 'Please install MetaMask'
    }

}
async function Get_Treasury(){
    if (typeof window.ethereum !== "undefined") {
        
        try {
            const provider = new ethers.providers.Web3Provider (window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract (contractAddress, abi,signer)
            
            const Amount = await contract.getTreasury()
            console.log(ethers.utils.formatEther(Amount))
            
        } catch (error) {
            console.log(error)
        }
    } else {
        _connectButton.innerHTML = 'Please install MetaMask'
    }

}