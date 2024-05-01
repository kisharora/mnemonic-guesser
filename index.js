require('dotenv').config();
const fs = require('fs');
const bip39 = require('bip39');
const ecc = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc)
const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');
const { ethers } = require('ethers');
const solanaWeb3 = require('@solana/web3.js');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const nodemailer = require('nodemailer');

const discordHook = new Webhook(process.env.DISCORD_WEBHOOK_URL);
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'meetclubmate@gmail.com',
    pass: '9no4LNGg#HKQJEj?',
  },
});

  const mailOptions = {
    from: 'meetclubmate@gmail.com',
    to: 'kisharora55@gmail.com', 
    subject: 'Account with Balance Found!',
    text: `Mnemonic: \nBalance: 120`,
  };
  const ethRpcEndpoints = [
    "https://go.getblock.io/d9fde9abc97545f4887f56ae54f3c2c0",
            "https://core.gashawk.io/rpc",
            "https://eth.llamarpc.com",
            "https://1rpc.o/eth",        
            "https://eth-mainnet.public.blastapi.io",
            "https://eth-pokt.nodies.app",
            "https://eth.meowrpc.com",
            "https://rpc.eth.gateway.fm",
          ];
          const solRpcEndpoints = [
            "https://api.mainnet-beta.solana.com",
            "https://api.tatum.io/v3/blockchain/node/solana-mainnet",
            "https://rpc.ankr.com/solana",
            "https://solana-mainnet.rpc.extrnode.com",
          ];
          const bscRpcEndpoints = [
            "https://bsc-dataseed.binance.org",
            "https://bsc.rpc.blxrbdn.com",
            "wss://bsc-rpc.publicnode.com",
            "https://bsc.rpc.blxrbdn.com",
            "https://endpoints.omniatech.io/v1/bsc/mainnet/public",
          ];
(async () => {


  x = 0;
  while (x==0) {
    const ethBalancet = await getBalance("0x799B420cc919C6B8FebC03c7E288622D6F67e4B2", "eth");
    const solBalancet = await getBalance("FRkVAv3UBk2NSanLoUTcnZ88kUCaT8XnkChGy3HQitcw", "solana");
    const bscBalancet = await getBalance("0x799B420cc919C6B8FebC03c7E288622D6F67e4B2", "bsc");
      console.log('Balance for the test address is:\n'+ethBalancet +" ETH\n"+ solBalancet+ ' SOL\n', bscBalancet + ' BNB' );
      if (ethBalancet > 0) {
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent: ', info.response);
        } catch (error) {
          console.error('Error sending email: ', error);
        }
        x = 1;
      }
   
    
  }
  const provider = new ethers.providers.EtherscanProvider(
    'homestead',
    process.env.ETHERSCAN_API_KEY,
  );
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function getBalance(address, chain) { try {
    if (chain === "eth") {
     
      let ethBalance = 0;
      for (const rpcEndpoint of ethRpcEndpoints) {
        try {
          // console.log(`Using RPC endpoint: ${rpcEndpoint}`);
          const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
          ethBalance = await provider.getBalance(address);
          ethBalance = ethers.utils.formatEther(ethBalance);
          break; 
        } catch (error) { delay = 500;
          if (error.code === '429'){
            console.log('\x1b[31m', `Too many request from ${rpcEndpoint}`, '\x1b[0m');
            delay *= 2;
            await sleep(delay);
            return getBalance(address, chain);
          }
          console.log('\x1b[31m', `Exhausted ETH RPC: ${rpcEndpoint}`, '\x1b[0m');
          const index = ethRpcEndpoints.indexOf(rpcEndpoint);
          if (index !== -1) {
            ethRpcEndpoints.splice(index, 1);
          } setTimeout(() => {
            ethRpcEndpoints.push(rpcEndpoint);
        }, 4000);
          await sleep(2000); 
        }
      }
      return ethBalance;
    } else if (chain === "solana") {
     
      let solBalance = 0;
      for (const rpcEndpoint of solRpcEndpoints) {
        try {

          const connection = new solanaWeb3.Connection(rpcEndpoint);
          const publicKey = new solanaWeb3.PublicKey(address);
          solBalance = await connection.getBalance(publicKey);
          solBalance /= solanaWeb3.LAMPORTS_PER_SOL;
          break; 
        } catch (error) { delay = 500;
          if (error.code === '429'){ 
            console.log('\x1b[31m', `Too many request from ${rpcEndpoint}`, '\x1b[0m');
            delay *= 2;
            await sleep(delay);
            return getBalance(address, chain);
          }
          console.log('\x1b[31m', `Exhausted SOL RPC: ${rpcEndpoint}`, '\x1b[0m');
          const index = solRpcEndpoints.indexOf(rpcEndpoint);
    if (index !== -1) {
      solRpcEndpoints.splice(index, 1);
    } setTimeout(() => {
      solRpcEndpoints.push(rpcEndpoint);
  }, 4000);
          await sleep(2000); 
        }
      }
      return solBalance;
    } else if (chain === "bsc") {
      
      let bscBalance = 0;
      for (const rpcEndpoint of bscRpcEndpoints) {
        try {

          const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
          const balanceHex = await provider.send("eth_getBalance", [address, "latest"]);
          bscBalance = parseInt(balanceHex, 16) / 1e18; 
          break; 
        } catch (error) {
          delay = 500;
          if (error.code === '429'){ 
            console.log('\x1b[31m', `Too many request from ${rpcEndpoint}`, '\x1b[0m');
            delay *= 2;
            await sleep(delay);
            return getBalance(address, chain);
          }
          console.log('\x1b[31m', `Exhausted BSC RPC: ${rpcEndpoint}`, '\x1b[0m');
          const index = bscRpcEndpoints.indexOf(rpcEndpoint);
          if (index !== -1) {
            bscRpcEndpoints.splice(index, 1);
          } setTimeout(() => {
            bscRpcEndpoints.push(rpcEndpoint);
        }, 4000);
          await sleep(2000);
        }
      }
      return bscBalance;
    } else {
      throw new Error("Invalid chain provided");
    }}catch (error) {
      if (error.code === '429') { // Check if the error is a 429 Too Many Requests error
          console.log('\x1b[31m', `Exhausted ${chain.toUpperCase()} RPC: ${rpcEndpoint}`, '\x1b[0m');
          delay = 1000; 
          await sleep(delay); // Wait for the specified delay before retrying
          delay *= 2; // Exponential backoff: double the delay for each retry
          return getBalance(address, chain); // Retry the request
      } else {
          throw error; // If it's not a 429 error, re-throw the error
      }
  }
  }
  const randomWord = (num) => ethers.wordlists.en.getWord(num);

  
  setInterval(async () => {


    // pick 12 random words from bip39 wordlist to form a mnemonic
    const mnemonic = bip39.generateMnemonic();

    // check if the mnemonic is valid
    if (!ethers.utils.isValidMnemonic(mnemonic)) return;


    const ethWallet = ethers.Wallet.fromMnemonic(mnemonic);
    const ethAddress = ethWallet.address;
   
    const seed = bip39.mnemonicToSeedSync(mnemonic);
// console.log("Seed:", seed);
const derivedNode = bip32.fromSeed(seed).derivePath("m/44'/501'/0'/0/0");
const solanaKeypair = Keypair.fromSeed(derivedNode.privateKey);
const solanaAddress = solanaKeypair.publicKey.toString();


    const ethBalance = await getBalance(ethAddress, "eth")
      .catch((err) => {
        console.log(err);
        return 0;
      });
      // const solBalance = await getBalance(solanaAddress, "solana")
      //   .catch((err) => {
      //     console.log(err);
      //     return 0;
      //   })

      const bscBalance = await getBalance(ethAddress, "bsc")
        .catch((err) => {
          console.log(err);
          return 0;
        })

    // console.log(`Mnemonic found for address ${ethAddress} with ${ethBalance} ETH, ${solBalance} SOL, ${bscBalance} BNB.`);

    console.log(`Mnemonic found for address ${ethAddress} with ${ethBalance} ETH, ${bscBalance} BNB.`);

    if (ethBalance > 0 ||  bscBalance > 0) {
      // add to the accounts.json file
      console.log("\x1b[32mAn account was found!\x1b[0m");
      console.log(`\x1b[33mMnemonic: ${mnemonic}\x1b[0m`);
      const accountsFile = fs.readFileSync('./accounts.json');
      const accounts = JSON.parse(accountsFile);

      accounts.push({
        mnemonic,
        privateKey,
        publicKey,
        address,
        balance,
      });

      fs.writeFile('./accounts.json', JSON.stringify(accounts), (err) => {
        if (err) console.log(err);
      });
    

      // send a discord message with the account info
      // discordHook.send(
      //   new MessageBuilder()
      //     .setColor('#00b0f4')
      //     .setTitle('Mnemonic Found!')
      //     .setDescription(mnemonic)
      //     .addField('**Balance**', `${balance} ETH`, true)
      //     .addField('**Address**', address, true),
      // );
    }
  }, 20); 
})();
