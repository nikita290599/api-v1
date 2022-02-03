const path = require('path');
const express = require('express');
// const ejs = require('ejs');
const bodyParser = require('body-parser');
const multer = require('multer');
const AdmZip = require("adm-zip");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var fs = require('fs');

// For Multer Storage
var multerStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, 'my_uploads'));
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    }
});

// For Single File upload
var multerSigleUpload = multer({ storage: multerStorage });

// For Multiple File upload
var multerMultipleUpload = multer({ storage: multerStorage }).array("multipleImage", 3);



//route for single text file upload
app.post("/api/v1/txt_file", multerSigleUpload.single('text'), function (req, res) {
    const file = req.file;
    const fileName =req.file.filename; 
    console.log("FILENAME: ", req.file.filename);
    if (!file) {
        return res.end("Please choose file to upload!");
    }
    fs.readFile(__dirname + '/my_uploads/' + fileName, "utf8", (error, data) => {
        //Add your error handling (if(error))
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({data}));
        
    });
    // req.app.locals.uploadStatus = true;
    // res.redirect('/');
});




  // Route for zip file upload
app.post("/api/v1/zip_file", multerSigleUpload.single('zip'), function (req, res) {
    const files = req.file;
    const fileName =req.file.filename; 
    console.log("FILENAME: ", fileName);

    const outputDir =path.join(__dirname,'my_uploads',fileName.slice(0,-4));
    // UNZIPPING FILE
    async function extractArchive(filepath) {
        try {
          const zip = new AdmZip(filepath);
          
          zip.extractAllTo(outputDir,true);
         
          console.log(`Extracted to "${outputDir}" successfully`);
        } catch (e) {
          console.log(`Something went wrong. ${e}`);
        }
      }
      
    extractArchive(__dirname+"/my_uploads/"+fileName).then(()=>{
        let arrayList=[]; 
        let filenames = fs.readdirSync(outputDir);
        var temp={};
        console.log("\nFilenames in directory:");
       filenames.forEach((file) => {
            fs.readFile(outputDir +"/"+ file, "utf8", (error, data) => {
                
                //Add your error handling (if(error))
                temp={
                    'name':file,
                    'content':data
                }
                arrayList.push(temp);
                console.log(temp);
            });
        });
        if(arrayList[0]){
            
            res.end(JSON.stringify({arrayList}));
        }
       
    })

    
   
    // res.redirect('/');
});

// //route for multiple file upload
// app.post("/multipleFile", function (req, res) {
//     multerMultipleUpload(req, res, function (err) {
//         if (err) {
//             return res.end("Files uploading unsucessfully!");
//         }
//         req.app.locals.uploadStatus = true;
//         res.redirect('/');
//     });
// });

// Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});