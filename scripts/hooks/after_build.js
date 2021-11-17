/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/

'use strict';

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

module.exports = function (configObj) {
  return new Promise((resolve, reject) => {
    console.log('Running after_build hook.');
    if (configObj.buildType==='release'){
      console.log('Packaging WAR file for deployment'); 

      //Ensure that the output folder exists, create it if not
      const distributionFolder = 'dist'
      fs.ensureDirSync(distributionFolder);

      // Define the name for the WAR file based on the package name / version defined 
      // in package.json (or you could hardcode!)
      const packageInfo = fs.readJSONSync('package.json');
      const warFile = path.join(distributionFolder,`${packageInfo.name}-${packageInfo.version}.war`);

      // Read the JET configuration file to work out what folder to archive
      // This is /web by default but it might have been configured as something else
      const jetConfig = fs.readJSONSync('oraclejetconfig.json');
      const webRoot = jetConfig.paths.staging.web;

      // Create the archiver - a WAR file is just a ZIP
      const output = fs.createWriteStream(warFile);
      const archive = archiver('zip');
      
      // Archiver Callbacks
      output.on('close', () => {
        console.log('Files were successfully packaged into WAR file');
      });
 
      archive.on('warning', (warn) => {
        console.warn(`Warning when packaging WAR file: ${warn}`);
      });
 
      archive.on('error', (error) => {
        console.error(`Error when packaging WAR file: ${error}`);
      });
 
      // And start the archive process 
      archive.pipe(output);
      archive.directory(webRoot, false);
      archive.finalize();
    }
  
    // The archiving process (if it takes place) can be asynchronous 
    // so we return can control to the CLI immediately
    resolve(configObj);
  });
};