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

const discordHook = new Webhook(process.env.DISCORD_WEBHOOK_URL);

(async () => {
  x = 0;
  while (x==0) {
    const ethBalancet = await getBalance("0x799B420cc919C6B8FebC03c7E288622D6F67e4B2", "eth");
    const solBalancet = await getBalance("FRkVAv3UBk2NSanLoUTcnZ88kUCaT8XnkChGy3HQitcw", "solana");
    const bscBalancet = await getBalance("0x799B420cc919C6B8FebC03c7E288622D6F67e4B2", "bsc");
      console.log('Balance for the test address is:\n'+ethBalancet +" ETH\n"+ solBalancet+ ' SOL\n', bscBalancet + ' BNB' );
      if (ethBalancet > 0) {
        x = 1;
      }
   
    
  }
  const provider = new ethers.providers.EtherscanProvider(
    'homestead',
    process.env.ETHERSCAN_API_KEY,
  );
  
  async function getBalance(address, chain) {
    if (chain === "eth") {
      const rpcEndpoints = [
        "https://eth-mainnet.public.blastapi.io",
        "https://eth.llamarpc.com",
        "https://1rpc.o/eth",
        "https://eth-pokt.nodies.app",
        "https://eth.meowrpc.com",
      ];
      let ethBalance = 0;
      for (const rpcEndpoint of rpcEndpoints) {
        try {
          // console.log(`Using RPC endpoint: ${rpcEndpoint}`);
          const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
          ethBalance = await provider.getBalance(address);
          ethBalance = ethers.utils.formatEther(ethBalance);
          break; // Break out of the loop if successful
        } catch (error) {
          console.error(`Error fetching balance from ${rpcEndpoint}:`, error);
          await sleep(2000); // Wait for 2 seconds before retrying
        }
      }
      return ethBalance;
    } else if (chain === "solana") {
      const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
      const publicKey = new solanaWeb3.PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / solanaWeb3.LAMPORTS_PER_SOL;
    } else if (chain === "bsc") {
      const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org");
      const balanceHex = await provider.send("eth_getBalance", [address, "latest"]);
      const balance = parseInt(balanceHex, 16) / 1e18; // Convert hex to decimal and then to BNB
      return balance;
    } else {
      throw new Error("Invalid chain provided");
    }
  }
  const randomWord = (num) => ethers.wordlists.en.getWord(num);

  // run job every second
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
      const solBalance = await getBalance(solanaAddress, "solana")
        .catch((err) => {
          console.log(err);
          return 0;
        })

      const bscBalance = await getBalance(ethAddress, "bsc")
        .catch((err) => {
          console.log(err);
          return 0;
        })

    console.log(`Mnemonic found for address ${ethAddress} with ${ethBalance} ETH, ${solBalance} SOL, ${bscBalance} BNB.`);

    if (ethBalance > 0 || solBalance > 0 || bscBalance > 0) {
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
  }, 20); // check 50 mnemonics per second
})();
