#!/usr/bin/env python3
"""
Simple test script for the Atlas FastAPI backend
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🧪 Testing {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"📊 Response: {json.dumps(result, indent=2)[:200]}...")
            except:
                print(f"📊 Response: {response.text[:200]}...")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

def main():
    print("🚀 Testing Atlas FastAPI Backend")
    print("=" * 50)
    
    # Test health endpoint
    test_endpoint("/health")
    
    # Test root endpoint
    test_endpoint("/")
    
    # Test mock companies
    test_endpoint("/api/mock/companies")
    
    # Test FMP API (if available)
    test_endpoint("/api/finance/profile/AAPL")
    
    # Test company search
    test_endpoint("/api/finance/search?query=Apple")
    
    # Test clinical trials (mock)
    test_endpoint("/api/clinical-trials/Pfizer")
    
    # Test molecules (mock)
    test_endpoint("/api/molecules/aspirin")
    
    # Test company ranking
    test_endpoint("/api/ranking/company", "POST", {
        "company_name": "Apple Inc.",
        "ticker": "AAPL"
    })
    
    print("\n🎯 Testing complete!")

if __name__ == "__main__":
    main()



