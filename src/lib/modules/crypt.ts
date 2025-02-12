import { arr2hex, arr2text, bin2hex, hex2arr, hex2bin, text2arr } from 'uint8-util'

// could use a simple XOR encryption/decryption but meh, some1 could easily brute force it
const key = new Uint8Array([104, 97, 121, 97, 115, 101, 45, 111, 118, 101, 114, 45, 97, 108, 108, 45, 251, 249, 0, 204, 242, 221, 119, 44, 147, 27, 83, 227, 225, 179, 149, 80, 70, 163, 58, 97, 201, 1, 10, 33, 78, 172, 195, 239, 171, 119, 51, 199, 127, 248, 221, 31, 90, 114, 200, 255, 252, 158, 158, 57, 245, 153, 44, 126, 130, 232, 230, 192, 0, 223, 204, 137, 211, 115, 33, 42, 68, 227, 65, 161, 17, 116, 138, 195, 51, 51, 181, 183, 124, 119, 161, 74, 202, 21, 182, 195, 134, 198, 191, 182, 223, 205, 60, 175, 207, 223, 232, 94, 133, 70, 10, 127, 100, 170, 109, 22])

const derived = (async () => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    key,
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: key,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  )
})()

export async function encryptMessage (message: string) {
  return hex2bin(arr2hex(new Uint8Array(await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: key
    },
    await derived,
    text2arr(message)
  ))))
}

export async function decryptMessage (encryptedMessage: string) {
  return arr2text(await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: key
    },
    await derived,
    hex2arr(bin2hex(encryptedMessage))
  ))
}
