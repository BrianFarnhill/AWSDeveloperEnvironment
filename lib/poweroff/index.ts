const AWS = require('aws-sdk')
const ec2 = new AWS.EC2()

exports.handler = async (EventObject: any, ContextObject: any) => {
    console.log(EventObject)

    await ec2.stopInstances({
        InstanceIds: [
            process.env.INSTANCE_ID
        ]
    }).promise()
}
