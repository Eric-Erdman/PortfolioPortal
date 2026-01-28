import sqlite3

DB_PATH = "src/db/agriculture.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get total row count
cursor.execute("SELECT COUNT(*) FROM animals_raw;")
total_rows = cursor.fetchone()[0]
print(f" Total rows loaded: {total_rows:,}")

# Get a sample of column names
cursor.execute("PRAGMA table_info(animals_raw);")
columns = cursor.fetchall()
print(f"\n Table has {len(columns)} columns:")
for col in columns[:10]:  # Show first 10 columns
    print(f"   - {col[1]} ({col[2]})")
if len(columns) > 10:
    print(f"   ... and {len(columns) - 10} more")

# Show a sample row
cursor.execute("SELECT * FROM animals_raw LIMIT 1;")
sample = cursor.fetchone()
print(f"\n Sample data preview:")
for i, col_info in enumerate(columns[:5]):  # Show first 5 columns
    if i < len(sample):
        print(f"   {col_info[1]}: {sample[i]}")

conn.close()
