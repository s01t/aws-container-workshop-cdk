import path =  require("path");
import cdk = require("@aws-cdk/core");
import ecrassets =  require("@aws-cdk/aws-ecr-assets");

interface BundleImageStackProps extends cdk.StackProps {
    containerapp: string;
}

export class BundleImageStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: BundleImageStackProps) {
    super(scope, id, props);

    const asset = new ecrassets.DockerImageAsset(this, 'BuildImage' + this.node.tryGetContext(props.containerapp).image, {
        directory: path.join(__dirname, '../' + this.node.tryGetContext("dockerimagedirectory") + "/" + this.node.tryGetContext(props.containerapp).image),
        repositoryName: this.node.tryGetContext(props.containerapp).image,
    })
  }
}
