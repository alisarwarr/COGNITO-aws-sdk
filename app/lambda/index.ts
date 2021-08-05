const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

import User from './type/User';

exports.handler = async(user: User) => {
    const params = {
        UserPoolId: process.env.USERPOOL_ID || '',
        Username: user.name
    };

    try {
        await cognitoidentityserviceprovider.adminDeleteUser(params).promise();
        return user;
    }
    catch (err) {
        return err.message;        
    }
};