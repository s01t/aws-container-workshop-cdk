import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import iam = require("@aws-cdk/aws-iam");

interface NetworkStackProps extends cdk.StackProps {
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: cdk.Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    // Create a VPC and its subnets.
    this.vpc = new ec2.Vpc(this, "VPC-ConWS", {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet-ConWS",
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: "PrivateSubnet-ConWS",
          subnetType: ec2.SubnetType.PRIVATE
        }
      ]
    });

    // Add a gateway endpoint on the VPC
    const dynamoDbEndpoint = this.vpc.addGatewayEndpoint('DynamoDbEndpoint', {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB
    });

    // This allows to customize the endpoint policy
    dynamoDbEndpoint.addToPolicy(
      new iam.PolicyStatement({ // Restrict to listing and describing tables
        principals: [new iam.AnyPrincipal()],
        actions: ['dynamodb:*'],
        resources: ['*'],
    }));

    // Add the ECR endpoint on the VPC
    const ecrDockerEndpoint = this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
    });

    // This method doesn't work well
    // ecrDockerEndpoint.connections.allowDefaultPortFromAnyIpv4();

    // So, define a Security Group for the ECR endpoint.
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, "ECR Security Group", ecrDockerEndpoint.securityGroupId,);
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "allow access from any IPs",
    )
  }
}
