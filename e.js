const fs = require('fs')
const tesseract = require('tesseract.js')
const screenshot = require('screenshot-desktop')
const spelling = require('spelling')
const dictionary = require('spelling/dictionaries/en_US.js')

const dict = new spelling(dictionary)
let logFile = './assets/log.json'
let img = 'https://tesseract.projectnaptha.com/img/eng_bw.png'
let lang = 'eng'

let boolSpellCheck = false

let logFlags = () => {
    console.log('')
    console.log('set image input using flags')
    console.log('')
    console.log('"grab" - takes a screenshot and logs the output')
    console.log('"file:path/to/file.png" - accepts local file or url jpg/png')
    console.log('"spell_check" - logs possible spelling errors')
}

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
    if(boolSpellCheck == true){
        spellCheck(text)
    }else{
        console.log('\n')
        console.log(text)
    }
}

let imgRead = (input) => {
    fs.writeFileSync(logFile, '')
    tesseract.recognize(
        input,
        lang,
        { logger: msg => writeToLog(msg) }
        ).then(({ data: { text } }) => {
            txtProcess(text)
        })
}


let spellCheck = (text) => {
    console.log('\n')
    text = text.replace(/[^\w\s]/g, ' ') // removes punctuation
    let wordArr = text.split('\n').join(' ').split(' ') // removes new line notation
    wordArr.forEach((word, index) => {
        let wordCheck = dict.lookup(word)
        if(wordCheck.found == false){
            console.log('possible spelling error: ' + wordCheck.word + ` [${index + 1}]`)
        }
    })
    console.log('\n\n' + text)
}

let screenGrab = () => {
    screenshot({format: 'png'}).then((img) => {
        fs.writeFileSync('./assets/screenshot.png', img)
        imgRead('./assets/screenshot.png')
    }).catch((err) => {
        console.log(err)
    })
}

let flagCheck = () => {
    let flagArr = process.argv
    flagArr.splice(0, 2)
    flagArr.forEach((arg, index) => {
        switch(arg) {
            case 'spell_check':
              boolSpellCheck = true
              break;
            case '-info':
              logFlags()
              break;
            case 'grab':
                screenGrab()
              break;
            default:
                if(arg.split(':')[0] == 'file'){
                    let fileLocation = arg.replace('file:', '')
                    imgRead(fileLocation)
                }else{
                    console.log(`"${arg}" is not a recognized flag`)
                }
          }
    })
    if(flagArr.length == 0){
        console.log()
        console.log('"node e -info" to show list of flags')
    }
}

flagCheck()