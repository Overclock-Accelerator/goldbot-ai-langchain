import csv
import json

def convert_csv_to_json(csv_file, json_file):
    metals = {}

    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

        # Identify header rows
        header_row = None
        for row in rows:
            if row and row[0] == 'Commodity.Description':
                header_row = row
                break

        if not header_row:
            raise ValueError('Header row with "Commodity.Description" not found.')

        # Extract metals from the header row (Gold, Silver, Palladium, Platinum)
        metals_list = [m for m in header_row[1:5]]
        for metal in metals_list:
            metals[metal] = []

        # Find the index where data starts
        data_start_index = rows.index(header_row) + 1

        # Iterate through data rows
        for row in rows[data_start_index:]:
            if not row or not row[0] or not row[1]:
                continue

            date_code = row[0].strip()
            if 'M' in date_code:
                year, month = date_code.split('M')
                date = f"{month.zfill(2)}/{year}"
            else:
                date = date_code

            for i, metal in enumerate(metals_list, start=1):
                try:
                    price = float(row[i]) if row[i] else None
                except (ValueError, IndexError):
                    price = None
                if price is not None:
                    metals[metal].append({"date": date, "price": price})

    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(metals, f, indent=2)

    print(f"✅ Conversion complete! JSON saved to {json_file}")


if __name__ == '__main__':
    convert_csv_to_json('historical_data.csv', 'precious_metals.json')