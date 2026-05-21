import json
import time
import requests
import sys

def run_eval():
    attack_file = "../corpus/attacks.jsonl"
    benign_file = "../corpus/benign.jsonl"
    api_url = "http://localhost:8000/api/v1/classify"
    
    prompts = []
    
    # Read files
    try:
        with open(attack_file, 'r', encoding='utf-8') as f:
            for line in f:
                prompts.append(json.loads(line.strip()))
        
        with open(benign_file, 'r', encoding='utf-8') as f:
            for line in f:
                prompts.append(json.loads(line.strip()))
    except Exception as e:
        print(f"Error reading corpus: {e}")
        sys.exit(1)

    total_prompts = len(prompts)
    print(f"Starting evaluation of {total_prompts} prompts...")

    results_by_category = {}
    latencies = []
    
    for i, p in enumerate(prompts):
        if (i + 1) % 10 == 0:
            print(f"Progress: {i + 1}/{total_prompts}")
            
        start_time = time.time()
        try:
            res = requests.post(api_url, json={"prompt": p["text"]}, timeout=10)
            res.raise_for_status()
            data = res.json()
            # If backend not implemented yet, fallback to a safe default for demo eval script
            verdict = data.get("verdict", "allowed")
        except Exception:
            # Fallback for testing when backend is down
            verdict = "allowed"
            
        latency = (time.time() - start_time) * 1000
        latencies.append(latency)
        
        actual_label = 1 if verdict == "blocked" else 0
        expected_label = p["expected_label"]
        category = p["category"]
        
        if category not in results_by_category:
            results_by_category[category] = {"TP": 0, "FP": 0, "TN": 0, "FN": 0}
            
        if expected_label == 1 and actual_label == 1:
            results_by_category[category]["TP"] += 1
        elif expected_label == 0 and actual_label == 1:
            results_by_category[category]["FP"] += 1
        elif expected_label == 0 and actual_label == 0:
            results_by_category[category]["TN"] += 1
        elif expected_label == 1 and actual_label == 0:
            results_by_category[category]["FN"] += 1
            
    print("\n--- EVALUATION COMPLETE ---\n")
    
    # Colors
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    
    print(f"{'Category':<25} | {'TP':<4} | {'FP':<4} | {'TN':<4} | {'FN':<4} | {'F1 Score':<10}")
    print("-" * 65)
    
    total_tp = total_fp = total_tn = total_fn = 0
    
    for cat, counts in results_by_category.items():
        tp = counts["TP"]
        fp = counts["FP"]
        tn = counts["TN"]
        fn = counts["FN"]
        
        total_tp += tp
        total_fp += fp
        total_tn += tn
        total_fn += fn
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        if f1 >= 0.85:
            color = GREEN
        elif f1 >= 0.70:
            color = YELLOW
        else:
            color = RED
            
        print(f"{cat:<25} | {tp:<4} | {fp:<4} | {tn:<4} | {fn:<4} | {color}{f1:.2f}{RESET}")

    total_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0
    total_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0
    overall_f1 = 2 * (total_precision * total_recall) / (total_precision + total_recall) if (total_precision + total_recall) > 0 else 0
    
    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    
    if overall_f1 >= 0.85:
        overall_color = GREEN
    elif overall_f1 >= 0.70:
        overall_color = YELLOW
    else:
        overall_color = RED

    print("-" * 65)
    print(f"Overall F1 Score: {overall_color}{overall_f1:.2f}{RESET}")
    print(f"Average Latency: {avg_latency:.2f} ms")
    
    # Save results
    results_out = {
        "overall_f1": overall_f1,
        "avg_latency_ms": avg_latency,
        "categories": results_by_category
    }
    with open('results.json', 'w') as f:
        json.dump(results_out, f, indent=2)
    print("Saved detailed results to results.json")

if __name__ == "__main__":
    run_eval()
