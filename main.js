//block&chain

const sha256 = require('crypto-js/sha256')
const ecLib = require('elliptic').ec
//curve name
const ec = new ecLib('secp256k1')


//block中
//data
//之前区块的哈希值
//自己区块的哈希值 hash(data + 之前区块的哈希值)

class Block{
    constructor(transactions, previousHash) {

        //一开始测试的时候 data是string
        //data实际是transaction 即 array of objects 对象的数组
        this.transactions = transactions
        this.previousHash = previousHash
        //随机数
        this.nonce = 1
        this.hash = this.computeHash()
        //记录下打包的时间戳
        this.timestamp = Date.now()
    }
    computeHash(){
        //data需要stringify 把对象转成JSON
        //JSON.stringify
        //如果需要把JSON转回对象 可以JSON.parse()
        return sha256(JSON.stringify(this.transactions) +
            this.previousHash +
            this.nonce +
            this.timestamp).toString()
    }


    // 得到n个0组成的字符串
    getAnswer(difficulty){

        let answer = ''
        for(let i = 0; i<difficulty;i++){
            answer+='0'
        }
        return answer

    }


    // 计算符合区块链难度要求的hash
    mine(difficulty){
        //先验证一下签名再挖
        this.validateBlockTransactions()
        while (true){
            this.hash = this.computeHash()
            if(this.hash.substring(0,difficulty)!==this.getAnswer(difficulty)){
                //改变nonce值
                //通过改变nonce值 hash值会更着变化 知道变化成前n位都是0的形式
                this.nonce++
                this.hash = this.computeHash()
            }else {
                break
            }
        }
        console.log('挖矿结束')
        // console.log('挖矿结束',this.hash)
    }

    //验证签名是否符合
    validateBlockTransactions(){
        for(let transaction of this.transactions){
            if(!transaction.isValid()){
                console.log('invalid transaction found in transactions')
                return false
            }
        }
        return true
    }
}



// const block = new Block('转账十元','123')
// console.log(block)



//Chain中
//
class Chain {
    constructor() {
        this.chain = [this.bigBang()]
        //交易池
        this.transactionPool = []
        //挖矿奖励
        this.minerReward = 50
        this.difficulty = 4
    }

    //生成祖先区块
    bigBang(){
        const genesisBlock = new Block('我是祖先','')
        return genesisBlock
    }

    getLatestBlock(){
        //返回最新的block
        return this.chain[this.chain.length-1]
    }


    //添加transaction到transactionPool里面
    addTransaction(transaction){
        if(transaction.isValid()){
            this.transactionPool.push(transaction)
            console.log('valid transaction')
        }else {
            throw Error('invalid transaction')
        }

    }


    // 添加区块到区块链上
    addBlockToChain(newBlock){
        // 找到最近一个block的hash
        // 这个hash就是新区块的previousHash
        newBlock.previousHash = this.getLatestBlock().hash
        newBlock.mine(this.difficulty)
        newBlock.hash = newBlock.computeHash()
        // 满足这个hash 需要满足一个区块链设置的条件
        // push 是往[]中加东西
        this.chain.push(newBlock)
    }

    mineTransactionPool(minerRewardAddress){
        // 发送矿工奖励 即 空地址 发到 minerRewardAddress地址 中
        const minerRewardTransaction = new Transaction('',minerRewardAddress, this.minerReward)
        this.transactionPool.push(minerRewardTransaction)

        // 挖矿
        // 先新建一个块（传入交易数据和上一个块的hash值）
        const newBlock = new Block(this.transactionPool, this.getLatestBlock().hash)
        // 开始挖这个块
        newBlock.mine(this.difficulty)

        // 添加区块到区块链
        // 清空transaction
        this.chain.push(newBlock)
        this.transactionPool = []

    }



    // 验证当前的区块链是否合法
    // 当前的数据有没有被篡改
    // 我们要验证区块的previousHash是否等于previous区块的hash
    validateChain(){
        //验证第一个区块中的hash值是否等于计算出的hash值
        if(this.chain.length==1){

            if (this.chain[0].hash!==this.chain[0].computeHash()){
                return false
            }else {
                return true
            }

        }

        //this.chain[1]是第二个区块
        //我们从第二个区块开始验证,验证到最后一个区块
        for(let i = 1; i <= this.chain.length-1; i++){


            const blockToValidate = this.chain[i]
            //验证第i个区块中的所有交易的签名是否有效
            if (!blockToValidate.validateBlockTransactions()){
                console.log('发现非法交易 签名出错')
                return false
            }
            //验证第i个区块中的hash值是否等于计算出的hash值
            if(blockToValidate.hash!==blockToValidate.computeHash()){
                console.log('数据被篡改')
                return false
            }

            // 我们要验证区块的previousHash是否等于previous区块的hash
            const previousBlock = this.chain[i-1]
            if(blockToValidate.previousHash!==previousBlock.hash){
                console.log('前后区块链的链接 断裂了')
                return false
            }
        }
        return true
    }

}





class Transaction {
    constructor(from, to, amount) {
        //从哪来到哪去 数量是多少
        this.from = from
        this.to = to
        this.amount = amount
        // //时间戳 实际上交易的时间戳是打包成块的时间
        // this.timestamp = timestamp

    }

    //计算交易hash
    computeHash(){
        return sha256(this.from+this.to+this.amount).toString()
    }


    //用私钥签名 把整租keyPair传入
    sign(key){
        this.signature = key.sign(this.computeHash(), 'base64').toDER('hex')
    }

    isValid(){
        if(this.from == ""){
            return true
        }
        const keyObject = ec.keyFromPublic(this.from, 'hex')
        return keyObject.verify(this.computeHash(), this.signature)
    }


}

// //新建一个链
// const h8chain = new Chain()
// console.log(h8chain)


// //往链里加一个块 block1
// const block1 = new Block('A给B转账20元','')
// h8chain.addBlockToChain(block1)
// console.log(h8chain)
//
// //再往链里加一个块 block2
// const block2 = new Block('B给A转账50元','')
// h8chain.addBlockToChain(block2)
// console.log(h8chain)
//
// //验证区块链是否被篡改
// console.log(h8chain.validateChain())
//
// //尝试篡改区块链的data后进行验证
// h8chain.chain[1].data = 'A给B转账1元'
// console.log(h8chain)
// console.log(h8chain.validateChain())
//
//尝试篡改区块链的data和hash后进行验证 即改变data和根据difficulty产生（挖出）hash值 每次篡改需要的时间和挖一次块的事件一样长
// h8chain.chain[1].data = 'A给B转账1元'
// //要手动输入difficulty
// h8chain.chain[1].mine(4)
// console.log(h8chain)
// console.log(h8chain.validateChain())







//新建两组key
const keyPair1 = ec.genKeyPair()
const privateKey1 = keyPair1.getPrivate('hex')
const publicKey1 = keyPair1.getPublic('hex')
const keyPair2 = ec.genKeyPair()
const privateKey2 = keyPair2.getPrivate('hex')
const publicKey2 = keyPair2.getPublic('hex')






//新建一个链
const h8Coin = new Chain()
//新建1笔交易 是addr1和addr2之间的交易
const t1 = new Transaction(publicKey1, publicKey2, 10)
//签名的时候 传入整个keyPair
t1.sign(keyPair1)
// //尝试进行篡改 看是否抛出异常
// t1.amount = 20
console.log(t1)
//验证是否是本人签署 任何人都可以验证
console.log(t1.isValid())
//新建第二笔交易
const t2 = new Transaction(publicKey2, publicKey1, 5)
t2.sign(keyPair2)
console.log(t1.isValid())

h8Coin.addTransaction(t1)
h8Coin.addTransaction(t2)

console.log(h8Coin)

//addr2来挖矿 即把t1 t2放到链上
h8Coin.mineTransactionPool(publicKey2)

//展示区块链
console.log(h8Coin)
//展示挖出来的块中的 交易数据   包括矿工的受益也在里面
console.log(h8Coin.chain[1].transactions)



