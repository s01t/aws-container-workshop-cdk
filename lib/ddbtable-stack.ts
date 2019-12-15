import cdk = require("@aws-cdk/core");
import iam = require("@aws-cdk/aws-iam");
import dynamodb = require("@aws-cdk/aws-dynamodb");

interface DDBtableStackProps extends cdk.StackProps {
}

export class DDBtableStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: DDBtableStackProps) {
    super(scope, id, props);

    // Create DynamoDB Table
    const table = new dynamodb.Table(this, "MessagesTable", {
      tableName: "messagestable",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
