import * as CSS from './index.css'
import * as API from '@example/api'
import { Scrt, ChainMode } from '@fadroma/client-scrt-grpc'
import * as YAML from 'js-yaml'
import echoTemplate      from './receipts/fadroma-devnet/uploads/fadroma-example-echo@HEAD.wasm.json'
import kvTemplate        from './receipts/fadroma-devnet/uploads/fadroma-example-kv@HEAD.wasm.json'
import activeDeployment  from './receipts/fadroma-devnet/deployments/.active.yml?raw'
import ADMIN             from './receipts/fadroma-devnet/identities/ADMIN.json'
import { Bech32Address } from "@keplr-wallet/cosmos"

window.onload = main

async function main () {

  const chainId     = 'fadroma-devnet'
  const rpc         = `http://${location.host}/rpc`
  const rest        = `http://${location.host}/rest`

  const keplrStatus = document.getElementById('keplr-status')
  const echoStatus  = document.getElementById('echo-status')
  const echoQEcho   = document.getElementById('echo-query-echo')
  const echoQFail   = document.getElementById('echo-query-fail')
  const echoTXEcho  = document.getElementById('echo-tx-echo')
  const echoTXFail  = document.getElementById('echo-tx-fail')
  const kvStatus    = document.getElementById('kv-status')
  const kvGet       = document.getElementById('kv-get')
  const kvVal       = document.getElementById('kv-val')
  const kvSet       = document.getElementById('kv-set')
  const kvIn        = document.getElementById('kv-in') as HTMLInputElement
  const kvDel       = document.getElementById('kv-del')

  echoStatus.innerText += `${Object.entries(echoTemplate).map(([k,v])=>`${k.padEnd(8)} = ${v}`).join('\n')}`
  kvStatus.innerText   += `${Object.entries(kvTemplate).map(([k,v])=>`${k.padEnd(8)} = ${v}`).join('\n')}`

  const chain = new Scrt(chainId, { url: rpc, mode: ChainMode.Devnet })
  let agent

  const useKeplr = false
  if (useKeplr) {
    if (!window.keplr) {
      keplrStatus.innerText = 'Keplr not found.'
    } else {
      try {
        const SCRT = {
          coinDenom:        "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals:     6,
          coinGeckoId:      "scrt"
        }
        await window.keplr.experimentalSuggestChain({
          chainName: 'Scrt (Fadroma Devnet)', chainId, rpc, rest, 
          stakeCurrency: SCRT,
          bip44:         { coinType: 529 },
          bech32Config:  Bech32Address.defaultBech32Config("secret"),
          currencies:    [SCRT],
          feeCurrencies: [SCRT],
          features:      ['secretwasm']
        })
        keplrStatus.innerText += ' Chain added.'
      } catch (e) {
        document.body.innerText = 'Rejected request to add chain to Keplr. Refresh to retry. ' +
          'Error message:' + e.message
      }
      await window.keplr.enable(chainId)
      keplrStatus.innerText += ' Keplr connected.'
      const wallet   = window.getOfflineSignerOnlyAmino(chainId)
      const accounts = await wallet.getAccounts()
      const address  = accounts[0].address
      agent = await chain.getAgent({ wallet: Object.assign(wallet, { address }) })
    }
  } else {
    agent = await chain.getAgent({ mnemonic: ADMIN.mnemonic })
  }

  const [echoInstance, kvInstance] = YAML.loadAll(activeDeployment)
  const echo     = agent.getClient(API.Echo, echoInstance)
  const kv       = agent.getClient(API.KV,   kvInstance)

  echoStatus.innerText += `\n---\n${Object.entries(echoInstance).map(([k,v])=>`${k.padEnd(8)} = ${v}`).join('\n')}`
  kvStatus.innerText   += `\n---\n${Object.entries(kvInstance).map(([k,v])=>`${k.padEnd(8)} = ${v}`).join('\n')}`

  echoQEcho.onclick  = () => echo.queryEcho()
    .then(console.log)
    .catch(console.error)
  echoQFail.onclick  = () => echo.queryFail()
    .then(console.log)
    .catch(console.error)
  echoTXEcho.onclick = () => echo.txEcho()
    .then(console.log)
    .catch(console.error)
  echoTXFail.onclick = () => echo.txFail()
    .then(console.log)
    .catch(console.error)

  kvGet.onclick = () => kv.get()
    .then((value: string)=>{ kvIn.value = value })
    .catch(console.error)
  kvSet.onclick = () => kv.set(kvIn.value)
    .then(console.log)
    .catch(console.error)
  kvDel.onclick = () =>
    kv.del().then(console.log).catch(console.error)

}
