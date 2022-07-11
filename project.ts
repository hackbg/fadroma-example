import * as Fadroma from '@hackbg/fadroma'
import * as API     from '@example/api'

const plugins = [
  Fadroma.enableBuilding,
  function setBuildOutputDir ({ builder }) { builder.outputDirName = 'dist' },
  Fadroma.getChain,
  Fadroma.getAgent,
  Fadroma.enableUploading,
]

const contracts = [
  'fadroma-example-echo',
  'fadroma-example-kv'
]

export default new Fadroma.Commands('ops', plugins)

  .command('build',  'compile contracts',
    function build ({ buildMany }) {
      return { artifacts: buildMany(contracts) }
    })

  .command('reset',  'reset the devnet',
    Fadroma.resetDevnet)

  .command('deploy', 'build and deploy contracts',
    Fadroma.createDeployment,
    async function deploy ({ buildAndUploadMany, deploy, getClient }) {
      const [template1, template2] = await buildAndUploadMany(contracts)
      await deploy('Echo', template1, API.Echo.init(false))
      await deploy('KV',   template2, API.KV.init("initial"))
      return {
        echo: getClient('Echo', API.Echo),
        kv:   getClient('KV',   API.KV)
      }
    })

  .command('status', 'query status of contracts',
    Fadroma.getDeployment,
    Fadroma.showDeployment,
    async function printStatus ({
      getClient,
      kv = getClient('KV', API.KV)
    }) {
      console.log(await kv.get())
    })

  .command('configure', 'configure contracts',
    Fadroma.getDeployment,
    async function configure ({ getClient }) {})

  .entrypoint(import.meta.url)
