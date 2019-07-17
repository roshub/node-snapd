'use strict'

const Snap = require('../src/index.js')

async function main(){

  let snap = new Snap()

  await snap.readAuth()
    .then(res => console.log('snap.readAuth() ->', res))
    .catch(error => console.log('fail! snap.readAuth() ->', error))

  await snap.listSnaps()
    .then(res => console.log('snap.listSnaps() ->', res))
    .catch(error => console.log('fail! snap.listSnaps() ->', error))

  await snap.info({name:'core'})
    .then(res => console.log('snap.info(\'core\') ->', res))
    .catch(error => console.log('fail! snap.info(\'core\') ->', error))

  await snap.listInterfaces()
    .then(res => console.log('snap.listInterfaces() ->', res))
    .catch(error => console.log('fail! snap.listInterfaces() ->', error))

  await snap.install({name: 'vectr'})
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

  try{
    const spotifyId = await snap.install({name: 'spotify'})
    console.log('snap.install(\'spotify\') ->', spotifyId)
  }
  catch(err){
    if(err.code != 'snap-already-installed'){
      throw err
    }
  }
  

  await snap.disconnect(
    {slot: { snap: 'core', slot: 'network' },
    plug: { snap: 'spotify', plug: 'network' }})
    .then(did => console.log('snap.disconnect() ->', did))
    .catch(error => console.log('fail! snap.disconnect() ->', error))


}

main().then().catch(err=>{
  console.log('main error', err)
})