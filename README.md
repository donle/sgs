# SGS (三国杀)

## Getting Started

1. Clone this repo:

```sh
$ git clone git@github.com:donle/sgs.git <working_directory>
```

2. Install dependencies:

```sh
$ cd <working_directory>
# cnpm is recommended if you're in China.
$ npm install 
$ cd src/server
$ npm install
$ cd ../ui/platforms/desktop
$ npm install
```

3. Running. You need to start the server and client respectively.
```sh
# cwd is <working_directory>
# Start server
$ cd src/server
$ npm run dev #dev:win if you're using Windows.
# Start client
$ cd ./ui/platforms/desktop
$ npm run start:mac #start:win if you're using Windows.
```

