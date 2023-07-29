const fs = require('fs')
const tesseract = require('tesseract.js')
const spelling = require('spelling')
const dictionary = require('spelling/dictionaries/en_US.js')

const dict = new spelling(dictionary)
let logFile = './log.json'
let img = 'https://tesseract.projectnaptha.com/img/eng_bw.png'
let lang = 'eng'

let writeToLog = (msg) => {
    if(msg.status == 'loading tesseract core' && msg.progress == 0){
        fs.appendFileSync(logFile,  '[' + JSON.stringify(msg) + ',')
    }else if(msg.status == 'recognizing text' && msg.progress == 1){
        fs.appendFileSync(logFile,  JSON.stringify(msg) + ']')
    }else{
        fs.appendFileSync(logFile, JSON.stringify(msg) + ',')
    }
}

let txtProcess = (text) => {
    console.log('\n')
    console.log(text)
    if(process.argv[2] == 'spell_check'){
        spellCheck(text)
    }
}

let imgRead = () => {
    fs.writeFileSync(logFile, '')
    tesseract.recognize(
        img,
        lang,
        { logger: msg => writeToLog(msg) }
        ).then(({ data: { text } }) => {
            txtProcess(text)
        })
}

// console.log(dict.lookup('penis'))

let spellCheck = (text) => {
    console.log(text)
}

imgRead()