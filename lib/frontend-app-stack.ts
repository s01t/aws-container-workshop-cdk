import cdk = require("@aws-cdk/core");
import ecs = require("@aws-cdk/aws-ecs");
import ecr = require("@aws-cdk/aws-ecr");
import ec2 = require("@aws-cdk/aws-ec2");
import elb = require("@aws-cdk/aws-elasticloadbalancingv2");
import servicediscovery = require("@aws-cdk/aws-servicediscovery");
import iam = require("@aws-cdk/aws-iam");

interface FrontendAppStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  containerapp: string;
  cluster: ecs.Cluster;
  alb: elb.ApplicationLoadBalancer;
}

export class FrontendAppStack extends cdk.Stack {
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly taskDefinition: ecs.TaskDefinition;

  constructor(scope: cdk.Construct, id: string, props: FrontendAppStackProps) {
    super(scope, id, props);

    // Create Task Exe Role
    const rolepolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      "service-role/AmazonECSTaskExecutionRolePolicy"
    );

    const taskexerole = new iam.Role(this, "ecstaskexerole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [rolepolicy]
    });

    // Create Task Role
    const taskrole = new iam.Role(this, "ecstaskrole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Set Task definition
    this.taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "Task-ConWS" + this.stackName,
      {
        cpu: 256, //256 (.25 vCPU) - Available memory values: 512 (0.5 GB), 1024 (1 GB), 2048 (2 GB),
        executionRole : taskexerole,
        taskRole: taskrole,
      }
    );

    // Identify ECR Repository
    const repo = ecr.Repository.fromRepositoryName(
      this,
      "Repository-ContainerWS" + this.stackName,
      this.node.tryGetContext(props.containerapp).image
    );

    const container = this.taskDefinition.addContainer(
      "Container-ConWS" + this.stackName,
      {
        image: ecs.ContainerImage.fromEcrRepository(repo),
        memoryLimitMiB: 512,
        logging: new ecs.AwsLogDriver({ streamPrefix: "ContainerWS" }),
        environment: {
          ["AWS_NODEJS_CONNECTION_REUSE_ENABLED"]:
            this.node.tryGetContext(props.containerapp)
              .AWS_NODEJS_CONNECTION_REUSE_ENABLED || "",
          ["NOTIFICATION_TOPIC"]:
            "arn:aws:sns:" +
            this.node.tryGetContext("region") +
            ":" +
            this.account +
            ":" +
            props.containerapp,
          ["AWS_REGION"]: this.node.tryGetContext("region") || "us-west-2"
        }
      }
    );

    // Add Portmapping to frontend
    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP
    });

    // Create Security Groups
    this.securityGroup = new ec2.SecurityGroup(
      this,
      "SecurityGroup" + this.stackName,
      {
        vpc: props.vpc,
        description: "Security Group for a ECS task",
        allowAllOutbound: true // Can be set to false
      }
    );

    // Add Rules to access each other
    this.securityGroup.addIngressRule(
      this.securityGroup,
      ec2.Port.tcp(this.node.tryGetContext(props.containerapp).portnumber),
      "allow access each other"
    );

    // Add Rules to access from ALB
    this.securityGroup.addIngressRule(
      props.alb.connections.securityGroups[0],
      ec2.Port.tcp(this.node.tryGetContext(props.containerapp).portnumber),
      //ec2.Port.allTcp(),
      "allow access from ALB"
    );

    // Instantiate an Amazon ECS Service
    const ecsService = new ecs.FargateService(
      this,
      props.containerapp + "Svc-ConWS",
      {
        //assignPublicIp: true, // Needed to get ECR images from Public subnets
        cluster: props.cluster,
        taskDefinition: this.taskDefinition,
        desiredCount: 2,
        minHealthyPercent: 50,
        maxHealthyPercent: 100,
        serviceName: props.containerapp + "Svc-ConWS",
        // cloudMapOptions: {
        //   dnsRecordType: servicediscovery.DnsRecordType.A,
        //   dnsTtl: cdk.Duration.seconds(30),
        //   name: props.containerapp
        // },
        vpcSubnets: {
          subnets: [props.vpc.privateSubnets[0], props.vpc.privateSubnets[1]]
        },
        securityGroup: this.securityGroup
      }
    );

    // LoadBalancer
    const listener = new elb.ApplicationListener(this, "Listener-ConWS", {
      port: 80,
      loadBalancer: props.alb
    });

    listener.addTargets("ECS", {
      port: this.node.tryGetContext(props.containerapp).portnumber,
      protocol: elb.ApplicationProtocol.HTTP,
      targets: [ecsService],
      healthCheck: {
        path: "/health",
          interval: cdk.Duration.seconds(20),
          healthyThresholdCount: 2,
      }
    });

    // Define a service using Load Balancer
    const namespace = props.cluster
      .defaultCloudMapNamespace as servicediscovery.PrivateDnsNamespace;

    const lbservice = namespace.createService("Fr", {
      dnsRecordType: servicediscovery.DnsRecordType.A,
      dnsTtl: cdk.Duration.seconds(30),
      loadBalancer: true,
      name: props.containerapp
    });

    // Register a ALB
    lbservice.registerLoadBalancer("ALB", props.alb);
  }
}
