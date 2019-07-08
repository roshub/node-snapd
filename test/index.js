'use strict'

const snap = require('../src/index.js')

snap.readAuth()
  .then(res => console.log('snap.readAuth() ->', res))
  .catch(error => console.log('fail! snap.readAuth() ->', error))

snap.listSnaps()
  .then(res => console.log('snap.listSnaps() ->', res))
  .catch(error => console.log('fail! snap.listSnaps() ->', error))

snap.info({name:'core'})
  .then(res => console.log('snap.info(\'core\') ->', res))
  .catch(error => console.log('fail! snap.info(\'core\') ->', error))

snap.listInterfaces()
  .then(res => console.log('snap.listInterfaces() ->', res))
  .catch(error => console.log('fail! snap.listInterfaces() ->', error))

snap.install({name: 'vectr'})
  .then(id => {
    console.log('snap.install(\'vectr\') ->', id)

    snap.status({id})
      .then(res => {
        console.log('snap.status() ->', res)

        snap.abort({id})
          .then(resres => console.log('snap.abort() ->', resres))
          .catch(error => console.log('fail! snap.abort() ->', error))
      })
      .catch(error => console.log('fail! snap.status() ->', error))
  })
  .catch(error => console.log('fail! snap.install(\'vectr\') ->', error))

snap.disconnect(
  {snap: { snap: 'core', slot: 'network' },
   plug: { snap: 'spotify', plug: 'network' }})
  .then(did => console.log('snap.disconnect() ->', did))
  .catch(error => console.log('fail! snap.disconnect() ->', error))
