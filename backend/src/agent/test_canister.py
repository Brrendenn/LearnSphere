#!/usr/bin/env python3

import subprocess
import json

def get_canister_info():
    """Get information about the deployed canister"""
    print("Getting canister information...")
    
    # Get canister status
    try:
        result = subprocess.run([
            "dfx", "canister", "status", 
            "uxrrr-q7777-77774-qaaaq-cai", 
            "--network", "local"
        ], capture_output=True, text=True, timeout=10)
        
        print("Canister Status:")
        print(result.stdout)
        if result.stderr:
            print("Errors:")
            print(result.stderr)
    except Exception as e:
        print(f"Error getting status: {e}")

def get_candid_interface():
    """Get the Candid interface of the canister"""
    print("\nGetting Candid interface...")
    
    try:
        result = subprocess.run([
            "dfx", "canister", "metadata", 
            "uxrrr-q7777-77774-qaaaq-cai", 
            "candid:service",
            "--network", "local"
        ], capture_output=True, text=True, timeout=10)
        
        print("Candid Interface:")
        print(result.stdout)
        if result.stderr:
            print("Interface Errors:")
            print(result.stderr)
    except Exception as e:
        print(f"Error getting interface: {e}")

def list_available_methods():
    """Try to discover what methods are available"""
    print("\nTrying to discover available methods...")
    
    # Try some common method names
    test_methods = [
        "getNextQuest",
        "getAllQuests", 
        "completeQuest",
        "greet",  # Common test method
        "__get_candid_interface_tmp_hack"  # Internal method to get interface
    ]
    
    for method in test_methods:
        try:
            print(f"\nTesting method: {method}")
            result = subprocess.run([
                "dfx", "canister", "call", 
                "uxrrr-q7777-77774-qaaaq-cai", 
                method,
                "()",
                "--network", "local"
            ], capture_output=True, text=True, timeout=5)
            
            if result.returncode == 0:
                print(f"✅ {method} works! Output: {result.stdout.strip()}")
            else:
                print(f"❌ {method} failed: {result.stderr.strip()}")
                
        except Exception as e:
            print(f"❌ {method} exception: {e}")

def check_dfx_json():
    """Check dfx.json for canister configuration"""
    print("\nChecking dfx.json configuration...")
    try:
        with open("dfx.json", "r") as f:
            config = json.load(f)
            print("dfx.json contents:")
            print(json.dumps(config, indent=2))
            
            if "canisters" in config:
                print("\nConfigured canisters:")
                for name, canister_config in config["canisters"].items():
                    print(f"  - {name}: {canister_config}")
    except Exception as e:
        print(f"Error reading dfx.json: {e}")

if __name__ == "__main__":
    print("=== COMPREHENSIVE CANISTER DIAGNOSTICS ===")
    
    get_canister_info()
    get_candid_interface() 
    list_available_methods()
    check_dfx_json()
    
    print("\n=== RECOMMENDATIONS ===")
    print("1. Check if your canister name in dfx.json matches what you're calling")
    print("2. Make sure you deployed with: dfx deploy --network local")
    print("3. Try getting the correct canister ID with: dfx canister id <canister_name> --network local")
    print("4. If methods are missing, redeploy your updated Motoko code")