from brownie import accounts,network, config, WorkChain





def deploy_WorkChain():
    account = get_account()
    print ('please give the address of owners')
    owner1 = input()
    owner2 = input()

    

    workchain = WorkChain.deploy(owner1,owner2,{'from':account})



def get_account():
    if (network.show_active() == 'development'):
        return accounts[0]
    else :
        return accounts.add(config['wallets']['from_key'])




def main():
    
    deploy_WorkChain()