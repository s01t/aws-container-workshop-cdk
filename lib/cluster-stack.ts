import cdk = require("@aws-cdk/core");
import ecs = require("@aws-cdk/aws-ecs");
import ec2 = require("@aws-cdk/aws-ec2");
import iam = require("@aws-cdk/aws-iam");
import servicediscovery = require("@aws-cdk/aws-servicediscovery");
import { NetworkMode, PortMapping } from "@aws-cdk/aws-ecs";

interface ClusterStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class ClusterStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;

  constructor(scope: cdk.Construct, id: string, props: ClusterStackProps) {
    super(scope, id, props);


    // Create an ECS cluster
    this.cluster = new ecs.Cluster(this, "Cl", {
      vpc: props.vpc,
    });

    // Create a Role
    const policy = iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCodeDeployRoleForECS");
    new iam.Role(this, "CodeDeployRoleforECS-ConWS", {
      assumedBy: new iam.ServicePrincipal("codedeploy.amazonaws.com"),
      managedPolicies: [policy]
    });

    // Private DNS Namespace for ECS
    this.cluster.addDefaultCloudMapNamespace({
      name: "myservice.local",
      type: servicediscovery.NamespaceType.DNS_PRIVATE,
      vpc: props.vpc,
    })

  }
}
