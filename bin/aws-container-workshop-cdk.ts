#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { NetworkStack } from "../lib/network-stack";
import { Cloud9Stack } from "../lib/cloud9-stack";
import { ClusterStack } from "../lib/cluster-stack";
import { BundleImageStack } from "../lib/bundle-images-stack";
import { FrontendAppStack } from "../lib/frontend-app-stack";
import { LoadbalancerStack } from "../lib/loadbalancer-stack";
import { BackendAppStack } from "../lib/backend-app-stack";
import { DDBtableStack } from "../lib/ddbtable-stack";
import {XraydaemonStack} from "../lib/x-ray-daemon-stack";


const app = new cdk.App();
const region = app.node.tryGetContext("region") || "us-east-1";

const networkstack = new NetworkStack(app, "NetworkStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
});

const loadbalancerstack = new LoadbalancerStack(app, "LBStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  vpc: networkstack.vpc,
});

const clusterstack = new ClusterStack(app, "ClusterStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  vpc: networkstack.vpc,
});

const frontendimagestack = new BundleImageStack(app, "FrontImageStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  containerapp: "frontend",
});

const frontendappstack = new FrontendAppStack(app, "FrontAppStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  vpc: networkstack.vpc,
  containerapp: "frontend",
  cluster: clusterstack.cluster,
  alb: loadbalancerstack.alb,
});

const backendimagestack = new BundleImageStack(app, "BackImageStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  containerapp: "backend",
});

const backendappstack = new BackendAppStack(app, "BackAppStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  vpc: networkstack.vpc,
  containerapp: "backend",
  cluster: clusterstack.cluster,
  frontendsecurityGroup: frontendappstack.securityGroup,
});

const ddbtablestack = new DDBtableStack(app, "DDBTableStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
});

const frontxraystack = new XraydaemonStack(app, "FrontXrayStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  containerapp: "frontend",
  taskDefinition: frontendappstack.taskDefinition,
});

const backxraystack = new XraydaemonStack(app, "BackXrayStack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  containerapp: "backend",
  taskDefinition: backendappstack.taskDefinition,
});


const cloud9stack = new Cloud9Stack(app, "Cloud9Stack-ConWS", {
  env: {
    account: process.env["CDK_DEFAULT_ACCOUNT"],
    region: region,
  },
  vpc: networkstack.vpc,
});
