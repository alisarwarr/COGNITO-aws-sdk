import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as lambda from '@aws-cdk/aws-lambda';
import { Effect, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';


export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



//**************************COGNITO**************************/
    //creating userpool
    const userPool = new cognito.UserPool(this, 'dinningbyfriends-UserPool', {
      //user can sigin with 'email' & 'username' ( can also include phone, preferredUsername )
      signInAliases: {
        email: true,
        username: true
      },


      //defining policies for 'password' ( default policies are all true )
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false
      },


      //allow users for 'signup' to create account ( so not only administrator makes account )
      selfSignUpEnabled: true,


      //user can recover account with 'email' only ( can also include PHONE_ONLY, PHONE_AND_EMAIL, etc )
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,


      //verification while creating an account using 'email' by sending a verification code ( can also add phone )
      autoVerify: {
        email: true
      },


      //customize your 'email' & 'phone' verification messages
      userVerification: {
        emailSubject: 'Verify your email for dinningbyfriends app!',
        emailBody: 'Hello, Thanks for using dinningbyfriends app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE
      }
    });


    //creating 'Client' for connect COGNITO with frontend
    const userPoolClient = new cognito.UserPoolClient(this, 'dinningbyfriends-userPoolClient-amplify', {
      userPool
    });


    //send by userPool
    const userPoolId = new cdk.CfnOutput(this, 'dinningbyfriends-userPoolId', {
      value: userPool.userPoolId
    });


    //send by userPool
    const userPoolClientId = new cdk.CfnOutput(this, 'dinningbyfriends-userPoolClientId', {
      value: userPoolClient.userPoolClientId
    });
//**************************COGNITO**************************/



//https://github.com/aws/aws-cdk/issues/7016
//*********************ROLES_LAMBDA**********************/
    //create a specific role for Lambda function ( emptyrole )
    const role = new Role(this, 'lambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    });

    //giving cognito:idp access to lambda    
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["cognito-idp:*"],
      resources: [userPool.userPoolArn],
    });

    //granting IAM permissions to role ( not emptyrole )
    role.addToPolicy(policy);
//*********************ROLES_LAMBDA**********************/



    //creating lambdafunction
    const cognitoLambda = new lambda.Function(this, 'dinningbyfriends-cognitoLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'index.handler',
      //giving environment variable
      environment: {
        USERPOOL_ID: userPoolId.value
      },
      //giving role
      role: role
    });
  }
}
