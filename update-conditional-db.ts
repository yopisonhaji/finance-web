import { db } from "./src/db/index";
import { pengaturan } from "./src/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    console.log("Conditionally updating deepseek_key in db...");
    const newKey = "sk-1bdd040e90a749b49aed4637c5274001";
    
    try {
        // Fetch all limit_tokens
        const limits = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "limit_token"));
        // Fetch all usage_tokens
        const usages = await db.select().from(pengaturan).where(eq(pengaturan.kunci, "usage_token"));
        
        // Map usage by tenantId
        const usageMap = new Map();
        for (const u of usages) {
            usageMap.set(u.tenantId, parseInt(u.nilai || "0"));
        }
        
        // Find tenants to update
        const tenantsToUpdate = [];
        for (const l of limits) {
            const limitVal = parseInt(l.nilai || "0");
            const usageVal = usageMap.get(l.tenantId) || 0;
            
            if (limitVal > usageVal) {
                tenantsToUpdate.push(l.tenantId);
            }
        }
        
        console.log(`Found ${tenantsToUpdate.length} tenants with remaining tokens.`);
        
        // Update deepseek_key for these tenants
        let updatedCount = 0;
        for (const tId of tenantsToUpdate) {
            if (!tId) continue;
            await db.update(pengaturan)
                .set({ nilai: newKey })
                .where(and(eq(pengaturan.tenantId, tId), eq(pengaturan.kunci, "deepseek_key")));
            updatedCount++;
        }
        
        console.log(`Successfully updated deepseek_key for ${updatedCount} tenants.`);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
main();
