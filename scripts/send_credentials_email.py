import boto3

SESSION = boto3.Session(profile_name='titanmining', region_name='eu-north-1')
cognito = SESSION.client('cognito-idp')

USER_POOL_ID = 'eu-north-1_AUmaZlQ7a'
EMAIL = 'faafan10@gmail.com'
TEMP_PASSWORD = 'TitanMining2026!'

def send_credentials():
    print(f"Resending Cognito welcome email to {EMAIL}...")
    try:
        # Delete temporary user and recreate without MessageAction='SUPPRESS' so Cognito sends email directly
        cognito.admin_delete_user(UserPoolId=USER_POOL_ID, Username=EMAIL)
        
        resp = cognito.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=EMAIL,
            UserAttributes=[
                {'Name': 'email', 'Value': EMAIL},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'phone_number', 'Value': '+254722828481'},
                {'Name': 'phone_number_verified', 'Value': 'true'},
                {'Name': 'given_name', 'Value': 'Osman'},
                {'Name': 'family_name', 'Value': 'Titan'},
                {'Name': 'custom:role', 'Value': 'SITE_CONTROLLER'},
                {'Name': 'custom:orgId', 'Value': 'org_titanmining'},
                {'Name': 'custom:siteId', 'Value': 'site_alpha_01'},
                {'Name': 'custom:status', 'Value': 'ACTIVE'},
            ],
            TemporaryPassword=TEMP_PASSWORD
            # No MessageAction='SUPPRESS' -> Cognito sends email automatically
        )
        new_sub = [attr['Value'] for attr in resp['User']['Attributes'] if attr['Name'] == 'sub'][0]
        
        cognito.admin_add_user_to_group(
            UserPoolId=USER_POOL_ID,
            Username=EMAIL,
            GroupName='SiteControllers'
        )
        
        # Also update DynamoDB user record ID to new_sub
        dynamodb = SESSION.client('dynamodb')
        user_table = 'User-pzm2puthhza2bew52yc5ozkhwm-NONE'
        dynamodb.put_item(
            TableName=user_table,
            Item={
                'id': {'S': new_sub},
                'orgId': {'S': 'org_titanmining'},
                'firstName': {'S': 'Osman'},
                'lastName': {'S': 'Titan'},
                'email': {'S': EMAIL},
                'mobileNumber': {'S': '+254722828481'},
                'role': {'S': 'SITE_CONTROLLER'},
                'status': {'S': 'ACTIVE'},
                'cognitoSub': {'S': new_sub},
                'createdAt': {'S': '2026-07-21T15:00:00Z'},
                'updatedAt': {'S': '2026-07-21T15:00:00Z'},
            }
        )
        print(f"Cognito welcome email dispatched to {EMAIL} with temporary password: {TEMP_PASSWORD}")
    except Exception as e:
        print(f"Error sending email: {e}")

if __name__ == '__main__':
    send_credentials()
