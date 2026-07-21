import boto3
import json

SESSION = boto3.Session(profile_name='titanmining', region_name='eu-north-1')
cognito = SESSION.client('cognito-idp')
dynamodb = SESSION.client('dynamodb')

USER_POOL_ID = 'eu-north-1_AUmaZlQ7a'
ORG_ID = 'org_titanmining'
SITE_ID = 'site_alpha_01'
PASSWORD = 'TitanMining2026!'

DEMO_USERS = [
    {
        'email': 'faafan10@gmail.com',
        'phone': '+254722828481',
        'firstName': 'Osman',
        'lastName': 'Admin',
        'role': 'SITE_CONTROLLER',
        'group': 'SiteControllers',
    },
    {
        'email': 'demo.minemanager@titanmining.com',
        'phone': '+254700000001',
        'firstName': 'David',
        'lastName': 'Okello',
        'role': 'MINE_MANAGER',
        'group': 'Management',
    },
    {
        'email': 'demo.geologist@titanmining.com',
        'phone': '+254700000002',
        'firstName': 'Sarah',
        'lastName': 'Kiprop',
        'role': 'MINING_GEOLOGY_LEAD',
        'group': 'DepartmentLeads',
    },
    {
        'email': 'demo.plantlead@titanmining.com',
        'phone': '+254700000003',
        'firstName': 'Kwame',
        'lastName': 'Mensah',
        'role': 'PROCESSING_RECOVERY_LEAD',
        'group': 'DepartmentLeads',
    },
    {
        'email': 'demo.fueladmin@titanmining.com',
        'phone': '+254700000004',
        'firstName': 'John',
        'lastName': 'Kamau',
        'role': 'FUEL_ADMIN_LOGISTICS',
        'group': 'SupportStaff',
    },
    {
        'email': 'demo.operator@titanmining.com',
        'phone': '+254700000005',
        'firstName': 'Emmanuel',
        'lastName': 'Mutua',
        'role': 'EXCAVATOR_OPERATOR',
        'group': 'Operators',
    },
    {
        'email': 'demo.mechanic@titanmining.com',
        'phone': '+254700000006',
        'firstName': 'Peter',
        'lastName': 'Njoroge',
        'role': 'ENGINE_MECHANIC',
        'group': 'Maintenance',
    },
    {
        'email': 'demo.security@titanmining.com',
        'phone': '+254700000007',
        'firstName': 'Francis',
        'lastName': 'Ochieng',
        'role': 'SECURITY_MANAGER',
        'group': 'Security',
    },
    {
        'email': 'demo.finance@titanmining.com',
        'phone': '+254700000008',
        'firstName': 'Grace',
        'lastName': 'Wanjiru',
        'role': 'FINANCE_MANAGER',
        'group': 'Finance',
    },
]

def provision():
    user_table = 'User-pzm2puthhza2bew52yc5ozkhwm-NONE'
    for u in DEMO_USERS:
        email = u['email']
        print(f"Provisioning demo account for {email} ({u['role']})...")
        try:
            # Check existing
            try:
                resp = cognito.admin_get_user(UserPoolId=USER_POOL_ID, Username=email)
                user_sub = [attr['Value'] for attr in resp['UserAttributes'] if attr['Name'] == 'sub'][0]
            except cognito.exceptions.UserNotFoundException:
                resp = cognito.admin_create_user(
                    UserPoolId=USER_POOL_ID,
                    Username=email,
                    UserAttributes=[
                        {'Name': 'email', 'Value': email},
                        {'Name': 'email_verified', 'Value': 'true'},
                        {'Name': 'phone_number', 'Value': u['phone']},
                        {'Name': 'phone_number_verified', 'Value': 'true'},
                        {'Name': 'given_name', 'Value': u['firstName']},
                        {'Name': 'family_name', 'Value': u['lastName']},
                        {'Name': 'custom:role', 'Value': u['role']},
                        {'Name': 'custom:orgId', 'Value': ORG_ID},
                        {'Name': 'custom:siteId', 'Value': SITE_ID},
                        {'Name': 'custom:status', 'Value': 'ACTIVE'},
                    ],
                    TemporaryPassword=PASSWORD,
                    MessageAction='SUPPRESS'
                )
                user_sub = [attr['Value'] for attr in resp['User']['Attributes'] if attr['Name'] == 'sub'][0]

            # Set permanent password
            cognito.admin_set_user_password(
                UserPoolId=USER_POOL_ID,
                Username=email,
                Password=PASSWORD,
                Permanent=True
            )

            # Add to group
            if u.get('group'):
                try:
                    cognito.admin_add_user_to_group(
                        UserPoolId=USER_POOL_ID,
                        Username=email,
                        GroupName=u['group']
                    )
                except Exception as ge:
                    print(f"Group warning for {email}: {ge}")

            # Save to DynamoDB
            dynamodb.put_item(
                TableName=user_table,
                Item={
                    'id': {'S': user_sub},
                    'orgId': {'S': ORG_ID},
                    'firstName': {'S': u['firstName']},
                    'lastName': {'S': u['lastName']},
                    'email': {'S': email},
                    'mobileNumber': {'S': u['phone']},
                    'role': {'S': u['role']},
                    'status': {'S': 'ACTIVE'},
                    'cognitoSub': {'S': user_sub},
                    'createdAt': {'S': '2026-07-21T15:00:00Z'},
                    'updatedAt': {'S': '2026-07-21T15:00:00Z'},
                }
            )
            print(f"  SUCCESS: {email} created & confirmed.")
        except Exception as e:
            print(f"  ERROR for {email}: {e}")

if __name__ == '__main__':
    provision()
