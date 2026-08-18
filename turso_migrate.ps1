$url = "https://finance-db-yopish.aws-ap-northeast-1.turso.io/v2/pipeline"
$token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODU4MTIzNTEsImlkIjoiMDE5ZmNhYjItZTcwMS03ZmYzLWI4NDUtYjJmMmJmOTczZWY4Iiwia2lkIjoiRl9rZ3V0Y3UxQXJCQ2x0QUozVEd2U2xTdWdCSExXVHNXMVI4ek42bWxtMCIsInJpZCI6ImQ5NDc0MzZmLWQ4MjEtNDFhOS1hMTZkLTg2NTRiOTRjNTQ3MyJ9.E4Wsg_gINWG_uf_PnhEbSSSr2AHnSsNVe2Vevnj8B7pVOfJktR8F0cVvWI4j7nRMk0cIBinvs7W7FEjTCVAXBA"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body1 = @{
    requests = @(
        @{
            type = "execute"
            stmt = @{
                sql = "CREATE TABLE IF NOT EXISTS ai_settings (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, tenant_id text NOT NULL UNIQUE, nama_usaha text, sapaan_pelanggan text DEFAULT 'Kak', gaya_bahasa text DEFAULT 'Formal', aturan_khusus text, basa_basi text, created_at text DEFAULT CURRENT_TIMESTAMP, updated_at text DEFAULT CURRENT_TIMESTAMP);"
            }
        },
        @{
            type = "execute"
            stmt = @{
                sql = "CREATE TABLE IF NOT EXISTS ai_knowledge_base (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, tenant_id text NOT NULL, sumber text NOT NULL, konten text NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP);"
            }
        },
        @{
            type = "close"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body1
