'use strict'

const http = require('http')
const path = require('path')
const fs = require('fs')
const os = require('os')

// make restful call to snapd process thru /run/snapd.socket
const rest = ({auth, method, path, data}) => {
  return new Promise((resolve, reject) => {
    const post = method === 'POST'
    const headers = { 'Content-Type': 'application/json' }
    if (post) {
      headers['Content-Length'] = Buffer.byteLength(data)
    }
    if (auth && typeof auth.macaroon === 'string') {
      headers['Authorization'] = `Macaroon root="${auth.macaroon}"`
    }

    const options = {
      socketPath: '/run/snapd.socket',
      path: path,
      method: post ? 'POST' : 'GET',
      headers: headers
    }

    const req = http.request(options, (res) => {
      res.setEncoding('utf8')

      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
          if (body.length < 1) {
            return reject(new Error('empty response'))
          }
          const json = JSON.parse(body)
          return resolve(json)
        }

        return reject(new Error(`response status: ${res.statusCode}`))
      })
    })

    req.on('error', (error) => {
      return reject(error)
    })

    // write data to request body
    if (post && typeof data === 'string') {
      req.write(data)
    }
    req.end()
  })
}

// read auth email & macaroon from ~/.snap/auth.json
exports.readAuth = (filename) => {
  return new Promise((resolve, reject) => {
    const fn = filename || path.join(os.homedir(), '.snap', 'auth.json')
    fs.readFile(fn, (error, data) => {
      if (error) {
        return reject(error)
      }

      const auth = JSON.parse(data)

      if (typeof auth.macaroon !== 'string') {
        return reject(new Error('failed to read macaroon from auth file'))
      }

      return resolve({ email: auth.email, macaroon: auth.macaroon })
    })
  })
}

// return list of installed snaps
exports.listSnaps = async () => {
  const response = await rest({
    method: 'GET',
    path: '/v2/snaps'
  })

  if (response && response['status-code'] === 200) {
    return response.result.map(entry => entry.name)
  }

  return Promise.reject(new Error('malformed response'))
}

exports.info = async (name) => {

  if (typeof name !== 'string') {
    return Promise.reject(new Error('malformed name argument'))
  }

  const response = await rest({
    method: 'GET',
    path: `/v2/snaps/${name}`
  })

  if (response && response['status-code'] === 200) {
    return response.result
  }

  return Promise.reject(new Error('malformed response'))
}

const modify = async (action, name, opts, auth) => {

  if (typeof name !== 'string') {
    return Promise.reject(new Error('malformed name argument'))
  }

  const data = { action: action }
  if (opts) {
    for (const b of ['classic', 'devmode', 'ignore-validation', 'jailmode']) {
      if (opts[b]) {
        data[b] = true
      }
    }
    for (const str of ['channel', 'version']) {
      if (typeof opts[str] === 'string') {
        data[str] = opts[str]
      }
    }
  }

  const response = await rest({
    auth: auth || await exports.readAuth(),
    method: 'POST',
    path: `/v2/snaps/${name}`,
    data: JSON.stringify(data)
  })

  if (response && response['status-code'] === 202) {
    return response.change
  }

  return Promise.reject(new Error('malformed response'))
}

exports.install = async (name, opts, auth) => {
  return modify('install', name, opts, auth)
}

exports.refresh = async (name, opts, auth) => {
  return modify('refresh', name, opts, auth)
}

exports.remove = async (name, opts, auth) => {
  return modify('remove', name, opts, auth)
}

exports.revert = async (name, opts, auth) => {
  return modify('revert', name, opts, auth)
}

exports.enable = async (name, opts, auth) => {
  return modify('enable', name, opts, auth)
}

exports.disable = async (name, opts, auth) => {
  return modify('disable', name, opts, auth)
}

// check on status of change by id (or all changes without id arg)
exports.status = async (id) => {
  const response = await rest({
    method: 'GET',
    path: id ? `/v2/changes/${id}` : '/v2/changes'
  })

  if (response && response['status-code'] === 200) {
    return response.result
  }

  return Promise.reject(new Error('malformed response'))
}

// abort ongoing change by id
exports.abort = async (id, auth) => {

  if (typeof id !== 'string') {
    return Promise.reject(new Error('malformed id argument'))
  }

  const response = await rest({
    auth: auth || await exports.readAuth(),
    method: 'POST',
    path: `/v2/changes/${id}`,
    data: JSON.stringify({ action: 'abort' })
  })

  if (response && response['status-code'] === 200) {
    return response.result
  }

  return Promise.reject(new Error('malformed response'))
}

exports.listInterfaces = async () => {
  const response = await rest({
    method: 'GET',
    path: '/v2/interfaces'
  })

  if (response && response['status-code'] === 200) {
    return response.result
  }

  return Promise.reject(new Error('malformed response'))
}

const modifyInterface = async (action, slot, plug, auth) => {

  const data = {
    action: action,
    slots: [{ snap: slot.snap, slot: slot.slot }],
    plugs: [{ snap: plug.snap, plug: plug.plug }]
  }

  const response = await rest({
    auth: auth || await exports.readAuth(),
    method: 'POST',
    path: '/v2/interfaces',
    data: JSON.stringify(data)
  })

  if (response && response['status-code'] === 202) {
    return response.change
  }

  return Promise.reject(new Error('malformed response'))
}

exports.connect = async (slot, plug, auth) => {
  return modifyInterface('connect', slot, plug, auth)
}

exports.disconnect = async (slot, plug, auth) => {
  return modifyInterface('disconnect', slot, plug, auth)
}
