import pandas as pd
import sqlite3

DB_PATH = "src/db/agriculture.db"
DATA_PATH = "src/data/raw/qs.animals_products_20260124.txt"

conn = sqlite3.connect(DB_PATH)

chunks = pd.read_csv(
    DATA_PATH,
    sep="\t",
    chunksize=100_000,
    low_memory=False
)

for i, chunk in enumerate(chunks):
    chunk.to_sql(
        "animals_raw",
        conn,
        if_exists="append",
        index=False
    )
    print(f"Loaded chunk {i}")

conn.close()