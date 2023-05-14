
import axios from "axios"

export default {

  formatFileData( response, progressObject){

    return new Promise( (resolve, reject) => {

      const contents = response.data.Contents;
      const nFiles = contents.length;

      var files = [];
      var filesInProgress = [];
      var progressList = [];

      for(var ii = 0; ii < nFiles; ii++){

        var file_ii = contents[ii];

        var key_ii = file_ii.Key;

        var pathParts = key_ii.split('/');
        var nParts = pathParts.length;

        var fileName_ii = pathParts[ nParts - 1 ];

        if( fileName_ii == ".progress" ){
          continue;
        };

        pathParts = fileName_ii.split('_');
        nParts = pathParts.length;

        pathParts[ 0 ] = '';
        fileName_ii = pathParts.filter(Boolean).join('_');

        pathParts = fileName_ii.split('.');
        nParts = pathParts.length;

        pathParts[ nParts - 1 ] = '';
        fileName_ii = pathParts.join('');

        var tempFile = {};
        tempFile.name = fileName_ii;
        tempFile.dataPath = key_ii;

        if( key_ii in progressObject ){

          var progress_ii = 10000 * progressObject[key_ii];

          progress_ii = Math.round( progress_ii ) / 100;
          progress_ii = Number( progress_ii ).toFixed(2);

          progressList.push( progress_ii );
          filesInProgress.push( tempFile );
        } else {

          files.push( tempFile );
        };
      };

      var result = {};

      result.projects = files;
      result.projectsInProgress = filesInProgress;
      result.progressList = progressList;

      resolve( result );
    });
  },

  update( key, fileData){

    return new Promise( (resolve, reject) => {

      const formData = new FormData();

      const fileDataString = JSON.stringify( fileData );

      formData.append("key", key)
      formData.append("fileData", fileDataString);

      axios.post("/updateObject", formData)
      .then( response => {
        resolve( response );
      });
    });
  },

  upload( key, fileData){

    return new Promise( (resolve, reject) => {

      const formData = new FormData();

      const fileDataString = JSON.stringify( fileData );

      formData.append("key", key)
      formData.append("fileData", fileDataString);

      axios.post("/uploadObject", formData)
      .then( response => {
        resolve( response );
      });
    });
  },

  uploadROI( key, roiData){

    const formData = new FormData();
    const fileDataString = JSON.stringify( roiData );

    formData.append("key", key);
    formData.append("roiData", fileDataString);

    axios.post("/uploadRegionOfInterest", formData)
    .then( response => {
      console.log( response );
    });

  },

  load( key ){

    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("key", key);

      var settings = {};
      settings

      axios.post("/loadData", formData)
      .then( response => {

        console.log("here FM")
        console.log( response.data )

        const fileData = response.data;
        resolve( fileData );
      });
    });
  },

  loadCARS( key ){
    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("key", key);

      var settings = {};
      settings

      axios.post("/loadSpectrumCARS", formData)
      .then( response => {

        console.log("Loading CARS spectrum data.")
        console.log( response.data )

        const fileData = response.data;
        resolve( fileData );
      });
    });
  },

  loadObject( key ){
    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("key", key);

      var settings = {};
      settings

      axios.post("/loadObject", formData)
      .then( response => {

        console.log("Loading Raman spectrum data.")
        console.log( response.data )

        const fileData = response.data;
        resolve( fileData );
      });
    });
  },

  deleteProject( key ){

    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("key", key);

      axios.post("/deleteProject", formData)
      .then( response => {
        resolve( response );
      });
    });
  },

  nextPhase( key, fileData, destination, router){

    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      const fileDataString = JSON.stringify( fileData );

      console.log( fileData )
      console.log( destination )
      console.log( router )

      formData.append("key", key)
      formData.append("fileData", fileDataString);

      axios.post("/update", formData)
      .then( response => {

        const dataObj = fileDataString;

        var routerSpec = {};
        routerSpec.params = {};

        routerSpec.name = destination;

        router.push( routerSpec );
      });
    });
  },

  download( key ){

    console.log("Starting download.")
    console.log( key )

    axios.get("/downloadProject", {params: {key: key}, responseType: 'blob'})
    .then( response => {
      console.log( response )

      const href = URL.createObjectURL(response.data);

    // create "a" HTML element with href to file & click
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', 'project.zip'); //or any other extension
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    });
  },

  results( key, destination, router){

    return new Promise( (resolve, reject) => {

      const formData = new FormData();

      formData.append("key", key);

      axios.post("/loadData", formData)
      .then( response => {

        const dataObj = response.data;

        var routerSpec = {};
        routerSpec.params = {};

        routerSpec.name = destination;
        routerSpec.params.inputFileData = dataObj;
        routerSpec.params.filePath = key;

        console.log(router)

        router.push( routerSpec );
      })
    });
  },

  loadProjects( dataFolder ){

    var that = this;

    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("folder", dataFolder)

      axios.post("/listProjects", formData)
      .then( response => {
        console.log(response)
        that.loadProgressObject( dataFolder )
        .then( progressObject => {

          that.formatFileData( progressObject, response)
          .then( projects => {
            resolve( projects );
          });
        });
      });
    });
  },

  loadProgressObject( dataFolder ){

    return new Promise( (resolve, reject) => {

      const formData = new FormData();
      formData.append("folder", dataFolder)

      axios.post("/loadProgressObject", formData)
      .then( response => {

        try{

          const progressObject = JSON.parse( response.data );
          resolve( progressObject );
        } catch(err) {

          const progressObject = {};
          resolve( progressObject );
        };
      });

    });
  },

  formatFileData( progressObject, response){

    return new Promise( (resolve, reject) => {

      console.log( response.data )

      const contents = response.data.folderFiles;
      const preprocessing = response.data.preprocessing;
      const nFiles = contents.length;

      var files = [];
      var filesInProgress = [];
      var progressList = [];

      for(var ii = 0; ii < nFiles; ii++){

        var file_ii = contents[ii];
        var preprocessing_ii = preprocessing[ii];
        console.log( preprocessing_ii )

        var key_ii = file_ii.Prefix;
        console.log( key_ii )

        var pathParts = key_ii.split('/');
        var nParts = pathParts.length;

        var fileName_ii = pathParts[ nParts - 2 ];
        console.log(fileName_ii)

        pathParts = fileName_ii.split('_');
        nParts = pathParts.length;

        pathParts[ 0 ] = '';
        fileName_ii = pathParts.filter(Boolean).join('_');

        pathParts = fileName_ii.split('.');
        nParts = pathParts.length;

        pathParts[ nParts - 1 ] = '';
        fileName_ii = pathParts.join('');

        console.log(fileName_ii)

        var tempFile = {};
        tempFile.name = fileName_ii;
        tempFile.dataPath = key_ii;

        if( preprocessing_ii ){

          var progress_ii = 10000 * progressObject[key_ii];

          progress_ii = Math.round( progress_ii ) / 100;
          progress_ii = Number( progress_ii ).toFixed(2);

          progressList.push( 0.0 );
          filesInProgress.push( tempFile );
        } else {

          files.push( tempFile );
        };
      };

      var showProgressList = false;

      if( filesInProgress.length > 0 ){
        showProgressList = true;
      };

      console.log( files )

      var projectObject = {};
      projectObject.projects = files;
      projectObject.projectsInProgress = filesInProgress;
      projectObject.showProgressList = showProgressList;

      resolve( projectObject );
    });
  },

}
