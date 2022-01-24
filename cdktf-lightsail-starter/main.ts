import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { AwsProvider, lightsail } from "@cdktf/provider-aws";
import { LightsailInstanceConfig } from "@cdktf/provider-aws/lib/lightsail";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "aws-provider", {
      region: "us-east-2",
    });

    const tags = {
      name: "wordpress-blog",
      craetedBy: "cdktf",
    };

    const instanceKeyPair = new lightsail.LightsailKeyPair(
      this,
      "MyLightsailSSHKeyPair",
      {
        name: "MyLightsailSSHKeyPair",
      }
    );

    const staticIP = new lightsail.LightsailStaticIp(
      this,
      "MyLightsailStaticIP",
      {
        name: "MyLightsailStaticIP",
      }
    );

    const instanceConfig: LightsailInstanceConfig = {
      availabilityZone: "us-east-2a",
      blueprintId: "wordpress",
      bundleId: "nano_2_0",
      name: "Lightsail-Wordpress-blog",
      keyPairName: instanceKeyPair.name,
      tags,
    };

    const instance = new lightsail.LightsailInstance(
      this,
      "MyLightSailWordpress",
      instanceConfig
    );

    const staticIPAttachement = new lightsail.LightsailStaticIpAttachment(
      this,
      "MyLightsailStaticIpAttachment",
      {
        staticIpName: staticIP.name,
        instanceName: instance.name,
      }
    );

    new TerraformOutput(this, "static_public_ip", {
      value: staticIPAttachement.ipAddress,
    });
  }
}

const app = new App();
new MyStack(app, "cdktf-lightsail-starter");
app.synth();
