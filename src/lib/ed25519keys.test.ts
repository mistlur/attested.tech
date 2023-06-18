import '@testing-library/jest-dom'
import { EmbeddedType } from '@/types/dids'
import { ec as EC, eddsa as EdDSA } from "elliptic";
// import * as b58 from 'multiformats/bases/base58'
// import * as b64 from 'multiformats/bases/base64'

describe('ED25519', () => {
  it('Import key', () => {
    // const material: EmbeddedType = {
    //   curve: 'Ed25519',
    //   format: 'Multibase',
    //   usage: {
    //     'keyAgreement': 'Embedded'
    //   },
    //   keyMaterial: new Uint8Array([0x2e, 0x6f, 0xcc, 0xe3, 0x67, 0x01, 0xdc, 0x79, 0x14, 0x88, 0xe0, 0xd0, 0xb1, 0x74, 0x5c, 0xc1, 0xe3, 0x3a, 0x4c, 0x1c, 0x9f, 0xcc, 0x41, 0xc6, 0x3b, 0xd3, 0x43, 0xdb, 0xbe, 0x09, 0x70, 0xe6])
    // }
    const ec1 = EC("ed25519");
    const keypair1 = ec1.genKeyPair();

    const material: EmbeddedType = {
      curve: 'Ed25519',
      format: 'Multibase',
      usage: {
        'keyAgreement': 'Embedded'
      },
      keyMaterial: new Uint8Array(keypair1.getPublic().getX().toArray())
    }
    console.log(keypair1.getPublic())

    let codec
    let ec
    if (material.curve === 'P-256') {
      codec = [0x80, 0x24];
      ec = new EC("p256");
    } else if (material.curve === 'Ed25519') {
      codec = [0xED, 0x01];
      ec = new EdDSA("ed25519");
    } else throw Error(`Unknown curve: Unable to encode key ${material} into multibase`)
    const keypair = ec.keyFromPublic(material.keyMaterial)
    const keyMaterialCompactForm = keypair.getPublic(true, "array");
    console.log(keyMaterialCompactForm)

    // const knownPublicKey = '2e6fcce36701dc791488e0d0b1745cc1e33a4c1c9fcc41c63bd343dbbe0970e6'
    // const expectedB58 = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'


    // expect(encoded).toBe(expectedB58)
  })
})

