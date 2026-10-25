import urllib.request
import json

url = "https://character-service.dndbeyond.com/character/v5/character/131447412"

try:
    print("Fetching character JSON...")
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    )
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        data = json.loads(html)
        
        # Pretty print and write to file
        with open("char_pretty.json", "w", encoding="utf-8") as out:
            json.dump(data, out, indent=2)
            
    print("Success! Wrote char_pretty.json")
except Exception as e:
    print("Error:", e)
