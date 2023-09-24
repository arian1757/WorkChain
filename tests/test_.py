import pytest
from brownie import WorkChain, accounts, chain


def test_create_project():
    account = accounts[0]
    account1 = accounts[1]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})



    assert workchain.getProject(1) == (1,account,'0x0000000000000000000000000000000000000000' ,'type',10*10**17,86400,0,0,True,False,0)
    assert workchain.getEmployerProjects(account) == (1,)

def test_accept_project():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})

    assert workchain.getProject(1) == (1,account,employee ,'type',10*10**17,86400,chain.time()+86400,0,False,False,0)
    assert workchain.getEmployeeProjects(employee) == (1,)

def test_completed_accepted_project():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    workchain.completedProject(1,{'from':employee})
    workchain.confirmedProject(1,{'from':account})

    assert workchain.getProject(1) == (1,account,employee ,'type',10*10**17,86400,chain.time()+86400,chain.time(),False,True,1)

def test_realease_payment_full():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    workchain.completedProject(1,{'from':employee})
    workchain.confirmedProject(1,{'from':account})
    workchain.releasePayment(1,{'from':employee})

    assert workchain.getEmployerCreadits(account) == (0,0)
    assert workchain.getEmployeeCreadits(employee) == (20*10**16+((10*10**17 *95)/100),0)

def test_realease_payment_punishment20():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    chain.mine(timestamp=chain.time() +95000)
    workchain.completedProject(1,{'from':employee})
    workchain.confirmedProject(1,{'from':account})
    workchain.releasePayment(1,{'from':employee})

    assert workchain.getEmployerCreadits(account) == (10*10**16,0)
    assert workchain.getEmployeeCreadits(employee) == (20*10**16+((10*10**17 *80)/100),0)
def test_realease_payment_FullPunishment():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    chain.mine(timestamp=chain.time() +180000)
    workchain.completedProject(1,{'from':employee})
    workchain.confirmedProject(1,{'from':account})
    workchain.releasePayment(1,{'from':employee})

    assert workchain.getEmployerCreadits(account) == (30*10**16,0)
    assert workchain.getEmployeeCreadits(employee) == ((10*10**17 *70)/100,0)

def test_not_confirmed ():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    current_time = chain.time()
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    chain.mine(timestamp=chain.time()+ 20000)
    
    workchain.completedProject(1,{'from':employee})
    end_time = chain.time()+1
    chain.mine(timestamp=chain.time()+ 90000)
    workchain.notConfirmed(1,{'from':employee})

    assert workchain.getProject(1) == (1,account,employee ,'type',10*10**17,86400,current_time+86400,end_time,False,True,1)

def test_dissatisfied():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    current_time = chain.time()+1
    chain.mine(timestamp=chain.time()+ 20000)
    end_time = chain.time()+1
    workchain.completedProject(1,{'from':employee})
    
    chain.mine(timestamp=chain.time()+ 90000)
    workchain.dissatisfied(1,{'from':account})
    assert workchain.getProject(1) == (1,account,employee ,'type',10*10**17,86400,current_time+86400,end_time,False,True,2)

def test_withdraw() :
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    workchain.completedProject(1,{'from':employee})
    workchain.confirmedProject(1,{'from':account})
    workchain.releasePayment(1,{'from':employee})
    workchain.withdraw(20*10**16+((10*10**17 *95)/100),'Employee',{'from':employee})

    assert workchain.getEmployeeCreadits(employee) == (0,0)


def test_Review():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    current_time = chain.time()+1
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    
    chain.mine(timestamp=chain.time()+ 20000)
    
    workchain.completedProject(1,{'from':employee})
    end_time = chain.time()+1
    chain.mine(timestamp=chain.time()+ 90000)
    workchain.review(1,{'from':account})

    assert workchain.getProject(1) == (1,account,employee ,'type',10*10**17,86400,current_time+86400,end_time,False,True,3)

def test_final_decision():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    current_time = chain.time()+1
    chain.mine(timestamp=chain.time()+ 20000)
    
    workchain.completedProject(1,{'from':employee})
    end_time = chain.time()+1
    chain.mine(timestamp=chain.time()+ 90000)
    workchain.review(1,{'from':account})
    workchain.finalDecision(1,70)

    assert workchain.getEmployerCreadits(account) == ((10*10**17) * 70/100,0)
    assert workchain.getEmployeeCreadits(employee) == (20*10**16,0)

def test_cancel_project():
    account = accounts[0]
    account1 = accounts[1]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.cancelProject(1,{'from':account})



    assert workchain.getProject(1) == (1,account,'0x0000000000000000000000000000000000000000' ,'type',10*10**17,86400,0,0,False,False,0)
    assert workchain.getEmployerCreadits(account) == (10*10**17,0)


def test_status_false():

    owner1 = accounts[0]
    owner2 = accounts[1]
    workchain = WorkChain.deploy(owner1,owner2,{'from': owner1})
    workchain.confirm({'from':owner1})
    workchain.confirm({'from':owner2})
    workchain.setPause(False,{'from':owner2})



    assert workchain.getStatus({'from': owner1}) == False

def test_withdraw_treasury ():
    account = accounts[0]
    employee = accounts[1]
    account1 = accounts[2]
    workchain = WorkChain.deploy(account,account1,{'from': account})
    workchain.createProject('type',10*10**17, 1,{'value':10*10**17,'from':account})
    workchain.acceptProject(1,{'value':20*10**16,'from':employee})
    workchain.completedProject(1,{'from':employee})
    workchain.confirmedProject(1,{'from':account})
    workchain.releasePayment(1,{'from':employee})
    workchain.confirm({'from':account1})
    assert workchain.getTreasury({'from':account}) == (10*10**17) *5/100
    workchain.withdrawTreasury({'from':account})

    assert workchain.getTreasury({'from':account}) == 0


