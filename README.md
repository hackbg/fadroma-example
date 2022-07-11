# Example Fadroma Project

To illustrate the deployment layer, this project makes use of two example Fadroma contracts
from the submodule:

* Echo
* KV

You can add your own contract crates, define their TypeScript APIs, and script their operation here.

## Development quickstart

```sh
git clone https://github.com/hackbg/fadroma-example
cd fadroma-example
git submodule update --init --recursive
pnpm i
FADROMA_CHAIN=ScrtDevnet pnpm run fadroma deploy
```

## Adding a contract

* Add contract crate to workspace `Cargo.toml`:

```toml
# Crates in workspace
[workspace]
members = [
  # ...
  "contracts/example"
]
```

* Add dependencies in `contracts/example/Cargo.toml`:

```toml
[package]
name    = "example"
version = "0.1.0"
[lib]
path       = "example.rs"
crate-type = ["cdylib", "rlib"]
[dependencies]
fadroma = { path = "../../fadroma/crates/fadroma", features = [
  # add fadroma features flags here
] }
```

* Add contract code in `contracts/example/example.rs`:

```rust
use fadroma::prelude::*;
#[message] pub struct InitMsg { /**/ }
#[message] pub enum HandleMsg { /**/ }
#[message] pub enum QueryMsg  { /**/ }
pub fn init   /*...*/ () {}
pub fn handle /*...*/ () {}
pub fn query  /*...*/ () {}
fadroma::entrypoint!(fadroma, init, handle, query);
```

* Add client in `api/api.ts`:

```typescript
import { Client } from '@hackbg/fadroma'
export class Example extends Client {
  static init = (amount, unit) => {
    validate(amount)
    return { config: [amount, unit ] }
  }
  getSomething () {
    return this.query(...)
  }
  setSomething () {
    return this.exec(...)
  }
}
```

* Add deploy procedure in `index.ts`:

```typescript
import * as Fadroma from '@hackbg/fadroma'
import * as API     from '@example/api'
export default new Fadroma.Commands('name', plugins)
  .command('deploy-example', 'commands must have descriptions',
    function deployExample ({ buildAndUpload, deploy, getClient }) {
      const template = await buildAndUpload("example")
      const initMsg  = API.Example.init(4, "biri")
      const instance = await deploy("Example", template, initMsg)
      return { client: getClient("Example", API.Example) }
    })
  .entrypoint(import.meta.url)
```
