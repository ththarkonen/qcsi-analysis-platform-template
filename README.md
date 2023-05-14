# qCSI analysis platform template
This is a repository for the [qCSI](https://qcsi.fi/) project analysis platform source code. The platform was meant to house analysis tools for the specific project infrastructure and general-purpose spectral measurements.

## Building the project
The project consists of parts written in C++, Python, along with JavaScript and related web technologies. The project is deployed as an Express.js server which calls various APIs written in the aforementioned languages.
The following Sections hopefully explain the compilation and build process required to run this project.

### Setupping up AWS Cognito and S3 resources
Setup an AWS Cognito user pool for signing in or use your custom solution and save necessary enviromental variables to a .env file. Similarly, setup a AWS S3 bucket for storing the data and results or use your custom solution.
Again, save necessary variables to the same .env file.

### Building C++
Navigate to the project C++ folder and run make in each of the subfolders. The C++ software requires an [Armadillo](https://arma.sourceforge.net/) installation. This builds required executables in the root ./exe folder.

### Building the UI
The user interface is written using Vue.js library which communicates with the backend using Axios.js. Building the UI requires Node.js. Navigate to ./ui/analysis-platform and ./ui/sign-in and run
```
npm install
npm run build
```
to instal node dependencies and build the user interface for both the platform itself and the sign-in screen.

### Run the server
The server is confugured as an Express.js server which can be run on the localhost by running
```
npm install
npm start
```
to first install node dependencies and then to run the Express server.
