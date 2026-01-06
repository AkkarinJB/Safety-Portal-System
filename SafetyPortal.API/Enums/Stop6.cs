namespace SafetyPortal.API.Enums
{
    public enum Stop6
    {
        Machine = 1,           // อันตรายจากเครื่องจักร
        FallingObject = 2,     // อันตรายจากวัตถุหนักตกใส่
        Vehicle = 3,           // อันตรายจากยานพาหนะ
        FallFromHeight = 4,   // อันตรายจากการตกจากที่สูง
        Electricity = 5,       // อันตรายจากกระแสไฟฟ้า
        Other = 6              
    }
}

