import * as Fadroma from '@hackbg/fadroma'
import * as API     from '@example/api'

const plugins = [
  Fadroma.enableBuilding,
  function setBuildOutputDir ({ builder }) { builder.outputDirName = 'dist' },
  Fadroma.getChain,
  Fadroma.getAgent,
  Fadroma.enableUploading,
]

export const exampleContracts = [ 'fadroma-example-echo', 'fadroma-example-kv' ]
export const schemaContract   = [ 'schema-contract' ]

export default new Fadroma.Commands('fadroma', plugins)

  .command('build',  'compile contracts',
    function build ({ buildMany }) {
      return { artifacts: buildMany(exampleContracts) }
    })

  .command('reset',  'reset the devnet',
    Fadroma.resetDevnet)

  .command('deploy', 'build and deploy contracts',
    Fadroma.createDeployment,
    async function deploy ({ buildAndUploadMany, deploy, getClient }) {
      const [template1, template2] = await buildAndUploadMany(exampleContracts)
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
    async function configure ({ getClient }) {
    })

  .command('deploy-schema-contract', 'deploy contract that reports its own schema',
    Fadroma.getDeployment,
    async function deploySchemaContract ({ buildAndUpload, deploy, getClient, suffix }) {
      const name = `Schema+${suffix}`
      await deploy(name, await buildAndUpload('schema-contract'), {})
      const client = getClient(name, API.Schema)
      const schema = await getClient.getOwnSchema()
      console.log({schema})
    })

  .entrypoint(import.meta.url)
