const fs = require('fs')
const http = require('http')
// Install libreoffice on your machine before use `libreoffice-convert`
const libre = require('libreoffice-convert')
const hummus = require('hummus')

const extend = '.pdf'

const fileUrl = global.encodeURI('http://127.0.0.1:8887/test.docx')

const localDocFileName = global.decodeURIComponent(
  fileUrl
    .toString()
    .split('/')
    .pop()
)
const localPdfFileName = localDocFileName.replace(/\.docx?$/, extend)
const localPdfFileSampleName = localPdfFileName.replace(
  extend,
  `_sample${extend}`
)

http
  .get(fileUrl, response => {
    response.setEncoding('binary')
    let Data = ''
    response.on('data', data => {
      Data += data
    })
    response.on('end', () => {
      // Write doc to local
      fs.writeFile(localDocFileName, Data, 'binary', err => {
        if (err) {
          console.error(`Error saving file: ${err}`)
        }
        console.log('doc ok')

        // Read doc file
        const enterPath = fs.readFileSync(localDocFileName)
        // Convert it to pdf format with undefined filter
        // (see Libreoffice doc about filter)
        libre.convert(enterPath, extend, undefined, (err, done) => {
          if (err) {
            console.error(`Error converting file: ${err}`)
          }

          // Here in done you have pdf file which you can save
          // or transfer in another stream
          fs.writeFileSync(localPdfFileName, done)
          console.log('pdf ok')

          const pdfWriter = hummus.createWriter(localPdfFileSampleName)
          pdfWriter.appendPDFPagesFromPDF(localPdfFileName, {
            type: hummus.eRangeTypeSpecific,
            // array of pairs, 0 based
            specificRanges: [
              [1, 1],
              [3, 3],
            ],
          })
          pdfWriter.end()
          console.log('pdf split ok')
        })
      })
    })
  })
  .on('error', e => {
    console.error(`Error downloading file: ${e.message}`)
  })
