const ecLib = require('elliptic').ec
//curve name
const ec = new ecLib('secp256k1')
const sha256 = require('crypto-js/sha256')

//生成我们的密码对
const key = ec.genKeyPair()

//拿到我们的私钥和公钥 希望拿到hex string格式的
console.log('private:',key.getPrivate('hex'))
console.log('public:',key.getPublic('hex'))

//需要加密的内容 先hash 再签名
const doc = "A给了B 10元"
const hashedDoc = sha256(doc).toString()
const hexSignature = key.sign(hashedDoc, 'base64').toDER('hex')

console.log('hashed doc', hashedDoc)
console.log('hexSignature', hexSignature)


//收到签名的一方 先获得publicKey 通过publicKey验证签名是否合法
const publicKey = ec.keyFromPublic(key.getPublic('hex'),'hex')
// console.log(publicKey)
console.log(publicKey.verify(hashedDoc, hexSignature))

//tamper 篡改
const tamperedDoc = 'A给了B 1元'
const hashedTamperedDoc = sha256(tamperedDoc).toString()
console.log('Tampered hashed doc:', hashedTamperedDoc)
console.log(publicKey.verify(hashedTamperedDoc, hexSignature))


