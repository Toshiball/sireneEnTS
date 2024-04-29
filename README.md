# Sirene Invader

This Node.js code reads data from a large csv file, spilts it into smaller chunks of data and store into MongoDB database using parallel worker tasks to improve the effeciency of the process

## Prerequisites

Install MongoDB on your system

- [MongoDB](https://docs.mongodb.com/manual/installation/)
- [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/): `npm i -g pm2`

## Getting started

Config the script in config.json files

Run the code

```shell
npm install
npm run start
```
Check the logs folder to see for any errors in the workers in the ./logs/error.log
Check the logs folder for the worker execution logs in ./logs/workerlog.log

Other handy pm2 commands for monitoring or viewing logs of the running processes.

```shell
pm2 monit
pm2 logs  
```

If you want to delete the CSV files created during the split, you should run the following command :
```shell
rm -rf {OUTPUTDIR in the .env file}
```