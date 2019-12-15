import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import cloud9 = require("@aws-cdk/aws-cloud9");

interface Cloud9StackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class Cloud9Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: Cloud9StackProps) {
    super(scope, id, props);

    //
    // Create Cloud9
    //
    // const cloudenv = new cloud9.CfnEnvironmentEC2(this, "Cloud9", {
    //   instanceType: "t3.small",
    //   //automaticStopTimeMinutes: "",
    //   subnetId: props.vpc.publicSubnets[0].subnetId,
    //   name: "Cloud9-ConWS",
    // });
  }
}
