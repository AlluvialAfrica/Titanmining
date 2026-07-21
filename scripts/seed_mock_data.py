import boto3
import json
import uuid
from datetime import datetime, timedelta

SESSION = boto3.Session(profile_name='titanmining', region_name='eu-north-1')
dynamodb = SESSION.client('dynamodb')

ORG_ID = 'org_titanmining'
SITE_ID = 'site_alpha_01'

def seed_data():
    today = datetime.now()
    dates = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]

    # 1. Seed KPI Targets
    kpi_target_table = 'KPITarget-pzm2puthhza2bew52yc5ozkhwm-NONE'
    targets = [
        ('SITE_CONTROLLER', 'daily_gold_recovery_g', 350.0),
        ('SITE_CONTROLLER', 'material_mined_m3', 500.0),
        ('SITE_CONTROLLER', 'fuel_efficiency_l_per_m3', 2.5),
        ('MINING_GEOLOGY_LEAD', 'material_mined_m3', 500.0),
        ('PROCESSING_RECOVERY_LEAD', 'daily_gold_recovery_g', 350.0),
        ('PROCESSING_RECOVERY_LEAD', 'shaking_table_recovery_g', 120.0),
        ('FUEL_ADMIN_LOGISTICS', 'fuel_issued_l', 1200.0),
        ('EXCAVATOR_OPERATOR', 'operating_hours', 10.0),
        ('ENGINE_MECHANIC', 'equipment_availability_pct', 95.0),
        ('SECURITY_MANAGER', 'incidents_logged', 0.0),
        ('FINANCE_MANAGER', 'daily_expenses_usd', 1500.0),
    ]

    for role, key, val in targets:
        dynamodb.put_item(
            TableName=kpi_target_table,
            Item={
                'id': {'S': f"target_{role}_{key}"},
                'orgId': {'S': ORG_ID},
                'siteId': {'S': SITE_ID},
                'role': {'S': role},
                'kpiKey': {'S': key},
                'targetValue': {'N': str(val)},
                'effectiveFrom': {'S': '2026-07-01'},
                'createdBy': {'S': 'user_osman_titan'},
                'createdAt': {'S': '2026-07-01T00:00:00Z'},
                'updatedAt': {'S': '2026-07-01T00:00:00Z'},
            }
        )
    print("KPI Targets seeded.")

    # 2. Seed KPI Entries across past 7 days
    kpi_entry_table = 'KPIEntry-pzm2puthhza2bew52yc5ozkhwm-NONE'
    for idx, d in enumerate(dates):
        gold_val = 340.0 + (idx * 5.0) - (idx % 2 * 12.0)
        mined_val = 480.0 + (idx * 8.0)
        fuel_val = 2.4 + (idx * 0.05)
        kpi_data = {
            'daily_gold_recovery_g': gold_val,
            'material_mined_m3': mined_val,
            'fuel_efficiency_l_per_m3': fuel_val,
            'equipment_availability_pct': 96.5,
            'incidents_logged': 0,
        }
        dynamodb.put_item(
            TableName=kpi_entry_table,
            Item={
                'id': {'S': f"kpi_{d}"},
                'orgId': {'S': ORG_ID},
                'siteId': {'S': SITE_ID},
                'userId': {'S': 'faafan10@gmail.com'},
                'role': {'S': 'SITE_CONTROLLER'},
                'entryDate': {'S': d},
                'shift': {'S': 'SHIFT_1'},
                'kpiData': {'S': json.dumps(kpi_data)},
                'status': {'S': 'SUBMITTED'},
                'submittedAt': {'S': f"{d}T17:30:00Z"},
                'source': {'S': 'WEB'},
                'createdAt': {'S': f"{d}T17:30:00Z"},
                'updatedAt': {'S': f"{d}T17:30:00Z"},
            }
        )
    print("KPI Entries seeded.")

    # 3. Seed Daily Reports for all major templates
    report_table = 'DailyReport-pzm2puthhza2bew52yc5ozkhwm-NONE'
    template_samples = [
        ('TEMPLATE_01', 'SITE_CONTROLLER', 'faafan10@gmail.com', {
            'materialMinedM3': 520, 'materialProcessedM3': 490, 'pitAreaWorked': 'Pit Zone Alpha Bench 2',
            'centrifugeRecoveryG': 195.2, 'shakingTableRecoveryG': 125.4, 'sluiceCleanupG': 48.0,
            'totalGoldRecoveryG': 368.6, 'fuelOpeningStockL': 5000, 'fuelReceivedL': 1200, 'fuelIssuedL': 1150,
            'fuelClosingStockL': 5050, 'fuelVarianceL': 0, 'remarks': 'All plant units operational with high recovery yield.'
        }),
        ('TEMPLATE_02', 'FUEL_ADMIN_LOGISTICS', 'demo.fueladmin@titanmining.com', {
            'shiftName': 'SHIFT_1', 'supervisorName': 'John Kamau', 'totalStaffCount': 42,
            'presentStaffCount': 40, 'absentStaffCount': 2, 'absenteeNames': 'David O. (Sick Leave), Peter M. (Off)'
        }),
        ('TEMPLATE_03', 'EXCAVATOR_OPERATOR', 'demo.operator@titanmining.com', {
            'machineId': 'CAT_1', 'operatorName': 'Emmanuel Mutua', 'openingHours': 12450.5,
            'closingHours': 12461.0, 'hoursWorked': 10.5, 'breakdowns': 'Routine 250h maintenance completed at 14:00.'
        }),
        ('TEMPLATE_04', 'FUEL_ADMIN_LOGISTICS', 'demo.fueladmin@titanmining.com', {
            'machineId': 'CAT_1', 'reportDate': dates[0], 'openingStock': 5000.0, 'received': 1200.0,
            'totalAvailable': 6200.0, 'totalIssued': 1150.0, 'closingStock': 5050.0, 'variance': 0.0
        }),
        ('TEMPLATE_05', 'MINING_GEOLOGY_LEAD', 'demo.geologist@titanmining.com', {
            'pitSection': 'PIT_A', 'benchLevel': 142.5, 'excavatorId': 'CAT 349D',
            'truckLoadsCount': 85, 'estimatedGrade': 0.85, 'geologistRemarks': 'High coarse gold gravel layer exposed on North face.'
        }),
        ('TEMPLATE_06', 'DRUM_PUMP_SUPERVISOR', 'demo.plantlead@titanmining.com', {
            'slurryPumpId': 'PUMP_01', 'suctionPressureBar': 2.4, 'dischargePressureBar': 4.8,
            'pumpingHours': 11.5, 'waterVolumeM3': 3400, 'remarks': 'Smooth water intake from river diversion channel.'
        }),
        ('TEMPLATE_07', 'PROCESSING_RECOVERY_LEAD', 'demo.plantlead@titanmining.com', {
            'concentratorId': 'KNELSON_01', 'feedRateM3H': 45.0, 'washWaterPressureBar': 1.8,
            'cycleTimeMin': 45, 'concentrateRetainedKg': 35.0, 'remarks': 'High concentrate yield.'
        }),
        ('TEMPLATE_08', 'PROCESSING_RECOVERY_LEAD', 'demo.plantlead@titanmining.com', {
            'tableId': 'GEMINI_01', 'strokeLengthMm': 12.0, 'washWaterFlowLpm': 25.0,
            'concentrateWeightG': 125.4, 'tailingsLossG': 0.5, 'remarks': 'Clean separation.'
        }),
        ('TEMPLATE_09', 'PROCESSING_RECOVERY_LEAD', 'demo.plantlead@titanmining.com', {
            'doreBarNo': 'BAR-2026-07-001', 'grossWeightG': 368.6, 'estimatedPurityPct': 92.5,
            'netGoldG': 340.95, 'vaultSealNo': 'SEAL-99841', 'witnessedBy': 'Francis Ochieng (Security Manager)'
        }),
        ('TEMPLATE_10', 'ENGINE_MECHANIC', 'demo.mechanic@titanmining.com', {
            'equipmentType': 'Excavator Sany 500', 'workOrderNo': 'WO-8842', 'faultDescription': 'Hydraulic hose replacement',
            'sparesUsed': 'Hose 1/2" 4000psi (2m)', 'downTimeHours': 1.5, 'mechanicName': 'Peter Njoroge'
        }),
        ('TEMPLATE_11', 'SECURITY_MANAGER', 'demo.security@titanmining.com', {
            'shift': 'DAY_SHIFT', 'personnelEnteredCount': 48, 'vehiclesInspectedCount': 14,
            'goldEscortCompleted': 'YES', 'incidentsReported': 'Nil', 'officerInCharge': 'Francis Ochieng'
        }),
        ('TEMPLATE_12', 'FINANCE_MANAGER', 'demo.finance@titanmining.com', {
            'requisitionNo': 'PR-2026-042', 'department': 'Maintenance', 'itemDescription': 'Engine Oil 15W40 200L Drum',
            'amountUSD': 850.0, 'vendor': 'TotalEnergies', 'approvedBy': 'David Okello'
        }),
        ('TEMPLATE_13', 'SITE_CONTROLLER', 'faafan10@gmail.com', {
            'inspectionArea': 'Processing Plant & Tailings Dam', 'ppeCompliancePct': 100,
            'hazardsIdentified': 'Loose handrail at trommel walkway', 'correctiveActions': 'Welded immediately by maintenance team.'
        }),
        ('TEMPLATE_14', 'FINANCE_MANAGER', 'demo.finance@titanmining.com', {
            'voucherNo': 'PCV-1092', 'payee': 'Local Casuals Food Catering', 'category': 'Staff Welfare',
            'amountUSD': 120.0, 'approvedBy': 'Grace Wanjiru'
        }),
    ]

    for idx, (tid, role, user_email, pdata) in enumerate(template_samples):
        for d in dates[:3]: # Create reports across recent dates
            rep_id = f"report_{tid}_{d}"
            dynamodb.put_item(
                TableName=report_table,
                Item={
                    'id': {'S': rep_id},
                    'orgId': {'S': ORG_ID},
                    'siteId': {'S': SITE_ID},
                    'userId': {'S': user_email},
                    'role': {'S': role},
                    'reportType': {'S': tid},
                    'reportDate': {'S': d},
                    'data': {'S': json.dumps(pdata)},
                    'status': {'S': 'SUBMITTED'},
                    'source': {'S': 'WEB'},
                    'submittedAt': {'S': f"{d}T16:00:00Z"},
                    'createdAt': {'S': f"{d}T16:00:00Z"},
                    'updatedAt': {'S': f"{d}T16:00:00Z"},
                }
            )
    print("Daily Reports seeded across templates.")

if __name__ == '__main__':
    seed_data()
