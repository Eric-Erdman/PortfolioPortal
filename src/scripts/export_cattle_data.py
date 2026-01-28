"""
Script to export cattle sales data from SQLite database to JSON format
Run this script whenever you need to update the visualization data
"""

import sqlite3
import json
import os

# Path to your database (adjust if needed)
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'db', 'agriculture.db')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'cattle_sales.json')

def export_cattle_data():
    """Export cattle sales data to JSON"""
    
    # SQL Query from your requirements
    query = """
    SELECT SHORT_DESC, DOMAINCAT_DESC, YEAR, VALUE 
    FROM animals_raw 
    WHERE DOMAIN_DESC = 'AREA OPERATED' 
    AND COMMODITY_DESC = 'CATTLE' 
    AND STATE_NAME = 'WISCONSIN' 
    AND SHORT_DESC = 'CATTLE, INCL CALVES - SALES, MEASURED IN $' 
    AND (DOMAINCAT_DESC = 'AREA OPERATED: (1.0 TO 9.9 ACRES)' 
         OR DOMAINCAT_DESC = 'AREA OPERATED: (10.0 TO 49.9 ACRES)'
         OR DOMAINCAT_DESC = 'AREA OPERATED: (2,000 OR MORE ACRES)')
    ORDER BY YEAR
    LIMIT 100
    """
    
    try:
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # This allows us to access columns by name
        cursor = conn.cursor()
        
        # Execute query
        cursor.execute(query)
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        data = []
        for row in rows:
            data.append({
                'SHORT_DESC': row['SHORT_DESC'],
                'DOMAINCAT_DESC': row['DOMAINCAT_DESC'],
                'YEAR': row['YEAR'],
                'VALUE': row['VALUE']
            })
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        
        # Write to JSON file
        with open(OUTPUT_PATH, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f" Successfully exported {len(data)} records to {OUTPUT_PATH}")
        print(f"\nSample data:")
        if data:
            print(json.dumps(data[0], indent=2))
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f" Database error: {e}")
        print(f"Make sure the database exists at: {DB_PATH}")
    except Exception as e:
        print(f" Error: {e}")

if __name__ == "__main__":
    export_cattle_data()
