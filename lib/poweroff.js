"use strict";
const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
exports.handler = async (EventObject, ContextObject) => {
    console.log(EventObject);
    await ec2.stopInstances({
        InstanceIds: [
            process.env.INSTANCE_ID
        ]
    }).promise();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG93ZXJvZmYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwb3dlcm9mZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzlCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBRXpCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxFQUFFLFdBQWdCLEVBQUUsYUFBa0IsRUFBRSxFQUFFO0lBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7SUFFeEIsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDO1FBQ3BCLFdBQVcsRUFBRTtZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVztTQUMxQjtLQUNKLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNoQixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBBV1MgPSByZXF1aXJlKCdhd3Mtc2RrJylcbmNvbnN0IGVjMiA9IG5ldyBBV1MuRUMyKClcblxuZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKEV2ZW50T2JqZWN0OiBhbnksIENvbnRleHRPYmplY3Q6IGFueSkgPT4ge1xuICAgIGNvbnNvbGUubG9nKEV2ZW50T2JqZWN0KVxuXG4gICAgYXdhaXQgZWMyLnN0b3BJbnN0YW5jZXMoe1xuICAgICAgICBJbnN0YW5jZUlkczogW1xuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuSU5TVEFOQ0VfSURcbiAgICAgICAgXVxuICAgIH0pLnByb21pc2UoKVxufVxuIl19