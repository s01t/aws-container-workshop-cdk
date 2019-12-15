import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import elb = require("@aws-cdk/aws-elasticloadbalancingv2");

interface LoadbalancerStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class LoadbalancerStack extends cdk.Stack {
  public readonly alb: elb.ApplicationLoadBalancer;

  constructor(scope: cdk.Construct, id: string, props: LoadbalancerStackProps) {
    super(scope, id, props);

    // Create ALB (Create Listner and Security Groups)
    this.alb = new elb.ApplicationLoadBalancer(this, "ALB", {
      vpc: props.vpc,
      vpcSubnets: { subnetName: "PublicSubnet-ConWS" },
      internetFacing: true
    });

    const clientip = this.node.tryGetContext("ClientIp")
      ? ec2.Peer.ipv4(this.node.tryGetContext("ClientIp") + "/32")
      : ec2.Peer.anyIpv4();

    this.alb.connections.allowFrom(
      clientip,
      ec2.Port.tcp(80),
      "Allow inbound HTTP"
    );

  }
}
