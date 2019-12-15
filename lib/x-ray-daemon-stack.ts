import cdk = require("@aws-cdk/core");
import ecs = require("@aws-cdk/aws-ecs");
import ec2 = require("@aws-cdk/aws-ec2");
import iam = require("@aws-cdk/aws-iam");

interface XraydaemonStackProps extends cdk.StackProps {
  containerapp: string;
  taskDefinition: ecs.TaskDefinition;
}

export class XraydaemonStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: XraydaemonStackProps) {
    super(scope, id, props);

    // Set Task definition
    const xray = props.taskDefinition.addContainer("xray-daemon", {
      image: ecs.ContainerImage.fromRegistry("amazon/aws-xray-daemon"),
      cpu: 32,
      memoryReservationMiB: 256,
      logging: new ecs.AwsLogDriver({
        streamPrefix: "xrayLog"
      }),
      essential: false,
      entryPoint: ["/usr/bin/xray","-o"]
    });

    // grant the task role rights to put segments
    xray.taskDefinition.taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess")
    );

    // Add Portmapping to frontend
    xray.addPortMappings({
      containerPort: 2000,
      protocol: ecs.Protocol.UDP
    });
  }
}
