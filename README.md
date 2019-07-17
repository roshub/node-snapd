# node-snapd
*nodejs client interface to ubuntu [core snapd rest api](https://github.com/snapcore/snapd/wiki/REST-API)*

<img src=https://img.shields.io/npm/v/node-snapd.svg>

With node-snapd, you can now easily introspect the Snapd host and the installed Snap packages. 

[API Documentation](https://roshub.github.io/node-snapd/index.html)

```
const Snapd = require('node-snapd')

let snapd = new Snapd()

const snapList = await snapd.listSnaps()
console.log(snapList)

const coreInfo = await snapd.info({name: 'core'})
console.log(coreInfo)

```

When run with elevated permissions you can also install and configure applications in the system.


```
const vectrId = await snapd.install({name: 'vectr'})

```

## Defaults

 * SnapClient.authFile: `$HOME/.snap/auth.json`
 * SnapClient.socketPath: `/run/snapd.socket`

# Developing

To develop you will need to install

 * nodejs
 * yarn
 * snapd

To interactively develop run:

```
yarn
yarn watch
```
## Tests

To run tests:

`yarn test`


# Further Reading

* [Annoucement Blog Post](https://medium.com/roshub/introducing-node-snapd-2199c80c6bed)
* [NPM Page](https://www.npmjs.com/package/node-snapd)
* [Snapd REST API](https://github.com/snapcore/snapd/wiki/REST-API)


# Credits

[<img src=https://github.com/roshub/vapor_master/raw/master/icons/roshub_logo_cropped_large.png width=300>](https://roshub.io)

node-snapd is open source software developed by [RosHub Inc.](https://roshub.io)

 * Philetus Weller
 * Alan Meekins
