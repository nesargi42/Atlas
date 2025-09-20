#!/usr/bin/env python3

import asyncio
import httpx
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

FMP_API_KEY = os.getenv("FMP_API_KEY")
FMP_BASE_URL = "https://financialmodelingprep.com/stable"

async def test_financial_data():
    """Test the financial data fetching logic"""
    
    if not FMP_API_KEY:
        print("❌ FMP_API_KEY not found in environment")
        return
    
    print(f"✅ FMP_API_KEY found: {FMP_API_KEY[:10]}...")
    
    ticker = "AAPL"
    
    try:
        async with httpx.AsyncClient() as client:
            # Test profile endpoint
            profile_url = f"{FMP_BASE_URL}/profile?symbol={ticker}&apikey={FMP_API_KEY}"
            print(f"🔍 Testing profile URL: {profile_url}")
            
            profile_response = await client.get(profile_url)
            profile_response.raise_for_status()
            
            profile_data = profile_response.json()
            print(f"✅ Profile response structure: {type(profile_data)}")
            print(f"✅ Profile keys: {list(profile_data.keys()) if isinstance(profile_data, dict) else 'Not a dict'}")
            
            if isinstance(profile_data, dict) and "value" in profile_data:
                profile = profile_data["value"][0]
                print(f"✅ Profile data keys: {list(profile.keys())}")
                print(f"✅ Market Cap: {profile.get('marketCap', 'Not found')}")
                print(f"✅ Price: {profile.get('price', 'Not found')}")
            else:
                print("❌ Profile data structure is not as expected")
                print(f"❌ Actual structure: {profile_data}")
            
            # Test income statement
            income_url = f"{FMP_BASE_URL}/income-statement?symbol={ticker}&apikey={FMP_API_KEY}"
            print(f"🔍 Testing income URL: {income_url}")
            
            income_response = await client.get(income_url)
            income_response.raise_for_status()
            
            income_json = income_response.json()
            print(f"✅ Income response structure: {type(income_json)}")
            
            if isinstance(income_json, dict) and "value" in income_json:
                income_data = income_json["value"][0]
                print(f"✅ Income data keys: {list(income_data.keys())}")
                print(f"✅ EPS: {income_data.get('eps', 'Not found')}")
                print(f"✅ Revenue: {income_data.get('revenue', 'Not found')}")
            else:
                print("❌ Income data structure is not as expected")
                print(f"❌ Actual structure: {income_json}")
                
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_financial_data())



