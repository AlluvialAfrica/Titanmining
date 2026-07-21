import boto3
import json
import uuid

SESSION = boto3.Session(profile_name='titanmining', region_name='eu-north-1')
cognito = SESSION.client('cognito-idp')
dynamodb = SESSION.client('dynamodb')

USER_POOL_ID = 'eu-north-1_AUmaZlQ7a'
EMAIL = 'faafan10@gmail.com'
PHONE = '+254722828481'
FIRST_NAME = 'Osman'
LAST_NAME = 'Titan'
ORG_ID = 'org_titanmining'
SITE_ID = 'site_alpha_01'
ROLE = 'SITE_CONTROLLER'
TEMP_PASSWORD = 'TitanMining2026!'

def create_admin():
    print(f"Creating/updating Cognito user for {EMAIL}...")
    try:
        # Check if user already exists
        resp = cognito.admin_get_user(UserPoolId=USER_POOL_ID, Username=EMAIL)
        user_sub = [attr['Value'] for attr in resp['UserAttributes'] if attr['Name'] == 'sub'][0]
        print(f"User already exists with sub: {user_sub}")
        
        # Update attributes
        cognito.admin_update_user_attributes(
            UserPoolId=USER_POOL_ID,
            Username=EMAIL,
            UserAttributes=[
                {'Name': 'given_name', 'Value': FIRST_NAME},
                {'Name': 'family_name', 'Value': LAST_NAME},
                {'Name': 'phone_number', 'Value': PHONE},
                {'Name': 'phone_number_verified', 'Value': 'true'},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'custom:role', 'Value': ROLE},
                {'Name': 'custom:orgId', 'Value': ORG_ID},
                {'Name': 'custom:siteId', 'Value': SITE_ID},
                {'Name': 'custom:status', 'Value': 'ACTIVE'},
            ]
        )
        cognito.admin_set_user_password(
            UserPoolId=USER_POOL_ID,
            Username=EMAIL,
            Password=TEMP_PASSWORD,
            Permanent=False
        )
    except cognito.exceptions.UserNotFoundException:
        resp = cognito.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=EMAIL,
            UserAttributes=[
                {'Name': 'email', 'Value': EMAIL},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'phone_number', 'Value': PHONE},
                {'Name': 'phone_number_verified', 'Value': 'true'},
                {'Name': 'given_name', 'Value': FIRST_NAME},
                {'Name': 'family_name', 'Value': LAST_NAME},
                {'Name': 'custom:role', 'Value': ROLE},
                {'Name': 'custom:orgId', 'Value': ORG_ID},
                {'Name': 'custom:siteId', 'Value': SITE_ID},
                {'Name': 'custom:status', 'Value': 'ACTIVE'},
            ],
            TemporaryPassword=TEMP_PASSWORD,
            MessageAction='SUPPRESS' # We will send custom welcome email / details
        )
        user_sub = [attr['Value'] for attr in resp['User']['Attributes'] if attr['Name'] == 'sub'][0]
        print(f"Created new Cognito user with sub: {user_sub}")

    # Add to SiteControllers group
    try:
        cognito.admin_add_user_to_group(
            UserPoolId=USER_POOL_ID,
            Username=EMAIL,
            GroupName='SiteControllers'
        )
        print("Added user to SiteControllers group.")
    except Exception as e:
        print(f"Group error: {e}")

    # DynamoDB Organization Table
    org_table = 'Organization-pzm2puthhza2bew52yc5ozkhwm-NONE'
    dynamodb.put_item(
        TableName=org_table,
        Item={
            'id': {'S': ORG_ID},
            'name': {'S': 'Titan Mining'},
            'timeZone': {'S': 'Africa/Nairobi'},
            'defaultLanguage': {'S': 'en'},
            'currency': {'S': 'USD'},
            'sites': {'L': [{'S': SITE_ID}]},
            'whatsappNumber': {'S': PHONE},
            'createdAt': {'S': '2026-07-21T15:00:00Z'},
            'updatedAt': {'S': '2026-07-21T15:00:00Z'},
        }
    )
    print("DynamoDB Organization record created.")

    # DynamoDB User Table
    user_table = 'User-pzm2puthhza2bew52yc5ozkhwm-NONE'
    dynamodb.put_item(
        TableName=user_table,
        Item={
            'id': {'S': user_sub},
            'orgId': {'S': ORG_ID},
            'firstName': {'S': FIRST_NAME},
            'lastName': {'S': LAST_NAME},
            'email': {'S': EMAIL},
            'mobileNumber': {'S': PHONE},
            'role': {'S': ROLE},
            'status': {'S': 'ACTIVE'},
            'cognitoSub': {'S': user_sub},
            'createdAt': {'S': '2026-07-21T15:00:00Z'},
            'updatedAt': {'S': '2026-07-21T15:00:00Z'},
        }
    )
    print("DynamoDB User record created.")

    # Print Credentials Summary
    print("\n================ LOGIN CREDENTIALS ==================")
    print(f"Portal URL : https://main.d29qwdlmuy3blg.amplifyapp.com")
    print(f"Tenant     : Titan Mining ({ORG_ID})")
    print(f"Admin Email: {EMAIL}")
    print(f"Mobile     : {PHONE}")
    print(f"Temp Pass  : {TEMP_PASSWORD}")
    print("=====================================================\n")

if __name__ == '__main__':
    create_admin()
