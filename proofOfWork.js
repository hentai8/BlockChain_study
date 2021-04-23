const sha256 = require('crypto-js/sha256');


// console.log(sha256('hentai8').toString());
// console.log(sha256('hentai9').toString());

//需要得到一个开头值为0的哈希值 求x是多少
function proofOfWork_1() {
    let data = 'hentai';
    let x = 1;
    while (true){
        if(sha256(data + x).toString()[0]!=='0'){
            x = x + 1;
        }
        else {
            console.log(sha256(data + x).toString());
            console.log(x);
            break;
        }

    }
}

//需要得到一个开头值为0000的哈希值 求x是多少
function proofOfWork_4() {
    let data = 'hentai';
    let x = 1;
    while (true){
        if(sha256(data + x).toString().substring(0,4)!=='0000'){
            x = x + 1;
        }
        else {
            console.log(sha256(data + x).toString());
            console.log(x);
            break;
        }

    }
}


//需要得到一个开头值为0000000的哈希值 求x是多少
function proofOfWork_5() {
    let data = 'hentai';
    let x = 1;
    while (true){
        if(sha256(data + x).toString().substring(0,5)!=='00000'){
            x = x + 1;
        }
        else {
            console.log(sha256(data + x).toString());
            console.log(x);
            break;
        }

    }
}



proofOfWork_1()
proofOfWork_4()
proofOfWork_5()