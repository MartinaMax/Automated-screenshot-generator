const axios = require('axios');
const fs = require('fs');
const { google } = require('googleapis');

require('dotenv').config();


// Takes screenshots of websites using Screenshotmachine API
takesScreenshot = async(url, imgName) => {
    const apiKey = process.env.SCREENSHOT_MACHINE_API_KEY;
    const screenshotApiUrl = `https://api.screenshotmachine.com/?key=${apiKey}&url=${url}&device=desktop&dimension=1920x1080&format=jpg`;
        
    try {
        const res = await axios.get(screenshotApiUrl, {responseType: 'arraybuffer'});
        fs.writeFileSync(imgName, res.data, 'binary');
        console.log(`Screenshot ${imgName} taken of ${url}`);
        
    } catch (err) {
        console.error(`Error while taking screenshot of ${url}: ${err.message}`);
    }
}

// Uploads the screenshots to Google Drive folder
     uploadToGoogleDrive = async(imgName) => {
    
    // Google authorization with service account
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/drive.file',
    });
    
    const driveService = google.drive({ version: 'v3', auth });
    
    const folderID  = process.env.GOOGLE_DRIVE_FOLDER_ID;

    try {
        const fileMetadata = { 
            name: imgName, 
            parents: [folderID]
        };
        const media = { 
            mimeType: 'image/jpeg', 
            body: fs.createReadStream(imgName) 
        };
        const res = await driveService.files.create({resource: fileMetadata, media: media});
        
        console.log(`Screenshot uploaded to Google Drive successfully: ${res.data.id}`);
    } catch (err) {
        console.error(`Error uploading screenshot to Google Drive: ${err.message}`);
    }
}

// Takes and uploads screenshots, making it work
takesAndUploadScreenshots = async() => {
    const webpages = [
        {ID:1, name:'iFunded', url:'https://ifunded.de/en/'},
        {ID:2, name:'Property Partner', url:'https://www.propertypartner.co'},
        {ID:3, name:'Property Moose', url:'https://propertymoose.co.uk'},
        {ID:4, name:'Occollo', url:'https://www.occollo.cz'},
        {ID:5, name:'Realty Mogul', url:'https://www.realtymogul.com'}
    ];

    for (const img of webpages) {
        const imgName = `${img.ID}_${img.name}.jpg`;
        await takesScreenshot(img.url, imgName);
        await uploadToGoogleDrive(imgName);
        fs.unlinkSync(imgName);
    }
}

return takesAndUploadScreenshots()
