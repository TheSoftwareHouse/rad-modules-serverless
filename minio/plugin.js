const { Client } = require("minio");
const { parse } = require("url");
const path = require("path");
const { default: Lambda } = require("serverless-offline/dist/lambda/");

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.service = serverless.service;
    this.options = options;
    this.commands = {};
    this.hooks = {
      "s3:start:startHandler": this.startHandler.bind(this),
      "before:offline:start:init": this.startHandler.bind(this),
      "before:offline:start": this.startHandler.bind(this),
    };
  }
  startHandler() {
    this.client = this.getClient();
    this.eventHandlers = this.getEventHandlers();
    this.subscribe();
  }
  getClient() {
    const { hostname, port, protocol } = parse(process.env.AWS_LAMBDA_S3_URL || "http://localhost:9000");
    return new Client({
      endPoint: hostname,
      port: Number(port),
      useSSL: protocol.startsWith("https"),
      accessKey: process.env.AWS_LAMBDA_ACCESS_KEY || "s3accesskey",
      secretKey: process.env.AWS_LAMBDA_SECRET_KEY || "s3secret",
    });
  }
  getFunctionHandler(currentHandler) {
    const webpackPath = ".webpack/service/";
    if (this.serverless.service.plugins.includes("serverless-webpack") && !currentHandler.includes(webpackPath)) {
      currentHandler = path.join(webpackPath, currentHandler);
    }
    return currentHandler;
  }
  getEventHandlers() {
    const eventHandlers = [];
    Object.keys(this.service.functions).forEach((key) => {
      const serviceFunction = this.service.getFunction(key);
      serviceFunction.events
        .filter((event) => event["s3"])
        .forEach((event) => {
          const func = (s3Event) => {
            try {
              Object.assign(process.env, this.service.provider.environment, serviceFunction.environment);
              serviceFunction.handler = this.getFunctionHandler(serviceFunction.handler);
              const lambda = new Lambda(this.serverless, this.options);
              lambda._create(key, serviceFunction);
              const handler = lambda.get(key);
              handler.setEvent({ Records: [s3Event] });
              handler.runHandler();
            } catch (error) {
              console.error("Error while running handler", error);
            }
          };
          const listener = this.client.listenBucketNotification(event["s3"].bucket, "", "", [event["s3"].event]);
          eventHandlers.push(this.buildEventHandler(event["s3"].bucket, func, listener));
        });
    });
    return eventHandlers;
  }
  buildEventHandler(name, func, listener) {
    return {
      name,
      func,
      listener,
    };
  }
  subscribe() {
    this.eventHandlers.forEach((handler) => {
      handler.listener.on("notification", async (record) => {
        this.serverless.cli.log(JSON.stringify(await handler.func(record)));
      });
    });
  }
}

module.exports = ServerlessPlugin;
